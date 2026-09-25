const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const IncidenciaEstado = sequelize.define('IncidenciaEstado', {
  id_pedidos_estados: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  id_incidencia: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_estado: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fecha_hora_estado: {
    type: DataTypes.DATE, // Mapea a time / timestamp
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'incidencias_estados',
  timestamps: false
});

module.exports = IncidenciaEstado;