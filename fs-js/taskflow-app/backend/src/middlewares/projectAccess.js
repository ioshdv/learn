const { ProjectMember, Project } = require('../models');

async function requireProjectAccess(req, res, next) {
  const user = req.user; // { userId, role, ... } from JWT
  const projectId = Number(req.params.projectId || req.params.id || req.body.projectId);

  if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
  if (user.role === 'admin') return next();

  const project = await Project.findByPk(projectId);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  if (project.ownerId === user.userId) return next();

  const membership = await ProjectMember.findOne({ where: { projectId, userId: user.userId } });
  if (!membership) return res.status(403).json({ error: 'Forbidden' });

  next();
}

module.exports = { requireProjectAccess };
