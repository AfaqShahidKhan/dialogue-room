import path from "node:path";
import fs from "node:fs";
import multer from "multer";
import { AppError } from "../utils/appError";
import type { AuthenticatedRequest } from "../types/express";

const UPLOAD_DIR = path.resolve(process.cwd(), "uploads", "users");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const userId = (req as AuthenticatedRequest).user?.id as string | undefined;
    const ext = ALLOWED_MIME_TO_EXT[file.mimetype] ?? "jpg";
    cb(null, `user-${userId ?? "anon"}-${Date.now()}.${ext}`);
  },
});

export const uploadUserPhoto = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TO_EXT[file.mimetype]) {
      cb(new AppError("Only JPEG, PNG or WebP images are allowed", 400));
      return;
    }
    cb(null, true);
  },
}).single("photo");
