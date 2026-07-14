import { Router } from "express";
import authRouter from "../modules/auth/auth.routes";
import bookRouter from "../modules/books/book.routes";
import uploadRouter from "../modules/upload/upload.routes";
import bookingRouter from "../modules/bookings/booking.routes";
import favoriteRouter from "../modules/favorites/favorite.routes";
import reviewRouter from "../modules/reviews/review.routes";
import subscriptionsRouter from "../modules/subscriptions/subscriptions.routes";
import dashboardRouter from "../modules/dashboard/dashboard.routes";
import adminRouter from "../modules/admin/admin.routes";
import writerRouter from "../modules/writers/writer.routes";
import statsRouter from "../modules/stats/stats.routes";

const router = Router();


router.get("/health", (_req, res) => {
  res.json({ success: true, message: "BookPass API is running" });
});
router.use("/auth", authRouter);
router.use("/books", bookRouter);
router.use("/upload", uploadRouter);
router.use("/bookings", bookingRouter);
router.use("/favorites", favoriteRouter);
router.use("/reviews", reviewRouter);
router.use("/subscriptions", subscriptionsRouter);
router.use("/dashboard", dashboardRouter);
router.use("/admin", adminRouter);
router.use("/writers", writerRouter);
router.use("/stats", statsRouter);

export default router;
