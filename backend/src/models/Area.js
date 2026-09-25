const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Area = sequelize.define('Area', {
  id_area: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  descripcion: { type: DataTypes.STRING(250), allowNull: false },
  activo: { type: DataTypes.SMALLINT, defaultValue: 1, allowNull: false },
}, {
  tableName: 'areas',
  timestamps: false,
});

module.exports = Area;