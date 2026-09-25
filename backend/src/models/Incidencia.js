const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Incidencia = sequelize.define('Incidencia', {
  id_incidencia: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  id_articulo: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_estado: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  creado_por: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  asignado_a: {
    type: DataTypes.INTEGER,
    allowNull: true // Puede estar en null hasta que un coordinador la asigne
  },
  creado: {
    type: DataTypes.DATE, // Mapea al tipo time/timestamp
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  prioridad: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  descripcion_pedido: {
    type: DataTypes.STRING(255), // varchar
    allowNull: false
  },
  descripcion_resolucion: {
    type: DataTypes.STRING(255), // varchar
    allowNull: true // Se llena recién cuando el técnico finaliza la incidencia
  }
}, {
  tableName: 'incidencias',
  timestamps: false
});

module.exports = Incidencia;