import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "../generated/prisma";
import { createProxyMiddleware } from "http-proxy-middleware";
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3002");
const prisma = new PrismaClient();

app.use(express.json());

app.use("/:podName", async (req, res, next) => {
  try {
    const podName = req.params.podName;
    const podIP = await prisma.podIP.findUnique({
      where: {
        podName,
      },
    });
    if (!podIP) {
      res.send("No container running at this URL");
      return;
    }

    (req as any).targetIP = podIP.ip;
    next();
  } catch (err) {
    console.error("Error while checking the pod IP:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.use("/:podName", (req, res, next) => {
  const targetIP = (req as any).targetIP;
  if (!targetIP) {
    res.status(500).send("Missing target IP");
    return;
  }
  const proxy = createProxyMiddleware({
    target: `http://${targetIP}`,
    changeOrigin: true,
  });
  return proxy(req, res, next);
});

app.get("/", (req, res) => {
  res.send("Pass the container ID as param to reach the pod");
  return;
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} ...`);
});
