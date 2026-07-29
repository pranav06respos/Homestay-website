import { Router } from "express";
import type { IRouter } from "express";
import { AdminLoginBody } from "@workspace/api-zod";

const router: IRouter = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

router.post("/auth/login", async (req, res): Promise<void> => {
  if (!ADMIN_PASSWORD) {
    res.status(503).json({ error: "Admin authentication is not configured" });
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

  const session = req.session as { admin?: boolean };
  session.admin = true;

  res.json({ authenticated: true, message: "Logged in successfully" });
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  req.session.destroy(() => {
    res.json({ authenticated: false, message: "Logged out" });
  });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const session = req.session as { admin?: boolean };
  if (session?.admin) {
    res.json({ authenticated: true });
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

export default router;
