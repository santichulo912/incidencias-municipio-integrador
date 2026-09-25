const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Categoria = sequelize.define('Categoria', {
  id_categoria: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true, // Asumimos que es autoincremental en la base
    allowNull: false
  },
  descripcion: {
    type: DataTypes.STRING(255), // Mapea al tipo varchar
    allowNull: false
  },
  activo: {
    type: DataTypes.TINYINT, // Mapea al tipo tinyint
    allowNull: false,
    defaultValue: 1
  }
}, {
  tableName: 'categorias',
  timestamps: false
});

module.exports = Categoria;