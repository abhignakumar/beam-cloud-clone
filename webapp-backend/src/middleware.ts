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
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const userAuthentication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    var token: string | undefined = req.cookies.auth_token;
    if (!token) {
      res.status(401).json({ message: "Unauthorized. Token not provided." });
      return;
    }
  } catch (error) {
    console.error("Error fetching token from header:", error);
    res.status(401).json({ message: "Unauthorized. Token not provided." });
    return;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    if (!(decoded as JwtPayload).userId || !(decoded as JwtPayload).username) {
      res
        .status(401)
        .json({ message: "Unauthorized. JWT Payload is not valid." });
      return;
    }
    const userId: string = (decoded as JwtPayload).userId;
    const username: string = (decoded as JwtPayload).username;
    req.user = {
      userId,
      username,
    };
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(401).json({ message: "Unauthorized. Token not valid." });
    return;
  }
};
