const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define(
    'ProjectMember',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      projectId: { type: DataTypes.INTEGER, allowNull: false },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      role: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'member' } // member | manager
    },
    {
      tableName: 'project_members',
      underscored: true,
      timestamps: true,
      indexes: [{ unique: true, fields: ['project_id', 'user_id'] }]
    }
  );
