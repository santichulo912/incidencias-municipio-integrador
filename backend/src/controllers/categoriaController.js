const { validationResult } = require('express-validator');
const pool = require('../config/database');

// BROWSE: Listar categorías activas
const obtenerCategorias = async (req, res) => {
    try {
        const query = 'SELECT * FROM categorias WHERE activo = 1';
        const result = await pool.query(query);

        return res.status(200).json({
            ok: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error al obtener categorias:', error);
        return res.status(500).json({
            ok: false,
            mensaje: 'Error interno del servidor al obtener categorias.'
        });
    }
};

// READ: Obtener una por ID
const obtenerCategoriasPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const query = 'SELECT * FROM categorias WHERE id_categoria = $1 AND activo = 1';
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Categoria no encontrada o inactiva.'
            });
        }
        return res.status(200).json({ ok: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error al obtener la categoria:', error);
        return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor.' });
    }
};

// EDIT: Modificar categoría existente
const actualizarCategoria = async (req, res) => {
    try {
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            return res.status(400).json({ ok: false, errores: errores.array() });
        }

        const { id } = req.params;
        const { descripcion } = req.body;

        const query = 'UPDATE categorias SET descripcion = $1 WHERE id_categoria = $2 AND activo = 1 RETURNING *';
        const result = await pool.query(query, [descripcion, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ ok: false, mensaje: 'Categoría no encontrada.' });
        }

        return res.status(200).json({ ok: true, mensaje: 'Categoría actualizada con éxito.' });
    } catch (error) {
        console.error('Error al actualizar la categoría:', error);
        return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor.' });
    }
};

// ADD: Crear nueva categoría
const crearCategoria = async (req, res) => {
    try {
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            return res.status(400).json({ ok: false, errores: errores.array() });
        }
        const { descripcion } = req.body;

        const query = 'INSERT INTO categorias (descripcion, activo) VALUES ($1, 1) RETURNING *';
        const result = await pool.query(query, [descripcion]);

        return res.status(201).json({
            ok: true,
            mensaje: 'Categoria creada con exito',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error al crear la categoria:', error);
        return res.status(500).json({
            ok: false,
            mensaje: 'Error interno del servidor al crear la categoria.'
        });
    }
};

// DELETE: Soft Delete (marcar activo = 0)
const eliminarCategoria = async (req, res) => {
    try {
        const { id } = req.params;

        const query = 'UPDATE categorias SET activo = 0 WHERE id_categoria = $1 AND activo = 1 RETURNING *';
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ ok: false, mensaje: 'Categoría no encontrada.' });
        }

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