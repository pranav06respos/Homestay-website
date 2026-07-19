import { Router } from "express";
import type { IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, attractionsTable } from "@workspace/db";
import {
  CreateAttractionBody,
  UpdateAttractionParams,
  UpdateAttractionBody,
  DeleteAttractionParams,
  ToggleAttractionVisibleParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

function parseId(raw: string | string[]): number {
  return parseInt(Array.isArray(raw) ? raw[0] : raw, 10);
}

// GET /attractions
router.get("/attractions", async (req, res): Promise<void> => {
  const isAdmin = req.query.admin === "true";
  let items;
  if (isAdmin) {
    items = await db.select().from(attractionsTable).orderBy(asc(attractionsTable.sortOrder));
  } else {
    items = await db
      .select()
      .from(attractionsTable)
      .where(eq(attractionsTable.isVisible, true))
      .orderBy(asc(attractionsTable.sortOrder));
  }
  res.json(items);
});

// POST /attractions
router.post("/attractions", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateAttractionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db.insert(attractionsTable).values(parsed.data).returning();
  res.status(201).json(item);
});

// PUT /attractions/:id
router.put("/attractions/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateAttractionParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateAttractionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db
    .update(attractionsTable)
    .set(parsed.data)
    .where(eq(attractionsTable.id, params.data.id))
    .returning();
  if (!item) {
    res.status(404).json({ error: "Attraction not found" });
    return;
  }
  res.json(item);
});

// DELETE /attractions/:id
router.delete("/attractions/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteAttractionParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(attractionsTable).where(eq(attractionsTable.id, params.data.id));
  res.sendStatus(204);
});

// PATCH /attractions/:id/toggle-visible
router.patch("/attractions/:id/toggle-visible", requireAdmin, async (req, res): Promise<void> => {
  const params = ToggleAttractionVisibleParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [current] = await db.select().from(attractionsTable).where(eq(attractionsTable.id, params.data.id));
  if (!current) {
    res.status(404).json({ error: "Attraction not found" });
    return;
  }
  const [item] = await db
    .update(attractionsTable)
    .set({ isVisible: !current.isVisible })
    .where(eq(attractionsTable.id, params.data.id))
    .returning();
  res.json(item);
});

export default router;
