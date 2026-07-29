import { Router } from "express";
import type { IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, roomsTable, roomImagesTable, mediaTable } from "@workspace/db";
import {
  CreateRoomBody,
  UpdateRoomBody,
  GetRoomParams,
  UpdateRoomParams,
  DeleteRoomParams,
  ToggleRoomAvailableParams,
  ToggleRoomVisibleParams,
  ListRoomImagesParams,
  AddRoomImageParams,
  AddRoomImageBody,
  RemoveRoomImageParams,
  SetRoomCoverImageParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

function parseId(raw: string | string[]): number {
  const s = Array.isArray(raw) ? raw[0] : raw;
  return parseInt(s, 10);
}

async function roomWithCover(room: typeof roomsTable.$inferSelect) {
  const [cover] = await db
    .select({ url: mediaTable.url })
    .from(roomImagesTable)
    .innerJoin(mediaTable, eq(roomImagesTable.mediaId, mediaTable.id))
    .where(and(eq(roomImagesTable.roomId, room.id), eq(roomImagesTable.isCover, true)));

  return {
    ...room,
    pricePerNight: room.pricePerNight ? parseFloat(String(room.pricePerNight)) : null,
    coverImageUrl: cover?.url?.startsWith("http") ? new URL(cover.url).pathname : (cover?.url ?? null),
    createdAt: room.createdAt.toISOString(),
    updatedAt: room.updatedAt.toISOString(),
  };
}

// GET /rooms
router.get("/rooms", async (req, res): Promise<void> => {
  const isAdmin = req.query.admin === "true";
  if (isAdmin) {
    const session = req.session as { admin?: boolean };
    if (!session.admin) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
  }
  let rooms;
  if (isAdmin) {
    rooms = await db.select().from(roomsTable).orderBy(roomsTable.sortOrder);
  } else {
    rooms = await db
      .select()
      .from(roomsTable)
      .where(eq(roomsTable.isVisible, true))
      .orderBy(roomsTable.sortOrder);
  }
  const result = await Promise.all(rooms.map(roomWithCover));
  res.json(result);
});

// POST /rooms
router.post("/rooms", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateRoomBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { pricePerNight, ...rest } = parsed.data;
  const [room] = await db
    .insert(roomsTable)
    .values({ ...rest, pricePerNight: pricePerNight != null ? String(pricePerNight) : null })
    .returning();
  res.status(201).json(await roomWithCover(room));
});

// GET /rooms/:id
router.get("/rooms/:id", async (req, res): Promise<void> => {
  const params = GetRoomParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [room] = await db.select().from(roomsTable).where(eq(roomsTable.id, params.data.id));
  if (!room) {
    res.status(404).json({ error: "Room not found" });
    return;
  }
  res.json(await roomWithCover(room));
});

// PUT /rooms/:id
router.put("/rooms/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateRoomParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateRoomBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { pricePerNight, ...rest } = parsed.data;
  const updateData = {
    ...rest,
    ...(pricePerNight !== undefined ? { pricePerNight: pricePerNight != null ? String(pricePerNight) : null } : {}),
  };
  const [room] = await db
    .update(roomsTable)
    .set(updateData)
    .where(eq(roomsTable.id, params.data.id))
    .returning();
  if (!room) {
    res.status(404).json({ error: "Room not found" });
    return;
  }
  res.json(await roomWithCover(room));
});

// DELETE /rooms/:id
router.delete("/rooms/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteRoomParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(roomImagesTable).where(eq(roomImagesTable.roomId, params.data.id));
  await db.delete(roomsTable).where(eq(roomsTable.id, params.data.id));
  res.sendStatus(204);
});

// PATCH /rooms/:id/toggle-available
router.patch("/rooms/:id/toggle-available", requireAdmin, async (req, res): Promise<void> => {
  const params = ToggleRoomAvailableParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [current] = await db.select().from(roomsTable).where(eq(roomsTable.id, params.data.id));
  if (!current) {
    res.status(404).json({ error: "Room not found" });
    return;
  }
  const [room] = await db
    .update(roomsTable)
    .set({ isAvailable: !current.isAvailable })
    .where(eq(roomsTable.id, params.data.id))
    .returning();
  res.json(await roomWithCover(room));
});

// PATCH /rooms/:id/toggle-visible
router.patch("/rooms/:id/toggle-visible", requireAdmin, async (req, res): Promise<void> => {
  const params = ToggleRoomVisibleParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [current] = await db.select().from(roomsTable).where(eq(roomsTable.id, params.data.id));
  if (!current) {
    res.status(404).json({ error: "Room not found" });
    return;
  }
  const [room] = await db
    .update(roomsTable)
    .set({ isVisible: !current.isVisible })
    .where(eq(roomsTable.id, params.data.id))
    .returning();
  res.json(await roomWithCover(room));
});

// GET /rooms/:id/images
router.get("/rooms/:id/images", async (req, res): Promise<void> => {
  const params = ListRoomImagesParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const images = await db
    .select({
      id: roomImagesTable.id,
      roomId: roomImagesTable.roomId,
      mediaId: roomImagesTable.mediaId,
      isCover: roomImagesTable.isCover,
      sortOrder: roomImagesTable.sortOrder,
       url: mediaTable.url,
      altText: mediaTable.altText,
      filename: mediaTable.filename,
    })
    .from(roomImagesTable)
    .innerJoin(mediaTable, eq(roomImagesTable.mediaId, mediaTable.id))
    .where(eq(roomImagesTable.roomId, params.data.id))
    .orderBy(roomImagesTable.sortOrder);
  res.json(images.map((image) => ({
    ...image,
    url: image.url.startsWith("http") ? new URL(image.url).pathname : image.url,
  })));
});

// POST /rooms/:id/images
router.post("/rooms/:id/images", requireAdmin, async (req, res): Promise<void> => {
  const params = AddRoomImageParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = AddRoomImageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // If setting as cover, unset existing cover
  if (parsed.data.isCover) {
    await db
      .update(roomImagesTable)
      .set({ isCover: false })
      .where(eq(roomImagesTable.roomId, params.data.id));
  }

  const [img] = await db
    .insert(roomImagesTable)
    .values({ roomId: params.data.id, ...parsed.data })
    .returning();

  const [media] = await db.select().from(mediaTable).where(eq(mediaTable.id, img.mediaId));
  res.status(201).json({ ...img, url: media?.url ?? "", altText: media?.altText, filename: media?.filename ?? "" });
});

// DELETE /rooms/:id/images/:imageId
router.delete("/rooms/:id/images/:imageId", requireAdmin, async (req, res): Promise<void> => {
  const params = RemoveRoomImageParams.safeParse({
    id: parseId(req.params.id),
    imageId: parseId(req.params.imageId),
  });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db
    .delete(roomImagesTable)
    .where(and(eq(roomImagesTable.id, params.data.imageId), eq(roomImagesTable.roomId, params.data.id)));
  res.sendStatus(204);
});

// PATCH /rooms/:id/images/:imageId/set-cover
router.patch("/rooms/:id/images/:imageId/set-cover", requireAdmin, async (req, res): Promise<void> => {
  const params = SetRoomCoverImageParams.safeParse({
    id: parseId(req.params.id),
    imageId: parseId(req.params.imageId),
  });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  // Unset all covers for this room
  await db
    .update(roomImagesTable)
    .set({ isCover: false })
    .where(eq(roomImagesTable.roomId, params.data.id));

  // Set new cover
  const [img] = await db
    .update(roomImagesTable)
    .set({ isCover: true })
    .where(and(eq(roomImagesTable.id, params.data.imageId), eq(roomImagesTable.roomId, params.data.id)))
    .returning();

  if (!img) {
    res.status(404).json({ error: "Image not found" });
    return;
  }

  const [media] = await db.select().from(mediaTable).where(eq(mediaTable.id, img.mediaId));
  res.json({ ...img, url: media?.url ?? "", altText: media?.altText, filename: media?.filename ?? "" });
});

export default router;
