const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define(
    'Attachment',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      taskId: { type: DataTypes.INTEGER, allowNull: false },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      originalName: { type: DataTypes.STRING(255), allowNull: false },
      mimeType: { type: DataTypes.STRING(120), allowNull: false },
      size: { type: DataTypes.INTEGER, allowNull: false },
      path: { type: DataTypes.STRING(500), allowNull: false }
    },
    { tableName: 'attachments', underscored: true, timestamps: true }
  );
