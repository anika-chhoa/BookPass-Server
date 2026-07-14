import { Router } from "express";
import { getStats } from "./dashboard.controller";
import { authMiddleware } from "../../middlewares/authMiddleware";

const router = Router();
router.use(authMiddleware);
router.get("/stats", getStats);
export default router;