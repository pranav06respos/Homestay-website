import { Router } from "express";
import type { IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, galleryTable, mediaTable } from "@workspace/db";
import {
  AddGalleryItemBody,
  UpdateGalleryItemParams,
  UpdateGalleryItemBody,
  DeleteGalleryItemParams,
  ReorderGalleryBody,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

function parseId(raw: string | string[]): number {
  const s = Array.isArray(raw) ? raw[0] : raw;
  return parseInt(s, 10);
}

async function galleryWithMedia(item: typeof galleryTable.$inferSelect) {
  const [media] = await db.select().from(mediaTable).where(eq(mediaTable.id, item.mediaId));
  return {
    ...item,
    url: media?.url?.startsWith("http") ? new URL(media.url).pathname : (media?.url ?? ""),
    altText: media?.altText ?? null,
    filename: media?.filename ?? "",
    // Safely convert — Supabase may return string or Date object
    createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : null,
  };
}

// GET /gallery
router.get("/gallery", async (req, res): Promise<void> => {
  try {
    const isAdmin = req.query.admin === "true";
    if (isAdmin) {
      const session = req.session as { admin?: boolean };
      if (!session.admin) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
    }
    let items;
    if (isAdmin) {
      items = await db.select().from(galleryTable).orderBy(asc(galleryTable.sortOrder));
    } else {
      items = await db
        .select()
        .from(galleryTable)
        .where(eq(galleryTable.isVisible, true))
        .orderBy(asc(galleryTable.sortOrder));
    }
    const result = await Promise.all(items.map(galleryWithMedia));
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Failed to load gallery", details: message });
  }
});

// POST /gallery
router.post("/gallery", requireAdmin, async (req, res): Promise<void> => {
  const parsed = AddGalleryItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db.insert(galleryTable).values(parsed.data).returning();
  res.status(201).json(await galleryWithMedia(item));
});

// POST /gallery/reorder (must be before /:id)
router.post("/gallery/reorder", requireAdmin, async (req, res): Promise<void> => {
  const parsed = ReorderGalleryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  await Promise.all(
    parsed.data.items.map((item) =>
      db.update(galleryTable).set({ sortOrder: item.sortOrder }).where(eq(galleryTable.id, item.id))
    )
  );
  res.json({ message: "Gallery reordered" });
});

// PUT /gallery/:id
router.put("/gallery/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateGalleryItemParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateGalleryItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db
    .update(galleryTable)
    .set(parsed.data)
    .where(eq(galleryTable.id, params.data.id))
    .returning();
  if (!item) {
    res.status(404).json({ error: "Gallery item not found" });
    return;
  }
  res.json(await galleryWithMedia(item));
});

// DELETE /gallery/:id
router.delete("/gallery/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteGalleryItemParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(galleryTable).where(eq(galleryTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
