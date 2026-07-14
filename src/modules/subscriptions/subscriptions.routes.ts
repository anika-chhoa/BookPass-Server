import { Router } from "express";
import { createSession } from "./subscriptions.controller";
import { authMiddleware } from "../../middlewares/authMiddleware";

const router = Router();
router.post("/checkout-session", authMiddleware, createSession);

export default router;