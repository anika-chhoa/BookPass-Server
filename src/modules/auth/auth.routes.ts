import { Router } from "express";
import { register, login, refresh, logout, me, googleLogin, updateProfile } from "./auth.controller";
import { authMiddleware } from "../../middlewares/authMiddleware";

const router = Router();
router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", authMiddleware, me);
router.patch("/me", authMiddleware, updateProfile);
export default router;