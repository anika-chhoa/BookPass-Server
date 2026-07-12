import { Router } from "express";
import authRouter from "../modules/auth/auth.routes";

const router = Router();


router.get("/health", (_req, res) => {
  res.json({ success: true, message: "Libro API is running" });
});
router.use("/auth", authRouter);

export default router;
