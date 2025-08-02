declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        username: string;
      };
    }
  }
}

import { NextFunction, Request, Response } from "express";
import { prisma } from "../index";

export const apiKeyAuthorization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    var authHeader: string | undefined = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ message: "Unauthorized. API Key not provided." });
      return;
    }
  } catch (error) {
    console.error("Error fetching apiKey from header:", error);
    res.status(401).json({ message: "Unauthorized. API Key not provided." });
    return;
  }
  try {
    const apiKey = authHeader.split(" ")[1];
    if (!apiKey) {
      res.status(401).json({ message: "Unauthorized. API Key not provided." });
      return;
    }
    const isValid = await prisma.apiKey.findUnique({
      where: {
        apikey: apiKey,
      },
      include: {
        user: true,
      },
    });
    if (!isValid) {
      res.status(401).json({ message: "Unauthorized. API Key is not valid." });
      return;
    }
    req.user = {
      userId: isValid.user.id,
      username: isValid.user.username,
    };
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(401).json({ message: "Unauthorized. Token not valid." });
    return;
  }
};
