import express from "express";
import dotenv from "dotenv";
import { FunctionRequestSchema, PodRequestSchema } from "./lib/zod-schemas";
import {
  configMapManifest,
  functionPodManifest,
  languageToCmdMapper,
  languageToExtensionMapper,
  languageToImageMapper,
  podManifest,
} from "./lib/utils";
import { PrismaClient } from "../generated/prisma";
import { apiKeyAuthorization } from "./lib/middleware";
import k8s from "@kubernetes/client-node";
import crypto from "crypto";
dotenv.config();

const kc = new k8s.KubeConfig();
kc.loadFromCluster();

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

const app = express();
const PORT = parseInt(process.env.PORT || "3001");
export const prisma = new PrismaClient();

app.use(express.json());

app.post("/function", apiKeyAuthorization, async (req, res) => {
  const validatedData = FunctionRequestSchema.safeParse(req.body);
  if (!validatedData.success) {
    res.status(400).json({ message: "Validation Failed" });
    console.log(JSON.stringify(validatedData.error));
    return;
  }
  const language = validatedData.data.language;
  const functionCall = `${validatedData.data.functionName}(${Object.entries(
    validatedData.data.args
  )
    .map(([key, value]) =>
      typeof value === "string" ? `"${value}"` : `${value}`
    )
    .join(", ")})`;

  const codeWithCall = `${validatedData.data.code}
    
if __name__ == "__main__":
  print("=> [CONTAINER LOGS]")
  result = ${functionCall}
  print("=> [RETURNED VALUE]")
  print(result)`;

  try {
    let temp: any = { ...configMapManifest };
    temp.data[`index.${languageToExtensionMapper[language]}`] = codeWithCall;
    await k8sApi.createNamespacedConfigMap({
      namespace: "default",
      body: temp,
    });
    let temp2: any = { ...functionPodManifest };
    temp2.spec.containers[0]["image"] = languageToImageMapper[language];
    temp2.spec.containers[0]["command"] = languageToCmdMapper[language];
    await k8sApi.createNamespacedPod({
      namespace: "default",
      body: temp2,
    });
  } catch (error) {
    console.error("Error creating ConfigMap or starting the pod:", error);
    res
      .status(500)
      .json({ message: "Error creating container to run the function" });
  }
  let count = 0;
  while (count <= 5) {
    const podStatus = await k8sApi.readNamespacedPodStatus({
      namespace: "default",
      name: functionPodManifest.metadata.name,
    });
    if (podStatus.status?.phase === "Succeeded") break;
    count++;
    await new Promise((r) => setTimeout(r, 2000));
  }
  const logs = await k8sApi.readNamespacedPodLog({
    name: "file-runner-pod",
    namespace: "default",
  });
  await k8sApi.deleteNamespacedConfigMap({
    name: "file-config-map",
    namespace: "default",
  });
  await k8sApi.deleteNamespacedPod({
    name: "file-runner-pod",
    namespace: "default",
  });
  await prisma.functionCall.create({
    data: {
      userId: req.user?.userId!,
      name: validatedData.data.functionName,
      logs,
    },
  });
  res.json({ success: true, result: logs });
  return;
});

app.post("/pod", apiKeyAuthorization, async (req, res) => {
  const validatedData = PodRequestSchema.safeParse(req.body);
  if (!validatedData.success) {
    res.status(400).json({ message: "Validation Failed" });
    console.log(JSON.stringify(validatedData.error));
    return;
  }

  try {
    let temp: any = { ...podManifest };
    var podName = crypto.randomBytes(8).toString("hex");
    temp.metadata["name"] = podName;
    temp.spec.containers[0]["image"] = validatedData.data.image;
    temp.spec.containers[0]["ports"] = validatedData.data.ports.map((p) => {
      return { containerPort: p };
    });
    var pod = await k8sApi.createNamespacedPod({
      namespace: "default",
      body: temp,
    });
  } catch (error) {
    console.error("Error creating the pod:", error);
    res.status(500).json({ message: "Error creating the pod" });
    return;
  }
  let count = 0;
  while (count <= 5) {
    const podStatus = await k8sApi.readNamespacedPodStatus({
      namespace: "default",
      name: podName,
    });
    if (podStatus.status?.phase === "Running") break;
    count++;
    await new Promise((r) => setTimeout(r, 2000));
  }
  var pod = await k8sApi.readNamespacedPod({
    namespace: "default",
    name: podName,
  });
  const url = `${process.env.POD_BASE_URL!}/${podName}`;
  await prisma.pod.create({
    data: {
      userId: req.user?.userId!,
      name: podName,
      image: validatedData.data.image,
      url,
      status: pod.status?.phase === "Running" ? "RUNNING" : "STOPPED",
    },
  });
  await prisma.podIP.create({
    data: {
      podName,
      ip: `${pod.status?.podIP}:${validatedData.data.ports[0]}`,
    },
  });
  res.json({
    containerId: podName,
    url,
  });
});

app.delete("/pod/:podName", apiKeyAuthorization, async (req, res) => {
  try {
    await k8sApi.deleteNamespacedPod({
      name: req.params.podName,
      namespace: "default",
    });
  } catch (error) {
    console.error("Error deleting the pod:", error);
    res.status(500).json({ message: "Error deleting the pod" });
    return;
  }
  await prisma.pod.update({
    where: {
      name: req.params.podName,
    },
    data: {
      url: "-",
      status: "STOPPED",
    },
  });
  await prisma.podIP.delete({
    where: {
      podName: req.params.podName,
    },
  });
  res.json({ message: "Container stopped" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} ...`);
});
