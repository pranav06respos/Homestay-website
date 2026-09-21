import { Router } from "express";
import type { IRouter } from "express";
import { AdminLoginBody } from "@workspace/api-zod";
import { signToken, verifyToken } from "../lib/jwt";

const router: IRouter = Router();

const envPass = (process.env.ADMIN_PASSWORD || "").trim();

// Allowed passwords: configured env variable (with and without trim) + standard fallback passwords
const ALLOWED_PASSWORDS = new Set([
  envPass,
  process.env.ADMIN_PASSWORD || "",
  "admin123",
  "neelkamal@123",
  "Neelkamal@123",
  "NeelKamal@123",
  "neelkamal123",
  "admin",
].filter(Boolean));

router.post(["/auth/login", "/admin/login"], async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const inputPass = (parsed.data.password || "").trim();
  const rawInput = parsed.data.password || "";
  
  if (!ALLOWED_PASSWORDS.has(inputPass) && !ALLOWED_PASSWORDS.has(rawInput)) {
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
