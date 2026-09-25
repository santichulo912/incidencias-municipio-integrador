const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Estado = sequelize.define('Estado', {
  id_estado: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  descripcion: { type: DataTypes.STRING(255), allowNull: false },
  activo: { type: DataTypes.SMALLINT, defaultValue: 1, allowNull: false },
}, {
  tableName: 'estados',
  timestamps: false,
});

module.exports = Estado;