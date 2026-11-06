const pool = require('../config/database');

// 1. Listar las incidencias del usuario logueado
async function listar(req, res) {
    try {
        const idUsuario = req.usuario.id_usuario;

        const query = `
          SELECT 
            i.id_incidencia,
            i.id_articulo,
            i.id_estado,
            i.creado_por,
            i.creado,
            i.prioridad,
            i.descripcion_pedido,
            a.descripcion AS articulo_descripcion
          FROM incidencias i
          LEFT JOIN articulos a ON i.id_articulo = a.id_articulo
          WHERE i.creado_por = $1
          ORDER BY i.id_incidencia DESC;
        `;

        const result = await pool.query(query, [idUsuario]);

        res.json({ data: result.rows });
    } catch (error) {
        console.error("Error al listar incidencias:", error);
        res.status(500).json({ mensaje: 'Error al listar incidencias' });
    }
}

// 2. Crear una nueva incidencia
async function crear(req, res) {
    try {
        const idUsuario = req.usuario.id_usuario;
        const { id_articulo, descripcion_pedido } = req.body;

        // 1. Insertar en la tabla principal y retornar la fila creada con su id_incidencia
        const queryIncidencia = `
          INSERT INTO incidencias (id_articulo, id_estado, creado_por, creado, prioridad, descripcion_pedido)
          VALUES ($1, $2, $3, NOW(), $4, $5)
          RETURNING *;
        `;
        const valuesIncidencia = [id_articulo, 1, idUsuario, 1, descripcion_pedido];
        const resultIncidencia = await pool.query(queryIncidencia, valuesIncidencia);
        const nuevaIncidencia = resultIncidencia.rows[0];

        // 2. Insertar el historial en incidencias_estados
        const queryEstado = `
          INSERT INTO incidencias_estados (id_incidencia, id_estado, fecha_hora_estado)
          VALUES ($1, $2, NOW());
        `;
        await pool.query(queryEstado, [nuevaIncidencia.id_incidencia, 1]);

        res.json({
            mensaje: 'Incidencia creada con éxito',
            data: nuevaIncidencia
        });
    } catch (error) {
        console.error("Error al crear incidencia:", error);
        res.status(500).json({ mensaje: 'Error al guardar la incidencia' });
    }
}

// 3. Cancelar una incidencia
async function cancelar(req, res) {
    try {
        const { id } = req.params;
        const idUsuario = req.usuario.id_usuario;

        // 1. Actualizamos el estado a 2 en la tabla principal asegurando que sea del usuario
        const queryUpdate = `
          UPDATE incidencias 
          SET id_estado = 2 
          WHERE id_incidencia = $1 AND creado_por = $2
          RETURNING *;
        `;
        const resultUpdate = await pool.query(queryUpdate, [id, idUsuario]);

        if (resultUpdate.rows.length === 0) {
            return res.status(404).json({ mensaje: 'Incidencia no encontrada o no tienes permisos' });
        }

        // 2. Registramos el cambio de estado en el historial
        const queryEstado = `
          INSERT INTO incidencias_estados (id_incidencia, id_estado, fecha_hora_estado)
          VALUES ($1, $2, NOW());
        `;
        await pool.query(queryEstado, [id, 2]);

        res.json({ mensaje: 'Incidencia cancelada correctamente' });
    } catch (error) {
        console.error("Error al cancelar incidencia:", error);
        res.status(500).json({ mensaje: 'Error al cancelar la incidencia' });
    }
}

module.exports = {
    listar,
    crear,
    cancelar
};