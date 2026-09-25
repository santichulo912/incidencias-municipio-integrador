const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
  id_usuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_area: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  nombres: {
    type: DataTypes.STRING(250),
    allowNull: false,
  },
  apellidos: {
    type: DataTypes.STRING(250),
    allowNull: false,
  },
  usuario: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  contrasenia: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  rol: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  activo: {
    type: DataTypes.SMALLINT,
    defaultValue: 1,
    allowNull: false,
  },
}, {
  tableName: 'usuarios',
  timestamps: false,
});

module.exports = Usuario;