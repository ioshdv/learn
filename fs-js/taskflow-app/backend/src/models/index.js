const { sequelize } = require('../config/db');

const UserModel = require('./User');
const ProjectModel = require('./Project');
const ProjectMemberModel = require('./ProjectMember');
const TaskModel = require('./Task');
const CommentModel = require('./Comment');
const AttachmentModel = require('./Attachment');

const User = UserModel(sequelize);
const Project = ProjectModel(sequelize);
const ProjectMember = ProjectMemberModel(sequelize);
const Task = TaskModel(sequelize);
const Comment = CommentModel(sequelize);
const Attachment = AttachmentModel(sequelize);

// Relations
User.hasMany(Project, { foreignKey: 'ownerId', as: 'ownedProjects' });
Project.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

Project.belongsToMany(User, { through: ProjectMember, foreignKey: 'projectId', otherKey: 'userId', as: 'members' });
User.belongsToMany(Project, { through: ProjectMember, foreignKey: 'userId', otherKey: 'projectId', as: 'projects' });

Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks' });
Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

User.hasMany(Task, { foreignKey: 'assigneeId', as: 'assignedTasks' });
Task.belongsTo(User, { foreignKey: 'assigneeId', as: 'assignee' });

Task.hasMany(Comment, { foreignKey: 'taskId', as: 'comments' });
Comment.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });

User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'author' });

Task.hasMany(Attachment, { foreignKey: 'taskId', as: 'attachments' });
Attachment.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });

User.hasMany(Attachment, { foreignKey: 'userId', as: 'attachments' });
Attachment.belongsTo(User, { foreignKey: 'userId', as: 'uploader' });

async function initDb() {
  await sequelize.authenticate();
  const isProd = process.env.NODE_ENV === "production";
  const syncMode = (process.env.DB_SYNC || "").toLowerCase();

  if (!isProd) {
    // Dev: permite actualizar tablas automaticamente
    await sequelize.sync({ alter: true });
    return;
  }

  // Prod: evitar alter automatico; habilitar solo si se solicita explicitamente
  if (syncMode === "force") {
    await sequelize.sync({ force: true });
    return;
  }
  if (syncMode === "alter") {
    await sequelize.sync({ alter: true });
    return;
  }
  if (syncMode === "true") {
    await sequelize.sync();
    return;
  }
}

module.exports = { sequelize, User, Project, ProjectMember, Task, Comment, Attachment, initDb };
