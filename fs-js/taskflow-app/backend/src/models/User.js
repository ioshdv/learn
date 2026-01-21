const { DataTypes } = require('sequelize');

function UserModel(sequelize) {
  return sequelize.define(
    'User',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
      password: { type: DataTypes.STRING(255), allowNull: false },
      nombre: { type: DataTypes.STRING(120), allowNull: false },
      role: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'user' },
      activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      refreshToken: { type: DataTypes.TEXT, allowNull: true },

      // ✅ NUEVO: ruta del avatar
      avatarPath: { type: DataTypes.STRING(500), allowNull: true }
    },
    {
      tableName: 'users',
      underscored: true,
      timestamps: true
    }
  );
}

module.exports = UserModel;
