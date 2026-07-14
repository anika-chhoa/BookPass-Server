import { Router } from "express";
import { getStats } from "./stats.controller";

const router = Router();
router.get("/public", getStats);
export default router;