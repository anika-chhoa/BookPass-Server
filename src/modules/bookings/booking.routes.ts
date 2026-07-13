import { Router } from "express";
import { create, listMine, returnOne } from "./booking.controller";
import { authMiddleware } from "../../middlewares/authMiddleware";

const router = Router();
router.use(authMiddleware);
router.post("/", create);
router.get("/me", listMine);
router.post("/:id/return", returnOne);
export default router;