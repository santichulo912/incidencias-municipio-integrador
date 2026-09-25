const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Estado = sequelize.define('Estado', {
  id_estado: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.STRING(255), // varchar
    allowNull: false
  },
  activo: {
    type: DataTypes.TINYINT, // tinyint
    allowNull: false,
    defaultValue: 1
  }
}, {
  tableName: 'estados',
  timestamps: false
});

module.exports = Estado;