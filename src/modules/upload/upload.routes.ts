import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { adminMiddleware } from "../../middlewares/adminMiddleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { success, failure } from "../../utils/apiResponse";
import { cloudinary } from "../../config/cloudinary";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const router = Router();

function uploadToCloudinary(buffer: Buffer, folder: string) {
  return new Promise<{ secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
      if (err || !result) return reject(err);
      resolve(result);
    });
    stream.end(buffer);
  });
}

router.post(
  "/image",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  asyncHandler(async (req, res) => {
    if (!req.file) return failure(res, "No image file provided", 400);
    const result = await uploadToCloudinary(req.file.buffer, "BookPass/books");
    return success(res, { url: result.secure_url }, "Image uploaded");
  })
);

router.post(
  "/avatar",
  upload.single("image"),
  asyncHandler(async (req, res) => {
    if (!req.file) return failure(res, "No image file provided", 400);
    const result = await uploadToCloudinary(req.file.buffer, "BookPass/avatars");
    return success(res, { url: result.secure_url }, "Avatar uploaded");
  })
);

router.post(
  "/writer-photo",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  asyncHandler(async (req, res) => {
    if (!req.file) return failure(res, "No image file provided", 400);
    const result = await uploadToCloudinary(req.file.buffer, "BookPass/writers");
    return success(res, { url: result.secure_url }, "Writer photo uploaded");
  })
);

export default router;