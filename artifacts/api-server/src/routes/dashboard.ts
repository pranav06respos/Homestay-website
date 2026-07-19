import { Router } from "express";
import type { IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, roomsTable, bookingsTable, galleryTable, mediaTable, roomImagesTable } from "@workspace/db";
import { requireAdmin } from "../middlewares/auth";
import { count } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard/stats", requireAdmin, async (req, res): Promise<void> => {
  const [totalRoomsResult] = await db.select({ count: count() }).from(roomsTable);
  const [availableRoomsResult] = await db
    .select({ count: count() })
    .from(roomsTable)
    .where(eq(roomsTable.isAvailable, true));
  const [pendingBookingsResult] = await db
    .select({ count: count() })
    .from(bookingsTable)
    .where(eq(bookingsTable.status, "pending"));
  const [galleryCountResult] = await db.select({ count: count() }).from(galleryTable);
  const [mediaCountResult] = await db.select({ count: count() }).from(mediaTable);

  const totalRooms = Number(totalRoomsResult?.count ?? 0);
  const availableRooms = Number(availableRoomsResult?.count ?? 0);
  const bookedRooms = totalRooms - availableRooms;
  const pendingBookings = Number(pendingBookingsResult?.count ?? 0);
  const totalGalleryImages = Number(galleryCountResult?.count ?? 0);
  const totalMediaFiles = Number(mediaCountResult?.count ?? 0);

  // Recent bookings (last 5) with room names
  const recentBookingsRaw = await db
    .select()
    .from(bookingsTable)
    .orderBy(desc(bookingsTable.createdAt))
    .limit(5);

  const recentBookings = await Promise.all(
    recentBookingsRaw.map(async (b) => {
      let roomName: string | null = null;
      if (b.roomId) {
        const [room] = await db.select({ name: roomsTable.name }).from(roomsTable).where(eq(roomsTable.id, b.roomId));
        roomName = room?.name ?? null;
      }
      return { ...b, roomName, createdAt: b.createdAt.toISOString() };
    })
  );

  res.json({
    totalRooms,
    availableRooms,
    bookedRooms,
    pendingBookings,
    totalGalleryImages,
    totalMediaFiles,
    recentBookings,
  });
});

export default router;
