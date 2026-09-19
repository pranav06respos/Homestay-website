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
import { requireAdminJwt } from "../middlewares/jwtAuth";
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
router.get("/media", requireAdminJwt, async (req, res): Promise<void> => {
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

// POST /media/upload (supports both single file and multiple files)
router.post("/media/upload", requireAdminJwt, upload.any(), async (req, res): Promise<void> => {
  const files = (req.files as Express.Multer.File[]) || [];
  if (!files.length) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const altText = req.body.altText as string | undefined;
  const createdItems = [];

  for (const file of files) {
    const url = `/api/uploads/${file.filename}`;
    const fileBuffer = fs.readFileSync(file.path);
    const base64Data = fileBuffer.toString("base64");

    const [media] = await db
      .insert(mediaTable)
      .values({
        filename: file.filename,
        originalName: file.originalname,
        url,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        altText: altText ?? null,
        data: base64Data,
        usedIn: [],
      })
      .returning();

    createdItems.push({ ...media, createdAt: media.createdAt.toISOString() });
  }

  // If exactly one file was uploaded and not in an explicit batch request, return the single object for backward compatibility
  if (files.length === 1 && req.headers['x-batch-upload'] !== 'true') {
    res.status(201).json(createdItems[0]);
    return;
  }

  res.status(201).json({
    success: true,
    count: createdItems.length,
    items: createdItems,
  });
});

// GET /media/:id
router.get("/media/:id", requireAdminJwt, async (req, res): Promise<void> => {
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
router.put("/media/:id", requireAdminJwt, async (req, res): Promise<void> => {
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
router.delete("/media/:id", requireAdminJwt, async (req, res): Promise<void> => {
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
router.patch("/media/:id/usage", requireAdminJwt, async (req, res): Promise<void> => {
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
