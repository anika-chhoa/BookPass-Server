import { Router } from "express";
import authRouter from "../modules/auth/auth.routes";
import bookRouter from "../modules/books/book.routes";
import uploadRouter from "../modules/upload/upload.routes";

const router = Router();


router.get("/health", (_req, res) => {
  res.json({ success: true, message: "BookPass API is running" });
});
router.use("/auth", authRouter);
router.use("/books", bookRouter);
router.use("/upload", uploadRouter);

export default router;
