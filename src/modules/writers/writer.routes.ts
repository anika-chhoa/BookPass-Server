import { Router } from "express";
import { create, list } from "./writer.controller";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { adminMiddleware } from "../../middlewares/adminMiddleware";

const router = Router();
router.get("/", list);
router.post("/", authMiddleware, adminMiddleware, create);
export default router;