import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { adminMiddleware } from "../../middlewares/adminMiddleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { success, failure } from "../../utils/apiResponse";
import { cloudinary } from "../../config/cloudinary";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const router = Router();

router.post(
  "/image",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  asyncHandler(async (req, res) => {
    if (!req.file) return failure(res, "No image file provided", 400);
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: "BookPass/books" }, (err, result) => {
        if (err || !result) return reject(err);
        resolve(result);
      });
      stream.end(req.file!.buffer);
    });
    return success(res, { url: result.secure_url }, "Image uploaded");
  })
);

export default router;