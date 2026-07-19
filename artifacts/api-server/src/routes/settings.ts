import { Router } from "express";
import type { IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, settingsTable, mediaTable } from "@workspace/db";
import { UpdateSettingsBody } from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

async function ensureSettings() {
  const rows = await db.select().from(settingsTable);
  const published = rows.find((r) => !r.isDraft);
  const draft = rows.find((r) => r.isDraft);

  if (!published) {
    const [pub] = await db.insert(settingsTable).values({ isDraft: false }).returning();
    if (!draft) {
      const { id: _id, isDraft: _d, ...pubData } = pub;
      await db.insert(settingsTable).values({ isDraft: true, ...pubData });
    }
  } else if (!draft) {
    const { id: _id, isDraft: _d, ...pubData } = published;
    await db.insert(settingsTable).values({ isDraft: true, ...pubData });
  }
}

router.get("/settings", async (req, res): Promise<void> => {
  await ensureSettings();
  const [settings] = await db.select().from(settingsTable).where(eq(settingsTable.isDraft, false));
  res.json(settings);
});

router.get("/settings/draft", requireAdmin, async (req, res): Promise<void> => {
  await ensureSettings();
  const [draft] = await db.select().from(settingsTable).where(eq(settingsTable.isDraft, true));
  res.json(draft);
});

router.put("/settings", requireAdmin, async (req, res): Promise<void> => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await ensureSettings();
  const data: Partial<typeof settingsTable.$inferInsert> = { ...parsed.data };

  // Resolve image URLs from media IDs
  if (data.heroImageMediaId != null) {
    const [m] = await db.select().from(mediaTable).where(eq(mediaTable.id, data.heroImageMediaId));
    if (m) data.heroImageUrl = m.url;
  } else if ("heroImageMediaId" in parsed.data && parsed.data.heroImageMediaId === null) {
    data.heroImageUrl = null;
  }

  if (data.aboutImageMediaId != null) {
    const [m] = await db.select().from(mediaTable).where(eq(mediaTable.id, data.aboutImageMediaId));
    if (m) data.aboutImageUrl = m.url;
  } else if ("aboutImageMediaId" in parsed.data && parsed.data.aboutImageMediaId === null) {
    data.aboutImageUrl = null;
  }

  if (data.logoMediaId != null) {
    const [m] = await db.select().from(mediaTable).where(eq(mediaTable.id, data.logoMediaId));
    if (m) data.logoUrl = m.url;
  } else if ("logoMediaId" in parsed.data && parsed.data.logoMediaId === null) {
    data.logoUrl = null;
  }

  const [updated] = await db
    .update(settingsTable)
    .set(data)
    .where(eq(settingsTable.isDraft, true))
    .returning();

  res.json(updated);
});

router.post("/settings/publish", requireAdmin, async (req, res): Promise<void> => {
  await ensureSettings();
  const [draft] = await db.select().from(settingsTable).where(eq(settingsTable.isDraft, true));

  if (!draft) {
    res.status(404).json({ error: "Draft not found" });
    return;
  }

  const { id: _id, isDraft: _d, ...draftData } = draft;
  const [published] = await db
    .update(settingsTable)
    .set(draftData)
    .where(eq(settingsTable.isDraft, false))
    .returning();

  res.json(published);
});

export default router;
