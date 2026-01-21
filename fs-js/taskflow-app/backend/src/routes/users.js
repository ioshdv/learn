const router = require("express").Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { requireAuth } = require("../middlewares/auth");
const { User } = require("../models");

const avatarsDir = path.join(process.cwd(), "uploads", "avatars");
fs.mkdirSync(avatarsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, avatarsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeName = (file.originalname || "file").replace(/\s+/g, "_");
    // OJO: JWT trae userId (no id)
    cb(null, `${req.user.userId}-${Date.now()}-${safeName}${ext && safeName.endsWith(ext) ? "" : ""}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_req, file, cb) => {
    const ok = ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.mimetype);
    cb(ok ? null : new Error("Formato de imagen no permitido"), ok);
  }
});

// GET /api/users/me
router.get("/me", requireAuth, async (req, res) => {
  const userId = req.user.userId;

  const me = await User.findByPk(userId, {
    attributes: ["id", "email", "nombre", "role", "avatarPath"]
  });

  if (!me) return res.status(404).json({ error: "User not found" });
  res.json(me);
});

// POST /api/users/me/avatar  (ruta esperada por frontend)
router.post("/me/avatar", requireAuth, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "file required" });

  const userId = req.user.userId;

  const rel = `/uploads/avatars/${req.file.filename}`;
  await User.update({ avatarPath: rel }, { where: { id: userId } });

  res.json({ ok: true, avatarPath: rel });
});

// POST /api/users/avatar (compat)
router.post("/avatar", requireAuth, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "file required" });

  const userId = req.user.userId;

  const rel = `/uploads/avatars/${req.file.filename}`;
  await User.update({ avatarPath: rel }, { where: { id: userId } });

  res.json({ ok: true, avatarPath: rel });
});

module.exports = router;
