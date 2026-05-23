import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { CONFIG } from "../config";
import { generateToken } from "../auth";

export async function login(req: Request, res: Response) {
  const { username, password } = req.body;

  if (username !== CONFIG.ADMIN_USERNAME)
    return res.status(401).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, CONFIG.ADMIN_PASSWORD_HASH);
  if (!match) return res.status(401).json({ message: "Invalid credentials" });

  const token = generateToken(username);

  // Set HttpOnly cookie with the token
  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // true in production
    sameSite: "lax",
    path: "/",
    maxAge: 1000 * 60 * 60 * 3, // 3h
  });

  res.json({ success: true });
}

export function secure(req: Request, res: Response) {
  res.json({ message: "Access granted", user: (req as any).user });
}

export function logout(req: Request, res: Response) {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/", 
  });

  res.json({ success: true, message: "Logged out successfully" });
}
