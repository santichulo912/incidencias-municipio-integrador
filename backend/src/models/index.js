const sequelize = require('../config/database');

const Area = require('./Area');
const Usuario = require('./Usuario');
const Categoria = require('./Categoria');
const Articulo = require('./Articulo');
const Estado = require('./Estado');
const Incidencia = require('./Incidencia');
const IncidenciaEstado = require('./IncidenciaEstado');

// Un área tiene muchos usuarios y muchos artículos
Area.hasMany(Usuario, { foreignKey: 'id_area' });
Usuario.belongsTo(Area, { foreignKey: 'id_area' });

Area.hasMany(Articulo, { foreignKey: 'id_area' });
Articulo.belongsTo(Area, { foreignKey: 'id_area' });

// Una categoría tiene muchos artículos
Categoria.hasMany(Articulo, { foreignKey: 'id_categoria' });
Articulo.belongsTo(Categoria, { foreignKey: 'id_categoria' });

// Un artículo tiene muchas incidencias
Articulo.hasMany(Incidencia, { foreignKey: 'id_articulo' });
Incidencia.belongsTo(Articulo, { foreignKey: 'id_articulo' });

// Un estado puede estar en muchas incidencias (estado actual)
Estado.hasMany(Incidencia, { foreignKey: 'id_estado' });
Incidencia.belongsTo(Estado, { foreignKey: 'id_estado' });

// Una incidencia fue creada por un usuario, y está asignada a otro (o el mismo)
Usuario.hasMany(Incidencia, { foreignKey: 'creado_por', as: 'incidenciasCreadas' });
Incidencia.belongsTo(Usuario, { foreignKey: 'creado_por', as: 'creador' });

Usuario.hasMany(Incidencia, { foreignKey: 'asignado_a', as: 'incidenciasAsignadas' });
Incidencia.belongsTo(Usuario, { foreignKey: 'asignado_a', as: 'asignado' });

// El historial de cambios de estado de una incidencia
Incidencia.hasMany(IncidenciaEstado, { foreignKey: 'id_incidencia' });
IncidenciaEstado.belongsTo(Incidencia, { foreignKey: 'id_incidencia' });

Estado.hasMany(IncidenciaEstado, { foreignKey: 'id_estado' });
IncidenciaEstado.belongsTo(Estado, { foreignKey: 'id_estado' });

module.exports = {
  sequelize,
  Area,
  Usuario,
  Categoria,
  Articulo,
  Estado,
  Incidencia,
  IncidenciaEstado,
};