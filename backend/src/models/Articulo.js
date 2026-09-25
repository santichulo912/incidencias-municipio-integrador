const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Articulo = sequelize.define('Articulo', {
  id_articulo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_area: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id_categoria: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  activo: {
    type: DataTypes.SMALLINT,
    defaultValue: 1,
    allowNull: false,
  },
}, {
  tableName: 'articulos',
  timestamps: false,
});

module.exports = Articulo;