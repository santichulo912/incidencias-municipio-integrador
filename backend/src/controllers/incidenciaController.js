const pool = require('../config/database');

//Listar las incidencias del usuario
const listarIncidencias = async (req, res) => {
    //Extraemos el ID del usuario desde el JWT
    const id_usuario = req.usuario ? (req.usuario.id_usuario || req.usuario.id) : req.uid;
    const rol = req.usuario ? req.usuario.rol : null;

    try {
        let queryText = '';
        let parametros = [];

        if (rol === 1) {
            //Director: Ve todas las incidencias
            queryText = `
                SELECT 
                    i.*,
                    a.descripcion AS articulo_descripcion,
                    u.nombres || ' ' || u.apellidos AS nombre_empleado,
                    t.nombres || ' ' || t.apellidos AS nombre_tecnico,
                    e.descripcion AS estado_descripcion
                FROM incidencias i
                LEFT JOIN articulos a ON i.id_articulo = a.id_articulo
                LEFT JOIN usuarios u ON i.creado_por = u.id_usuario
                LEFT JOIN usuarios t ON i.asignado_a = t.id_usuario
                LEFT JOIN estados e ON i.id_estado = e.id_estado
                ORDER BY i.id_incidencia DESC
            `;
        } else if (rol === 2) {
            //Técnico: Ve las incidencias asignadas a él
            queryText = `
                SELECT 
                    i.*,
                    a.descripcion AS articulo_descripcion,
                    u.nombres || ' ' || u.apellidos AS nombre_empleado,
                    e.descripcion AS estado_descripcion
                FROM incidencias i
                LEFT JOIN articulos a ON i.id_articulo = a.id_articulo
                LEFT JOIN usuarios u ON i.creado_por = u.id_usuario
                LEFT JOIN estados e ON i.id_estado = e.id_estado
                WHERE i.asignado_a = $1
                ORDER BY i.id_incidencia DESC
            `;
            parametros = [id_usuario];
        } else {
            // Empleado: Ve únicamente las incidencias creadas por él
            queryText = `
                SELECT 
                    i.*,
                    a.descripcion AS articulo_descripcion,
                    e.descripcion AS estado_descripcion
                FROM incidencias i
                LEFT JOIN articulos a ON i.id_articulo = a.id_articulo
                LEFT JOIN estados e ON i.id_estado = e.id_estado
                WHERE i.creado_por = $1
                ORDER BY i.id_incidencia DESC
            `;
            parametros = [id_usuario];
        }

        const result = await pool.query(queryText, parametros);

        return res.status(200).json({
            ok: true,
            data: result.rows
        });

    } catch (error) {
        console.error("Error al listar incidencias:", error);
        return res.status(500).json({
            ok: false,
            mensaje: "Error interno al obtener incidencias"
        });
    }
};

//Crear incidencia
const crearIncidencia = async (req, res) => {
    const { id_articulo, descripcion_pedido } = req.body;

    //ID del usuario autenticado traído del JWT
    const id_usuario = req.usuario ? (req.usuario.id_usuario || req.usuario.id) : req.uid;

    if (!id_usuario) {
        return res.status(400).json({
            ok: false,
            mensaje: "Error: No se pudo identificar al usuario autenticado desde el token."
        });
    }

    try {
        const queryText = `
            INSERT INTO incidencias (id_articulo, creado_por, descripcion_pedido, id_estado) 
            VALUES ($1, $2, $3, 1) 
            RETURNING *
        `;

        const result = await pool.query(queryText, [id_articulo, id_usuario, descripcion_pedido]);

        return res.status(201).json({
            ok: true,
            mensaje: 'Incidencia creada con éxito',
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Error al crear incidencia:", error.message);
        return res.status(500).json({
            ok: false,
            mensaje: `Error al guardar en BD: ${error.message}`
        });
    }
};

//Cancelar incidencia
async function cancelarIncidencia(req, res) {
    try {
        const { id } = req.params;
        const id_usuario = req.usuario ? (req.usuario.id_usuario || req.usuario.id) : req.uid;
        const rol = req.usuario ? req.usuario.rol : null;

        let queryUpdate = '';
        let parametros = [];

        //Si es Director
        if (rol === 1) {
            queryUpdate = `
                UPDATE incidencias 
                SET id_estado = 4 
                WHERE id_incidencia = $1 AND id_estado = 1
                RETURNING *;
            `;
            parametros = [id];
        } else {
            //Si es Empleado
            queryUpdate = `
                UPDATE incidencias 
                SET id_estado = 4 
                WHERE id_incidencia = $1 AND creado_por = $2 AND id_estado = 1
                RETURNING *;
            `;
            parametros = [id, id_usuario];
        }

        const resultUpdate = await pool.query(queryUpdate, parametros);

        if (resultUpdate.rows.length === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Incidencia no encontrada'
            });
        }

        //Registrar en el historial de estados
        const queryEstado = `
            INSERT INTO incidencias_estados (id_incidencia, id_estado, fecha_hora_estado)
            VALUES ($1, 4, CURRENT_TIMESTAMP);
        `;
        await pool.query(queryEstado, [id]);

        return res.json({
            ok: true,
            mensaje: 'Incidencia cancelada correctamente',
            data: resultUpdate.rows[0]
        });

    } catch (error) {
        console.error("Error al cancelar incidencia:", error);
        return res.status(500).json({ ok: false, mensaje: 'Error al cancelar incidencia' });
    }
}

//Cambiar estado de incidencia
async function cambiarEstado(req, res) {
    const { id } = req.params;
    const { id_estado } = req.body;
    const id_usuario = req.usuario ? (req.usuario.id_usuario || req.usuario.id) : req.uid;
    const rol = req.usuario ? req.usuario.rol : null;

    if (![2, 3].includes(Number(id_estado))) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Estado no válido para esta operación.'
        });
    }

    try {
        let query = '';
        let valores = [];
        //Director
        if (rol === 1) {
            query = `
                UPDATE incidencias 
                SET id_estado = $1 
                WHERE id_incidencia = $2 AND id_estado != 4
                RETURNING *;
            `;
            valores = [id_estado, id];
        } else {
            //Técnico
            query = `
                UPDATE incidencias 
                SET id_estado = $1 
                WHERE id_incidencia = $2 AND asignado_a = $3 AND id_estado != 4
                RETURNING *;
            `;
            valores = [id_estado, id, id_usuario];
        }

        const result = await pool.query(query, valores);

        if (result.rows.length === 0) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No se pudo actualizar el estado: la incidencia no existe, no está asignada a tu usuario o está cancelada.'
            });
        }

        //Registrar en incidencias_estados
        const queryEstado = `
            INSERT INTO incidencias_estados (id_incidencia, id_estado, fecha_hora_estado)
            VALUES ($1, $2, CURRENT_TIMESTAMP);
        `;
        await pool.query(queryEstado, [id, id_estado]);

        return res.json({
            ok: true,
            mensaje: 'Estado actualizado correctamente.',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Error al cambiar el estado de la incidencia:', error);
        return res.status(500).json({ ok: false, mensaje: 'Error al actualizar la incidencia' });
    }
}

//Asignar incidencia a técnico
async function asignarTecnico(req, res) {
    const { id } = req.params;
    const { id_tecnico } = req.body;

    try {
        const queryTecnico = `
            SELECT id_usuario FROM usuarios 
            WHERE id_usuario = $1 AND rol = 2 AND activo = 1;
        `;
        const resTecnico = await pool.query(queryTecnico, [id_tecnico]);

        if (resTecnico.rows.length === 0) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario no existe o no es un técnico habilitado.'
            });
        }

        //Actualizamos asignacion
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
                mensaje: 'Incidencia no encontrada o cancelada.'
            });
        }

        return res.json({
            ok: true,
            mensaje: 'Incidencia asignada correctamente',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Error al asignar técnico:', error);
        return res.status(500).json({ ok: false, mensaje: 'Error interno al asignar técnico' });
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

        return res.json({
            ok: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error al listar técnicos:', error);
        return res.status(500).json({ ok: false, mensaje: 'Error al obtener la lista de técnicos' });
    }
}

//Obtener métricas para el Dashboard del Director
async function obtenerDashboard(req, res) {
    try {
        const queryEstados = `
            SELECT 
                COUNT(*) FILTER (WHERE id_estado = 1) AS pendientes,
                COUNT(*) FILTER (WHERE id_estado = 2) AS en_proceso,
                COUNT(*) FILTER (WHERE id_estado = 3) AS resueltas,
                COUNT(*) FILTER (WHERE id_estado = 4) AS canceladas,
                COUNT(*) AS total
            FROM incidencias;
        `;
        const resEstados = await pool.query(queryEstados);

        const queryHoy = `
            SELECT COUNT(*) AS total_hoy 
            FROM incidencias 
            WHERE DATE(creado) = CURRENT_DATE;
        `;
        const resHoy = await pool.query(queryHoy);

        return res.json({
            ok: true,
            data: {
                pendientes: Number(resEstados.rows[0].pendientes || 0),
                en_proceso: Number(resEstados.rows[0].en_proceso || 0),
                resueltas: Number(resEstados.rows[0].resueltas || 0),
                canceladas: Number(resEstados.rows[0].canceladas || 0),
                total_hoy: Number(resHoy.rows[0].total_hoy || 0)
            }
        });
    } catch (error) {
        console.error("Error al obtener dashboard:", error);
        return res.status(500).json({ ok: false, mensaje: "Error al cargar dashboard" });
    }
}

//Generar reporte estadístico
async function obtenerReportes(req, res) {
    try {
        // Estadísticas por categoría
        const queryCategorias = `
            SELECT 
                c.descripcion AS categoria, 
                COUNT(i.id_incidencia) AS total
            FROM incidencias i
            JOIN articulos a ON i.id_articulo = a.id_articulo
            JOIN categorias c ON a.id_categoria = c.id_categoria
            GROUP BY c.id_categoria, c.descripcion
            ORDER BY total DESC;
        `;
        const resCategorias = await pool.query(queryCategorias);

        //Estadísticas por fecha
        const queryFechas = `
            SELECT 
                TO_CHAR(creado, 'YYYY-MM-DD') AS fecha,
                COUNT(*) AS cantidad
            FROM incidencias
            GROUP BY TO_CHAR(creado, 'YYYY-MM-DD')
            ORDER BY fecha DESC
            LIMIT 7;
        `;
        const resFechas = await pool.query(queryFechas);

        return res.json({
            ok: true,
            data: {
                por_categoria: resCategorias.rows,
                por_fecha: resFechas.rows
            }
        });
    } catch (error) {
        console.error("Error al obtener reportes:", error);
        return res.status(500).json({ ok: false, mensaje: "Error al generar reportes" });
    }
}

module.exports = {
    listarIncidencias,
    crearIncidencia,
    cancelarIncidencia,
    cambiarEstado,
    asignarTecnico,
    obtenerTecnicos,
    obtenerDashboard,
    obtenerReportes
};