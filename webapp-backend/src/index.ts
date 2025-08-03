import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "../generated/prisma";
import jwt from "jsonwebtoken";
import { userAuthentication } from "./middleware";
import crypto from "crypto";
import cors from "cors";
import cookieParser from "cookie-parser";
import axios from "axios";
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3000");
const prisma = new PrismaClient();

app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_BASE_URL!,
    credentials: true,
  })
);
app.use(cookieParser());

app.post("/login", async (req, res) => {
  const username = req.body.username as string;
  const password = req.body.password as string;

  const user = await prisma.user.findUnique({
    where: {
      username,
      password,
    },
  });
  if (!user) {
    res.status(401).json({ message: "Username or Password are wrong" });
    return;
  }
  const token = jwt.sign(
    { userId: user.id, username: user.username },
    process.env.JWT_SECRET!
  );
  res.cookie("auth_token", token, { httpOnly: true });
  res.json({ message: "Login successful" });
});

app.post("/signup", async (req, res) => {
  const username = req.body.username as string;
  const password = req.body.password as string;

  const existingUser = await prisma.user.findUnique({
    where: {
      username,
    },
  });
  if (existingUser) {
    res.status(400).json({ message: "Username already taken" });
    return;
  }
  const user = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        username,
        password,
      },
    });
    const apikey = crypto.randomBytes(32).toString("base64url");
    await tx.apiKey.create({
      data: {
        apikey,
        userId: user.id,
      },
    });
    return user;
  });

  const token = jwt.sign(
    { userId: user.id, username: user.username },
    process.env.JWT_SECRET!
  );
  res.cookie("auth_token", token, { httpOnly: true });
  res.status(201).json({ message: "Signup successful" });
});

app.get("/logout", (req, res) => {
  res.clearCookie("auth_token");
  res.json({ message: "Logged out" });
});

app.get("/auth/check", async (req, res) => {
  const token = req.cookies.auth_token;
  if (!token) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    const user = await prisma.user.findUnique({
      where: { id: (decoded as jwt.JwtPayload).userId },
    });
    if (!user) {
      res.status(401).json({ message: "User does not exist" });
      return;
    }
    res.json({ authenticated: true, user: decoded });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

app.get("/function", userAuthentication, async (req, res) => {
  const functionCalls = await prisma.functionCall.findMany({
    where: {
      userId: req.user?.userId,
    },
  });
  res.json({ functionCalls });
});

app.get("/pod", userAuthentication, async (req, res) => {
  const pods = await prisma.pod.findMany({
    where: {
      userId: req.user?.userId,
    },
  });
  res.json({ pods });
});

app.get("/apikey", userAuthentication, async (req, res) => {
  const apikeys = await prisma.apiKey.findMany({
    where: {
      userId: req.user?.userId,
    },
  });
  res.json({ apikeys: apikeys.map((apikey) => apikey.apikey) });
});

app.delete("/pod/:podName", userAuthentication, async (req, res) => {
  const container = await prisma.pod.findUnique({
    where: { name: req.params.podName },
  });
  if (!container) {
    res
      .status(400)
      .json({ message: "No container found with the given Container ID" });
    return;
  }
  if (container.userId !== req.user?.userId) {
    res.status(401).json({
      message:
        "Unauthorized. Cannot delete/stop containers which you have not created.",
    });
    return;
  }
  const apiKey = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: {
      apiKeys: {
        select: {
          apikey: true,
        },
      },
    },
  });
  try {
    await axios.delete(
      `${process.env.MAIN_SERVER_BASE_URL!}/pod/${req.params.podName}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey?.apiKeys[0].apikey}`,
        },
      }
    );
    res.json({ message: "Container Stopped" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete/stop the container" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} ...`);
});
