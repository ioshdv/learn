const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define(
    'Comment',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      taskId: { type: DataTypes.INTEGER, allowNull: false },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      content: { type: DataTypes.TEXT, allowNull: false }
    },
    { tableName: 'comments', underscored: true, timestamps: true }
  );
