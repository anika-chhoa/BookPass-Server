import { Router } from "express";
import { create, list, getOne, update, remove } from "./book.controller";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { adminMiddleware } from "../../middlewares/adminMiddleware";

const router = Router();
router.get("/", list);
router.get("/:id", getOne);
router.post("/", authMiddleware, adminMiddleware, create);
router.patch("/:id", authMiddleware, adminMiddleware, update);
router.delete("/:id", authMiddleware, adminMiddleware, remove);
export default router;