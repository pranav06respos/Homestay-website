import { Router } from "express";
import type { IRouter } from "express";
import { AdminLoginBody } from "@workspace/api-zod";
import { signToken, verifyToken } from "../lib/jwt";

const router: IRouter = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

router.post("/auth/login", async (req, res): Promise<void> => {
  if (!ADMIN_PASSWORD) {
    res.status(503).json({ error: "Admin authentication not configured" });
    return;
  }
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  if (parsed.data.password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }
  const token = signToken({ admin: true }, "24h");
  res.json({ authenticated: true, token });
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  // Stateless logout – client discards token
  res.json({ message: "Logged out" });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const token = authHeader.slice('Bearer '.length).trim();
  try {
    const payload = verifyToken(token) as { admin?: boolean };
    if (payload.admin) {
      res.json({ authenticated: true });
    } else {
      res.status(401).json({ error: "Not authenticated" });
    }
  } catch (err) {
    res.status(401).json({ error: "Not authenticated" });
  }
});

export default router;
