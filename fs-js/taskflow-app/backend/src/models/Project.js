const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define(
    'Project',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(150), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      ownerId: { type: DataTypes.INTEGER, allowNull: false }
    },
    {
      tableName: 'projects',
      underscored: true,
      timestamps: true
    }
  );
