import { Router } from "express";
import type { IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, bookingsTable, roomsTable } from "@workspace/db";
import {
  CreateBookingBody,
  UpdateBookingStatusParams,
  UpdateBookingStatusBody,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

function parseId(raw: string | string[]): number {
  return parseInt(Array.isArray(raw) ? raw[0] : raw, 10);
}

async function bookingWithRoom(b: typeof bookingsTable.$inferSelect) {
  let roomName: string | null = null;
  if (b.roomId) {
    const [room] = await db.select({ name: roomsTable.name }).from(roomsTable).where(eq(roomsTable.id, b.roomId));
    roomName = room?.name ?? null;
  }
  return {
    ...b,
    roomName,
    createdAt: b.createdAt.toISOString(),
  };
}

// GET /bookings
router.get("/bookings", requireAdmin, async (req, res): Promise<void> => {
  try {
    const bookings = await db.select().from(bookingsTable).orderBy(desc(bookingsTable.createdAt));
    const result = await Promise.all(bookings.map(bookingWithRoom));
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Failed to load bookings", details: message });
  }
});

// POST /bookings
router.post("/bookings", async (req, res): Promise<void> => {
  const parsed = CreateBookingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const checkIn = new Date(parsed.data.checkIn);
  const checkOut = new Date(parsed.data.checkOut);
  if (!Number.isFinite(checkIn.getTime()) || !Number.isFinite(checkOut.getTime()) || checkOut <= checkIn) {
    res.status(400).json({ error: "Check-out must be after check-in" });
    return;
  }
  try {
    const [booking] = await db.insert(bookingsTable).values({ ...parsed.data, status: "pending" }).returning();
    res.status(201).json(await bookingWithRoom(booking));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Failed to create booking", details: message });
  }
});

// PATCH /bookings/:id/status
router.patch("/bookings/:id/status", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateBookingStatusParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateBookingStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [booking] = await db
    .update(bookingsTable)
    .set({ status: parsed.data.status })
    .where(eq(bookingsTable.id, params.data.id))
    .returning();
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }
  res.json(await bookingWithRoom(booking));
});

export default router;
