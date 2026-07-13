import { Router } from "express";
import { add, remove, listMine } from "./favorite.controller";
import { authMiddleware } from "../../middlewares/authMiddleware";

const router = Router();
router.use(authMiddleware);
router.post("/:bookId", add);
router.delete("/:bookId", remove);
router.get("/me", listMine);
export default router;