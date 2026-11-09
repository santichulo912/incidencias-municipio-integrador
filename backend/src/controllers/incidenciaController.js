const pool = require('../config/database');

//Listar las incidencias del usuario logueado
const pool = require('../config/database');

async function listarIncidencias(req, res) {
    // Capturamos el usuario logueado 
    const { id_usuario, rol } = req.usuario;

    try {
        let query = `
      SELECT 
        i.id_incidencia,
        i.descripcion_pedido,
        i.creado,
        i.id_estado,
        e.descripcion AS estado_descripcion,
        a.descripcion AS articulo_descripcion,
        u.nombres AS solicitante_nombres,
        u.apellidos AS solicitante_apellidos
      FROM incidencias i
      INNER JOIN estados e ON i.id_estado = e.id_estado
      INNER JOIN articulos a ON i.id_articulo = a.id_articulo
      INNER JOIN usuarios u ON i.id_usuario = u.id_usuario
    `;

        const valores = [];

        //Visualizacion según rol:
        if (rol === 3) {
            //Empleado Municipal: solo ve sus propias incidencias
            query += ` WHERE i.id_usuario = $1`;
            valores.push(id_usuario);

        } else if (rol === 2) {
            //Técnico: ve las asignadas a su cargo
            query += ` WHERE i.id_tecnico_asignado = $1`;
            valores.push(id_usuario);

        }
        //Director: ve todas las incidencias del sistema.

        query += ` ORDER BY i.creado DESC;`;

        const result = await pool.query(query, valores);

        res.json({
            ok: true,
            data: result.rows
        });

    } catch (error) {
        console.error('Error al listar incidencias:', error);
        res.status(500).json({ success: false, mensaje: 'Error al listar incidencias' });
    }
}

//Crear una nueva incidencia
async function crearIncidencia(req, res) {
    try {
        const idUsuario = req.usuario.id_usuario;
        const { id_articulo, descripcion_pedido } = req.body;

        //Insertar en la tabla principal y retornar la fila creada con su id_incidencia
        const queryIncidencia = `
          INSERT INTO incidencias (id_articulo, id_estado, creado_por, creado, prioridad, descripcion_pedido)
          VALUES ($1, $2, $3, NOW(), $4, $5)
          RETURNING *;
        `;
        const valuesIncidencia = [id_articulo, 1, idUsuario, 1, descripcion_pedido];
        const resultIncidencia = await pool.query(queryIncidencia, valuesIncidencia);
        const nuevaIncidencia = resultIncidencia.rows[0];

        //Insertar el historial en incidencias_estados
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

//Cancelar una incidencia
async function cancelarIncidencia(req, res) {
    try {
        const { id } = req.params;
        const { id_usuario, rol } = req.usuario; // Extraemos id y rol

        let queryUpdate = '';
        let parametros = [];

        // Si es Director
        if (rol === 1) {
            queryUpdate = `
                UPDATE incidencias 
                SET id_estado = 4 
                WHERE id_incidencia = $1 AND id_estado = 1
                RETURNING *;
            `;
            parametros = [id];
        } else {
            // Si es Empleado
            queryUpdate = `
                UPDATE incidencias 
                SET id_estado = 4 
                WHERE id_incidencia = $1 AND id_usuario = $2 AND id_estado = 1
                RETURNING *;
            `;
            parametros = [id, id_usuario];
        }

        const resultUpdate = await pool.query(queryUpdate, parametros);

        if (resultUpdate.rows.length === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Incidencia no encontrada, no está en estado Pendiente o no tienes permisos'
            });
        }

        // Registramos el cambio de estado en incidencias_estados con el estado Cancelada
        const queryEstado = `
            INSERT INTO incidencias_estados (id_incidencia, id_estado, fecha_hora_estado)
            VALUES ($1, $2, NOW());
        `;
        await pool.query(queryEstado, [id, 4]);

        res.json({
            ok: true,
            mensaje: 'Incidencia cancelada correctamente',
            data: resultUpdate.rows[0]
        });

    } catch (error) {
        console.error("Error al cancelar incidencia:", error);
        res.status(500).json({ success: false, mensaje: 'Error al cancelar la incidencia' });
    }
}

//Cambiar estado de incidencia
async function cambiarEstado(req, res) {
    const { id } = req.params;
    const { id_estado } = req.body;
    const { id_usuario, rol } = req.usuario;

    //Validamos que solo intente pasar a estados válidos (2 o 3)
    if (![2, 3].includes(Number(id_estado))) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Estado no válido para esta operación.'
        });
    }

    try {
        let query = '';
        let valores = [];

        if (rol === 1) {
            //Director: puede actualizar el estado de cualquier incidencia no cancelada
            query = `
        UPDATE incidencias 
        SET id_estado = $1 
        WHERE id_incidencia = $2 AND id_estado != 4
        RETURNING *;
      `;
            valores = [id_estado, id];
        } else {
            //Técnico: actualiza solo las incidencias asignadas a él y que no estén canceladas
            query = `
        UPDATE incidencias 
        SET id_estado = $1 
        WHERE id_incidencia = $2 AND id_tecnico_asignado = $3 AND id_estado != 4
        RETURNING *;
      `;
            valores = [id_estado, id, id_usuario];
        }

        const result = await pool.query(query, valores);

        if (result.rows.length === 0) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No se pudo actualizar el estado: la incidencia no existe, no está asignada a tu usuario o se encuentra cancelada.'
            });
        }

        res.json({
            ok: true,
            mensaje: 'Estado de la incidencia actualizado con éxito.',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Error al cambiar el estado de la incidencia:', error);
        res.status(500).json({ ok: false, mensaje: 'Error al actualizar la incidencia' });
    }
}

// Asignar incidencia a técnico
async function asignarTecnico(req, res) {
    const { id } = req.params; // ID de la incidencia
    const { id_tecnico } = req.body; // ID del usuario técnico (id_usuario)

    try {
        //Valida que el usuario exista, esté activo y sea Técnico
        const queryTecnico = `
      SELECT id_usuario FROM usuarios 
      WHERE id_usuario = $1 AND rol = 2 AND activo = 1;
    `;
        const resTecnico = await pool.query(queryTecnico, [id_tecnico]);

        if (resTecnico.rows.length === 0) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario especificado no existe o no es un técnico habilitado.'
            });
        }

        //Actualizamos campo asignado_a en la incidencia
        const queryAsignar = `
      UPDATE incidencias 
      SET asignado_a = $1 
      WHERE id_incidencia = $2 AND id_estado != 4
      RETURNING *;
    `;
        const result = await pool.query(queryAsignar, [id_tecnico, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Incidencia no encontrada o se encuentra cancelada.'
            });
        }

        res.json({
            ok: true,
            mensaje: 'Incidencia asignada al técnico correctamente',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Error al asignar técnico:', error);
        res.status(500).json({ ok: false, mensaje: 'Error interno al asignar el técnico' });
    }
}

//Obtener lista de técnicos activos
async function obtenerTecnicos(req, res) {
    try {
        const query = `
      SELECT id_usuario, nombres, apellidos 
      FROM usuarios 
      WHERE rol = 2 AND activo = 1 
      ORDER BY apellidos, nombres ASC;
    `;
        const result = await pool.query(query);

        res.json({
            ok: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error al listar técnicos:', error);
        res.status(500).json({ ok: false, mensaje: 'Error al obtener la lista de técnicos' });
    }
}

module.exports = {
    listarIncidencias,
    crearIncidencia,
    cancelarIncidencia,
    cambiarEstado,
    asignarTecnico,
    obtenerTecnicos
};