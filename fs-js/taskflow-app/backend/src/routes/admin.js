const router = require("express").Router();
const { auth, requireRole } = require("../middlewares/auth");
const { User } = require("../models");

router.use(auth);
router.use(requireRole("admin"));

router.get("/users", async (_req, res) => {
  const users = await User.findAll({
    attributes: ["id", "email", "nombre", "role", "activo", "avatarPath", "createdAt"]
  });
  res.json(users);
});

module.exports = router;
