import { Router, type IRouter, type Response } from "express";
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";
import multer from "multer";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth.js";

const router: IRouter = Router();

const BUCKET = "club-photos";
const ALLOWED_TYPES = ["image/jpeg", "image/gif", "image/png", "image/webp"];

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set");
  return createClient(url, key);
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 800 * 1024 },
  fileFilter: (_req, file, cb) => {
    cb(null, ALLOWED_TYPES.includes(file.mimetype));
  },
});

/**
 * POST /storage/uploads
 *
 * Accept a multipart image, upload it to Supabase Storage, and return the
 * public URL. Protected — requires JWT auth.
 */
router.post(
  "/storage/uploads",
  requireAuth,
  upload.single("file"),
  async (req: AuthenticatedRequest, res: Response) => {
    const file = req.file;
    if (!file) {
      res.status(400).json({ success: false, error: "No valid image file provided" });
      return;
    }

    try {
      const supabase = getSupabase();
      const ext = file.mimetype === "image/jpeg" ? "jpg" : file.mimetype.split("/")[1];
      const filename = `${randomUUID()}.${ext}`;

      const { data, error } = await supabase.storage
        .from(BUCKET)
        .upload(filename, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        req.log.error({ err: error }, "Supabase storage upload error");
        res.status(500).json({ success: false, error: "Upload failed" });
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(data.path);

      res.json({ success: true, url: publicUrl });
    } catch (err) {
      req.log.error({ err }, "Storage upload error");
      res.status(500).json({ success: false, error: "Upload failed" });
    }
  }
);

export default router;
