import { Router } from "express";
import { create, featured, listForBook } from "./review.controller";
import { authMiddleware } from "../../middlewares/authMiddleware";

const router = Router();
router.get("/featured", featured);
router.get("/book/:bookId", listForBook);
router.post("/book/:bookId", authMiddleware, create);
export default router;