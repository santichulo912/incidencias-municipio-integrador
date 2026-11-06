const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

// Traemos el middleware 
const { validarJWT } = require('../middlewares/validarToken');
const { permitirRoles } = require('../middlewares/validarRoles');

// Funciones del controlador de categorías
const {
    obtenerCategorias,
    obtenerCategoriasPorId,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria
} = require('../controllers/categoriaController');

// FUNCIONES DEL BREAD

// BROWSE: Trae todas las categorías (con acceso para los 3 roles: Director, Técnico, Empleado)
router.get('/', [validarJWT, permitirRoles(1, 2, 3)], obtenerCategorias);

// READ: Trae una sola categoría por su ID (Acceso para los 3 roles)
router.get('/:id', [validarJWT, permitirRoles(1, 2, 3)], obtenerCategoriasPorId);

// ADD: Crea una categoría nueva (Exclusivo para el Director: Rol 1)
router.post('/', [
    validarJWT,
    permitirRoles(1),
    check('descripcion', 'La descripción es obligatoria').not().isEmpty()
], crearCategoria);

// EDIT: Modifica una categoría existente (exclusivo para el director)
router.put('/:id', [
    validarJWT,
    permitirRoles(1),
    check('descripcion', 'La descripción no puede quedar vacía').not().isEmpty()
], actualizarCategoria);

// DELETE: Borrado lógico (exclusivo para el director)
router.delete('/:id', [validarJWT, permitirRoles(1)], eliminarCategoria);

module.exports = router;