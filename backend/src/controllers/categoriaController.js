const { validationResult } = require('express-validator');
const Categoria = require('../models/Categoria'); 


//BROWSE: Listas todas las categorias activas
const obtenerCategorias = async (req, res) => {
    try{
        const categorias = await Categoria.findAll({
            where: {activo: 1}
        });

        return res.status(200).json({
            ok: true,
            data: categorias
        });
    } catch (error) {
        console.error('Error al obtener categorias:', error)
        return res.status(500).json({
            ok: false,
            mensaje: 'Error interno del servior al obtener categorias.'
        });
    }
};

//ADD: Creas una nueva categoria
const crearCategoria = async (req, res) => {
    try{
        const errores = validationResult(req);
        if (!errores.isEmpty()){
            return res.status(400).json({
                ok: false,
                errores: errores.array()
            });
        }
        const {descripcion} = req.body;

        const nuevaCategoria = await Categoria.create({
        descripcion: descripcion
        });

        return res.status(201).json({
            ok: true,
            mensaje: 'Categoria creada con exito',
            data: nuevaCategoria
        });
    } catch (error) {
        console.error('Error al crear la categoria:', error);
        return res.status(500).json({
            ok: false,
            mensaje: 'Error interno del servidor al crear la categoria.'
        });
    }

};

//READ: Leer una sola categoria por si ID
const obtenerCategoriasPorId = async (req, res) => {
    try{
        const {id} = req.params;

        const categoria = await  Categoria.findOne({
            where: {id_categoria: id, activo: 1}
        });

        if (!categoria){
            return res.status(404).json({
                ok: false,
                mensaje: 'Categoria no encontrada o inactiva.'
            });
        }
        return res.status(200).json({ok: true, data: categoria});
    } catch (error) {
        console.error('Error al obtener la categoria:', error);
        return res.status(500).json({ok: false, mensaje: 'Error interno del servidor.'});
    }
};

//EDIT: Modificar una categoria existente
const actualizarCategoria = async (req, res) => {
    try {
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            return res.status(400).json({ ok: false, errores: errores.array() });
        }

        const { id } = req.params;
        const { descripcion } = req.body;

        const categoria = await Categoria.findOne({ where: { id_categoria: id, activo: 1 } });

        if (!categoria) {
            return res.status(404).json({ ok: false, mensaje: 'Categoría no encontrada.' });
        }

        await Categoria.update({ descripcion }, { where: { id_categoria: id } });

        return res.status(200).json({ ok: true, mensaje: 'Categoría actualizada con éxito.' });
    } catch (error) {
        console.error('Error al actualizar la categoría:', error);
        return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor.' });
    }
};

//DELETE: Borrado lógico (Soft Delete)
const eliminarCategoria = async (req, res) => {
    try {
        const { id } = req.params;

        const categoria = await Categoria.findOne({ where: { id_categoria: id, activo: 1 } });

        if (!categoria) {
            return res.status(404).json({ ok: false, mensaje: 'Categoría no encontrada.' });
        }

        // Acá aplicamos el Soft Delete cambiando el estado a 0
        await Categoria.update({ activo: 0 }, { where: { id_categoria: id } });

        return res.status(200).json({ ok: true, mensaje: 'Categoría eliminada con éxito.' });
    } catch (error) {
        console.error('Error al eliminar la categoría:', error);
        return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor.' });
    }
};

module.exports = {
    obtenerCategorias,
    crearCategoria,
    obtenerCategoriasPorId,
    actualizarCategoria,
    eliminarCategoria
};