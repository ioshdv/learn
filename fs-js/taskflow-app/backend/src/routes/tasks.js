const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { auth } = require("../middlewares/auth");
const { requireProjectAccess } = require("../middlewares/projectAccess");
const { Task, Comment, Attachment } = require("../models");

router.use(auth);

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

// GET /api/tasks?projectId=1&status=todo&priority=high&assigneeId=2
router.get("/", async (req, res) => {
  try {
    const where = {};
    if (req.query.projectId) where.projectId = Number(req.query.projectId);
    if (req.query.status && req.query.status !== "all") where.status = req.query.status;
    if (req.query.priority && req.query.priority !== "all") where.priority = req.query.priority;
    if (req.query.assigneeId && req.query.assigneeId !== "all") where.assigneeId = Number(req.query.assigneeId);

    const tasks = await Task.findAll({
      where,
      order: [["id", "DESC"]],
      include: [
        {
          model: Attachment,
          as: "attachments",
          attributes: ["id", "originalName", "path", "mimeType", "size", "createdAt"]
        }
      ]
    });

    res.json(tasks);
  } catch (err) {
    console.error("Get tasks error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { projectId, title, description, status, priority, assigneeId, dueDate } = req.body;
    if (!projectId) return res.status(400).json({ error: "Missing projectId" });
    if (!title || String(title).trim().length < 2) return res.status(400).json({ error: "Invalid title" });

    req.params.projectId = projectId;
    await new Promise((resolve) => requireProjectAccess(req, res, resolve));
    if (res.headersSent) return;

    const task = await Task.create({
      projectId: Number(projectId),
      title: String(title).trim(),
      description: description || null,
      status: status || "todo",
      priority: priority || "medium",
      assigneeId: assigneeId ? Number(assigneeId) : null,
      dueDate: dueDate ? new Date(dueDate) : null
    });

    // devolver con attachments (vacío)
    const taskWith = await Task.findByPk(task.id, {
      include: [{ model: Attachment, as: "attachments", attributes: ["id", "originalName", "path", "mimeType", "size", "createdAt"] }]
    });

    res.status(201).json(taskWith);
  } catch (err) {
    console.error("Create task error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    req.params.projectId = task.projectId;
    await new Promise((resolve) => requireProjectAccess(req, res, resolve));
    if (res.headersSent) return;

    const patch = {};
    ["title", "description", "status", "priority", "assigneeId", "dueDate"].forEach((k) => {
      if (req.body[k] !== undefined) patch[k] = req.body[k];
    });
    if (patch.title) patch.title = String(patch.title).trim();

    await task.update(patch);

    const taskWith = await Task.findByPk(task.id, {
      include: [{ model: Attachment, as: "attachments", attributes: ["id", "originalName", "path", "mimeType", "size", "createdAt"] }]
    });

    res.json(taskWith);
  } catch (err) {
    console.error("Update task error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    req.params.projectId = task.projectId;
    await new Promise((resolve) => requireProjectAccess(req, res, resolve));
    if (res.headersSent) return;

    await task.destroy();
    res.json({ ok: true });
  } catch (err) {
    console.error("Delete task error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Comments
router.get("/:id/comments", async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    req.params.projectId = task.projectId;
    await new Promise((resolve) => requireProjectAccess(req, res, resolve));
    if (res.headersSent) return;

    const comments = await Comment.findAll({ where: { taskId: task.id }, order: [["id", "ASC"]] });
    res.json(comments);
  } catch (err) {
    console.error("Get comments error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/comments", async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || String(content).trim().length < 1) return res.status(400).json({ error: "Invalid content" });

    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    req.params.projectId = task.projectId;
    await new Promise((resolve) => requireProjectAccess(req, res, resolve));
    if (res.headersSent) return;

    const comment = await Comment.create({
      taskId: task.id,
      userId: req.user.userId,
      content: String(content).trim()
    });

    res.status(201).json(comment);
  } catch (err) {
    console.error("Create comment error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Attachments upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const dir = path.join(process.cwd(), "uploads", "attachments");
      ensureDir(dir);
      cb(null, dir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/\s+/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_req, file, cb) => {
    const ok = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"].includes(file.mimetype);
    cb(ok ? null : new Error("Formato de archivo no permitido"), ok);
  }
});

router.post("/:id/attachments", upload.single("file"), async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    req.params.projectId = task.projectId;
    await new Promise((resolve) => requireProjectAccess(req, res, resolve));
    if (res.headersSent) return;

    if (!req.file) return res.status(400).json({ error: "Missing file" });

    const a = await Attachment.create({
      taskId: task.id,
      userId: req.user.userId,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: `/uploads/attachments/${req.file.filename}`
    });

    res.status(201).json(a);
  } catch (err) {
    console.error("Upload attachment error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
