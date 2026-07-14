import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { adminMiddleware } from "../../middlewares/adminMiddleware";
import { getUsers, patchUserRole, getBookings, getPayments, getStats } from "./admin.controller";

const router = Router();
router.use(authMiddleware, adminMiddleware);
router.get("/users", getUsers);
router.patch("/users/:id/role", patchUserRole);
router.get("/bookings", getBookings);
router.get("/payments", getPayments);
router.get("/stats", getStats);
export default router;