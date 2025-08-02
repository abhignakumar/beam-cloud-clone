import express from "express";
import dotenv from "dotenv";
import { FunctionRequestSchema, PodRequestSchema } from "./lib/zod-schemas";
import fs from "fs";
import {
  dockerClient,
  languageToCmdMapper,
  languageToExtensionMapper,
  languageToImageMapper,
} from "./lib/utils";
import { PrismaClient } from "./generated/prisma";
import { apiKeyAuthorization } from "./lib/middleware";
dotenv.config();

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
  const filePath = `${__dirname}/function-container/${language}/index.${languageToExtensionMapper[language]}`;
  try {
    fs.writeFileSync(filePath, "");
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

    fs.writeFileSync(filePath, codeWithCall);
  } catch (err) {
    console.error("Error writing to file:", err);
  }
  const response = await dockerClient.post(
    "/containers/create",
    {
      Image: languageToImageMapper[language],
      Cmd: languageToCmdMapper[language],
      WorkingDir: "/app",
      HostConfig: {
        Binds: [`${__dirname}/function-container/${language}/:/app`],
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  await dockerClient.post(`/containers/${response.data.Id}/start`);
  await new Promise((r) => setTimeout(r, 1000));
  const response2 = await dockerClient.get(
    `/containers/${response.data.Id}/logs?stdout=true&stderr=true`
  );
  await dockerClient.delete(`/containers/${response.data.Id}`);
  try {
    fs.writeFileSync(filePath, "");
  } catch (err) {
    console.error("Error writing to file:", err);
  }
  await prisma.functionCall.create({
    data: {
      userId: req.user?.userId!,
      name: validatedData.data.functionName,
      logs: response2.data.replace(/\0/g, ""),
    },
  });
  res.json({ success: true, result: response2.data });
  return;
});

app.post("/pod", apiKeyAuthorization, async (req, res) => {
  const validatedData = PodRequestSchema.safeParse(req.body);
  if (!validatedData.success) {
    res.status(400).json({ message: "Validation Failed" });
    console.log(JSON.stringify(validatedData.error));
    return;
  }

  const portBindings = validatedData.data.ports.reduce<
    Record<string, { HostPort: string }[]>
  >((acc, p) => {
    acc[`${p}/tcp`] = [{ HostPort: p.toString() }];
    return acc;
  }, {});

  const image = validatedData.data.image.split(":")[0];
  const tag = validatedData.data.image.split(":")[1];

  await dockerClient.post(`/images/create?fromImage=${image}&tag=${tag}`);
  const response = await dockerClient.post(
    "/containers/create",
    {
      Image: validatedData.data.image,
      HostConfig: {
        PortBindings: portBindings,
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  await dockerClient.post(`/containers/${response.data.Id}/start`);
  await new Promise((r) => setTimeout(r, 1000));
  const response2 = await dockerClient.get(
    `/containers/${response.data.Id}/json`
  );
  const url = `${process.env.POD_BASE_URL!}:${
    portBindings[Object.keys(portBindings)[0]][0].HostPort
  }`;
  await prisma.pod.create({
    data: {
      userId: req.user?.userId!,
      dockerContainerId: response.data.Id,
      image: validatedData.data.image,
      url,
      status: response2.data.State.Running ? "RUNNING" : "STOPPED",
    },
  });
  res.json({
    containerId: response.data.Id,
    url,
  });
});

app.delete("/pod/:dockerContainerId", apiKeyAuthorization, async (req, res) => {
  const response = await dockerClient.get(
    `/containers/${req.params.dockerContainerId}/json`
  );
  await dockerClient.delete(
    `/containers/${req.params.dockerContainerId}?v=true&force=true`
  );
  await dockerClient.delete(`/images/${response.data.Image}?force=true`);
  await prisma.pod.update({
    where: {
      dockerContainerId: req.params.dockerContainerId,
    },
    data: {
      status: "STOPPED",
    },
  });
  res.json({ message: "Container stopped" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} ...`);
});
