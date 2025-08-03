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
  javascript: ["node", "/app/index.js"],
  python: ["python", "/app/index.py"],
};

export const dockerClient = axios.create({
  baseURL: process.env.DOCKER_ENGINE_BASE_URL!,
  socketPath: process.env.DOCKER_ENGINE_SOCKET_PATH!,
});

export const configMapManifest = {
  apiVersion: "v1",
  kind: "ConfigMap",
  metadata: {
    name: "file-config-map",
  },
  data: {},
};

export const functionPodManifest = {
  apiVersion: "v1",
  kind: "Pod",
  metadata: {
    name: "file-runner-pod",
  },
  spec: {
    restartPolicy: "Never",
    containers: [
      {
        name: "file-runner",
        volumeMounts: [
          {
            name: "script-volume",
            mountPath: "/app",
          },
        ],
      },
    ],
    volumes: [
      {
        name: "script-volume",
        configMap: {
          name: "file-config-map",
        },
      },
    ],
  },
};

export const podManifest = {
  apiVersion: "v1",
  kind: "Pod",
  metadata: {},
  spec: {
    containers: [
      {
        name: "user-container",
      },
    ],
  },
};
