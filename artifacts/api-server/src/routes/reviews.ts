import { Router } from "express";
import type { IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, reviewsTable } from "@workspace/db";
import {
  CreateReviewBody,
  UpdateReviewParams,
  UpdateReviewBody,
  DeleteReviewParams,
  ToggleReviewVisibleParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

function parseId(raw: string | string[]): number {
  return parseInt(Array.isArray(raw) ? raw[0] : raw, 10);
}

function formatReview(r: typeof reviewsTable.$inferSelect) {
  // Safely convert — Supabase may return string or Date object
  return { ...r, createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : null };
}

// GET /reviews
router.get("/reviews", async (req, res): Promise<void> => {
  try {
    const isAdmin = req.query.admin === "true";
    let items;
    if (isAdmin) {
      items = await db.select().from(reviewsTable).orderBy(desc(reviewsTable.createdAt));
    } else {
      items = await db
        .select()
        .from(reviewsTable)
        .where(eq(reviewsTable.isVisible, true))
        .orderBy(desc(reviewsTable.createdAt));
    }
    res.json(items.map(formatReview));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Failed to load reviews", details: message });
  }
});

// POST /reviews
router.post("/reviews", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateReviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const [item] = await db.insert(reviewsTable).values(parsed.data).returning();
    res.status(201).json(formatReview(item));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Failed to create review", details: message });
  }
});

// PUT /reviews/:id
router.put("/reviews/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateReviewParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateReviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db
    .update(reviewsTable)
    .set(parsed.data)
    .where(eq(reviewsTable.id, params.data.id))
    .returning();
  if (!item) {
    res.status(404).json({ error: "Review not found" });
    return;
  }
  res.json(formatReview(item));
});

// DELETE /reviews/:id
router.delete("/reviews/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteReviewParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(reviewsTable).where(eq(reviewsTable.id, params.data.id));
  res.sendStatus(204);
});

// PATCH /reviews/:id/toggle-visible
router.patch("/reviews/:id/toggle-visible", requireAdmin, async (req, res): Promise<void> => {
  const params = ToggleReviewVisibleParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [current] = await db.select().from(reviewsTable).where(eq(reviewsTable.id, params.data.id));
  if (!current) {
    res.status(404).json({ error: "Review not found" });
    return;
  }
  const [item] = await db
    .update(reviewsTable)
    .set({ isVisible: !current.isVisible })
    .where(eq(reviewsTable.id, params.data.id))
    .returning();
  res.json(formatReview(item));
});

export default router;
