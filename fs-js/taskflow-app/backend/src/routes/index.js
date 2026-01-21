const router = require("express").Router();

router.use(require("./health"));
router.use("/auth", require("./auth"));
router.use("/projects", require("./projects"));
router.use("/tasks", require("./tasks"));
router.use("/users", require("./users"));
router.use("/admin", require("./admin"));

module.exports = router;
