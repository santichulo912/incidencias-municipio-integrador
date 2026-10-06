const { Incidencia } = require('../models'); // Importamos el modelo desde la carpeta models

// 1. Listar las incidencias del usuario logueado
async function listar(req, res) {
    try {
        // validarJWT guarda los datos en req.usuario. Usamos el ID del usuario.
        // (Ajustá 'id_usuario' si en el token lo guardaste simplemente como 'id')
        const idUsuario = req.usuario.id_usuario;

        const incidencias = await Incidencia.findAll({
            where: { creado_por: idUsuario },
            order: [['id_incidencia', 'DESC']] // Las más nuevas primero
        });

        res.json({ data: incidencias });
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

        const nuevaIncidencia = await Incidencia.create({
            id_articulo: id_articulo,
            id_estado: 1, // 1 representa 'Pendiente'
            creado_por: idUsuario,
            creado: new Date(), // Fecha actual
            prioridad: 1, // Prioridad por defecto
            descripcion_pedido: descripcion_pedido
        });

        res.json({ 
            mensaje: 'Incidencia creada con éxito', 
            data: nuevaIncidencia 
        });
    } catch (error) {
        console.error("Error al crear incidencia:", error);
        res.status(500).json({ mensaje: 'Error al guardar la incidencia' });
    }
}

// 3. Cancelar una incidencia (Cambiar estado a finalizada/cancelada)
async function cancelar(req, res) {
    try {
        const { id } = req.params;
        const idUsuario = req.usuario.id_usuario;

        // Buscamos la incidencia asegurándonos de que le pertenezca a este usuario
        const incidencia = await Incidencia.findOne({
            where: {
                id_incidencia: id,
                creado_por: idUsuario
            }
        });

        if (!incidencia) {
            return res.status(404).json({ mensaje: 'Incidencia no encontrada o no tienes permisos' });
        }

        // Actualizamos el estado a 2 (Cancelada/Finalizada)
        incidencia.id_estado = 2; 
        await incidencia.save();

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