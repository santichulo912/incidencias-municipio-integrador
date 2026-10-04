const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

// Traemos el middleware que armaste para proteger las rutas
const validarToken = require('../middlewares/validarToken');

// Funciones del controlador de categorías
const {
    obtenerCategorias,
    obtenerCategoriaPorId,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria
} = require('../controllers/categoriaController');


// BROWSE: Trae todas las categorías (protegido por token)
router.get('/', validarToken, obtenerCategorias);

// READ: Trae una sola categoría por su ID
router.get('/:id', validarToken, obtenerCategoriaPorId);

// ADD: Crea una categoría nueva
router.post('/', [
    validarToken, // Primero chequeamos que el usuario esté logueado
    check('descripcion', 'La descripción es obligatoria').not().isEmpty() // Después validamos los datos
], crearCategoria);

// EDIT: Modifica una categoría existente
router.put('/:id', [
    validarToken,
    check('descripcion', 'La descripción no puede quedar vacía').not().isEmpty()
], actualizarCategoria);

// DELETE: Borrado lógico (cambia el estado activo a 0)
router.delete('/:id', validarToken, eliminarCategoria);

module.exports = router;
