import { Router } from "express";
import type { IRouter } from "express";
import { eq, ilike } from "drizzle-orm";
import { db, mediaTable } from "@workspace/db";
import {
  GetMediaParams,
  UpdateMediaParams,
  UpdateMediaBody,
  DeleteMediaParams,
  UpdateMediaUsageParams,
  UpdateMediaUsageBody,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const router: IRouter = Router();

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const hash = crypto.randomBytes(8).toString("hex");
    cb(null, `${hash}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

function normalizeMediaUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.pathname.startsWith("/api/uploads/")) return parsed.pathname;
  } catch {
    // Keep existing relative or legacy values unchanged.
  }
  return url;
}

function parseId(raw: string | string[]): number {
  const s = Array.isArray(raw) ? raw[0] : raw;
  return parseInt(s, 10);
}

// GET /media
router.get("/media", requireAdmin, async (req, res): Promise<void> => {
  try {
    let query = db.select().from(mediaTable).$dynamic();

    if (req.query.search) {
      query = query.where(ilike(mediaTable.originalName, `%${req.query.search}%`));
    }

    const media = await query.orderBy(mediaTable.createdAt);
    // Safely convert createdAt — Supabase may return string or Date object
    res.json(media.map((m) => ({ ...m, url: normalizeMediaUrl(m.url), createdAt: m.createdAt ? new Date(m.createdAt).toISOString() : null })));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Failed to load media", details: message });
  }
});

// POST /media/upload
router.post("/media/upload", requireAdmin, upload.single("file"), async (req, res): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  // Keep media same-origin so proxied previews and deployments resolve correctly.
  const url = `/api/uploads/${req.file.filename}`;
  const altText = req.body.altText as string | undefined;

  // Read file data into Base64 for persistent database storage in PostgreSQL
  const fileBuffer = fs.readFileSync(req.file.path);
  const base64Data = fileBuffer.toString("base64");

  const [media] = await db
    .insert(mediaTable)
    .values({
      filename: req.file.filename,
      originalName: req.file.originalname,
      url,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      altText: altText ?? null,
      data: base64Data,
      usedIn: [],
    })
    .returning();

  res.status(201).json({ ...media, createdAt: media.createdAt.toISOString() });
});

// GET /media/:id
router.get("/media/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = GetMediaParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [media] = await db.select().from(mediaTable).where(eq(mediaTable.id, params.data.id));
  if (!media) {
    res.status(404).json({ error: "Media not found" });
    return;
  }
  res.json({ ...media, url: normalizeMediaUrl(media.url), createdAt: media.createdAt.toISOString() });
});

// PUT /media/:id
router.put("/media/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateMediaParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateMediaBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [media] = await db
    .update(mediaTable)
    .set(parsed.data)
    .where(eq(mediaTable.id, params.data.id))
    .returning();
  if (!media) {
    res.status(404).json({ error: "Media not found" });
    return;
  }
  res.json({ ...media, url: normalizeMediaUrl(media.url), createdAt: media.createdAt.toISOString() });
});

// DELETE /media/:id
router.delete("/media/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteMediaParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [media] = await db.select().from(mediaTable).where(eq(mediaTable.id, params.data.id));
  if (!media) {
    res.status(404).json({ error: "Media not found" });
    return;
  }

  // Delete file from disk
  const filePath = path.join(UPLOADS_DIR, media.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await db.delete(mediaTable).where(eq(mediaTable.id, params.data.id));
  res.sendStatus(204);
});

// PATCH /media/:id/usage
router.patch("/media/:id/usage", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateMediaUsageParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateMediaUsageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [media] = await db
    .update(mediaTable)
    .set({ usedIn: parsed.data.usedIn })
    .where(eq(mediaTable.id, params.data.id))
    .returning();
  if (!media) {
    res.status(404).json({ error: "Media not found" });
    return;
  }
  res.json({ ...media, url: normalizeMediaUrl(media.url), createdAt: media.createdAt.toISOString() });
});

export default router;
