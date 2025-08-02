import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const languageToExtensionMapper = {
  javascript: "js",
  python: "py",
};

export const languageToImageMapper = {
  javascript: "node:20-alpine",
  python: "python:3.12-alpine",
};

export const languageToCmdMapper = {
  javascript: ["node", "index.js"],
  python: ["python", "index.py"],
};

export const dockerClient = axios.create({
  baseURL: process.env.DOCKER_ENGINE_BASE_URL!,
  socketPath: process.env.DOCKER_ENGINE_SOCKET_PATH!,
});
