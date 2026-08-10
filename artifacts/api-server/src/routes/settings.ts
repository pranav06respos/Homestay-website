import { Router } from "express";
import type { IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, settingsTable, mediaTable } from "@workspace/db";
import { UpdateSettingsBody } from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

function normalizeMediaUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.pathname.startsWith("/api/uploads/")) return parsed.pathname;
  } catch {
    // Already a relative URL or legacy non-URL value.
  }
  return url;
}

async function withResolvedMediaUrls(settings: typeof settingsTable.$inferSelect) {
  const result = { ...settings };
  for (const [mediaIdKey, urlKey] of [
    ["heroImageMediaId", "heroImageUrl"],
    ["aboutImageMediaId", "aboutImageUrl"],
    ["logoMediaId", "logoUrl"],
  ] as const) {
    const mediaId = result[mediaIdKey];
    if (mediaId) {
      const [media] = await db.select({ url: mediaTable.url }).from(mediaTable).where(eq(mediaTable.id, mediaId));
      result[urlKey] = normalizeMediaUrl(media?.url ?? result[urlKey]);
    } else {
      result[urlKey] = normalizeMediaUrl(result[urlKey]);
    }
  }
  return result;
}

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
  try {
    await ensureSettings();
    const [settings] = await db.select().from(settingsTable).where(eq(settingsTable.isDraft, false));
    res.json(await withResolvedMediaUrls(settings));
  } catch (err: any) {
    console.error("[settings GET] DB error:", err);
    const cause = err?.cause || {};
    let dbHost = "unknown";
    try {
      if (process.env.DATABASE_URL) dbHost = new URL(process.env.DATABASE_URL).hostname;
    } catch {}

    res.status(500).json({
      error: "Failed to load settings",
      message: err?.message,
      causeMessage: cause.message || String(cause),
      causeCode: cause.code,
      causeDetail: cause.detail,
      causeRoutine: cause.routine,
      dbHost,
      stack: err?.stack,
    });
  }
});

router.get("/settings/draft", requireAdmin, async (req, res): Promise<void> => {
  try {
    await ensureSettings();
    const [draft] = await db.select().from(settingsTable).where(eq(settingsTable.isDraft, true));
    res.json(await withResolvedMediaUrls(draft));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Failed to load draft settings", details: message });
  }
});

router.put("/settings", requireAdmin, async (req, res): Promise<void> => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
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
  } catch (err) {
    console.error("[PUT /settings] DB error full object:", err);
    console.error("[PUT /settings] DB error cause:", (err as any)?.cause);
    console.error("[PUT /settings] DB error JSON:", JSON.stringify(err, null, 2));
    const e = err as Record<string, unknown>;
    res.status(500).json({
      error: "Failed to save draft settings",
      details: e["message"] as string || String(err),
      code: e["code"],
      hint: e["hint"],
      cause: String(e["cause"] || ""),
    });
  }
});

router.post("/settings/publish", requireAdmin, async (req, res): Promise<void> => {
  try {
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
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Failed to publish settings", details: message });
  }
});

export default router;
