const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define(
    'Task',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      projectId: { type: DataTypes.INTEGER, allowNull: false },
      title: { type: DataTypes.STRING(200), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'todo' }, // todo|in_progress|completed
      priority: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'medium' }, // low|medium|high
      assigneeId: { type: DataTypes.INTEGER, allowNull: true },
      dueDate: { type: DataTypes.DATE, allowNull: true }
    },
    { tableName: 'tasks', underscored: true, timestamps: true }
  );
