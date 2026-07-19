import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import settingsRouter from "./settings";
import roomsRouter from "./rooms";
import mediaRouter from "./media";
import galleryRouter from "./gallery";
import attractionsRouter from "./attractions";
import reviewsRouter from "./reviews";
import bookingsRouter from "./bookings";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(settingsRouter);
router.use(roomsRouter);
router.use(mediaRouter);
router.use(galleryRouter);
router.use(attractionsRouter);
router.use(reviewsRouter);
router.use(bookingsRouter);
router.use(dashboardRouter);

export default router;
