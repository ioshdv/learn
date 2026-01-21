const router = require('express').Router();
const { auth } = require('../middlewares/auth');
const { requireProjectAccess } = require('../middlewares/projectAccess');
const { Project, ProjectMember } = require('../models');

router.use(auth);

// List projects visible to user
router.get('/', async (req, res) => {
  const { userId, role } = req.user;
  if (role === 'admin') {
    const projects = await Project.findAll({ order: [['id', 'DESC']] });
    return res.json(projects);
  }

  // owner or member
  const owned = await Project.findAll({ where: { ownerId: userId } });
  const memberships = await ProjectMember.findAll({ where: { userId } });
  const memberProjectIds = memberships.map(m => m.projectId);

  const memberProjects = memberProjectIds.length
    ? await Project.findAll({ where: { id: memberProjectIds } })
    : [];

  // dedupe by id
  const map = new Map();
  [...owned, ...memberProjects].forEach(p => map.set(p.id, p));
  res.json([...map.values()]);
});

// Create project (any logged user)
router.post('/', async (req, res) => {
  const { name, description } = req.body;
  if (!name || String(name).trim().length < 2) return res.status(400).json({ error: 'Invalid name' });

  const project = await Project.create({ name: String(name).trim(), description: description || null, ownerId: req.user.userId });

  // owner becomes member too
  await ProjectMember.create({ projectId: project.id, userId: req.user.userId, role: 'manager' });

  res.status(201).json(project);
});

router.get('/:id', requireProjectAccess, async (req, res) => {
  const project = await Project.findByPk(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

router.put('/:id', requireProjectAccess, async (req, res) => {
  const { name, description } = req.body;
  const project = await Project.findByPk(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  await project.update({
    name: name ? String(name).trim() : project.name,
    description: description !== undefined ? description : project.description
  });

  res.json(project);
});

router.delete('/:id', requireProjectAccess, async (req, res) => {
  const project = await Project.findByPk(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  await project.destroy();
  res.json({ ok: true });
});

module.exports = router;
