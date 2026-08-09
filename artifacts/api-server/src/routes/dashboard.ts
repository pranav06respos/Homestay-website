import { Router } from "express";
import type { IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, roomsTable, bookingsTable, galleryTable, mediaTable, roomImagesTable } from "@workspace/db";
import { requireAdmin } from "../middlewares/auth";
import { count } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard/stats", requireAdmin, async (req, res): Promise<void> => {
  try {
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
        // Safely convert — Supabase may return string or Date object
        const createdAt = b.createdAt ? new Date(b.createdAt).toISOString() : null;
        return { ...b, roomName, createdAt };
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
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Failed to load dashboard stats", details: message });
  }
});


export default router;
