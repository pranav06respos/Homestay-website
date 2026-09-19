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
import { requireAdminJwt } from "../middlewares/jwtAuth";
import { verifyToken } from "../lib/jwt";

const router: IRouter = Router();

function parseId(raw: string | string[]): number {
  return parseInt(Array.isArray(raw) ? raw[0] : raw, 10);
}

// GET /attractions
router.get("/attractions", async (req, res): Promise<void> => {
  try {
    const isAdmin = req.query.admin === "true";
    if (isAdmin) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const token = authHeader.slice('Bearer '.length).trim();
      try {
        const payload = verifyToken(token) as { admin?: boolean };
        if (!payload.admin) throw new Error('Not admin');
      } catch (err) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
    }
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
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Failed to load attractions", details: message });
  }
});

// POST /attractions
router.post("/attractions", requireAdminJwt, async (req, res): Promise<void> => {
  const parsed = CreateAttractionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db.insert(attractionsTable).values(parsed.data).returning();
  res.status(201).json(item);
});

// PUT /attractions/:id
router.put("/attractions/:id", requireAdminJwt, async (req, res): Promise<void> => {
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
router.delete("/attractions/:id", requireAdminJwt, async (req, res): Promise<void> => {
  const params = DeleteAttractionParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(attractionsTable).where(eq(attractionsTable.id, params.data.id));
  res.sendStatus(204);
});

// PATCH /attractions/:id/toggle-visible
router.patch("/attractions/:id/toggle-visible", requireAdminJwt, async (req, res): Promise<void> => {
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
