const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

// Traemos el middleware 
const { validarJWT } = require('../middlewares/validarToken');
const { verificarDirector } = require('../middlewares/validarRoles');

// Funciones del controlador de categorías
const {
    obtenerCategorias,
    obtenerCategoriasPorId,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria
} = require('../controllers/categoriaController');


// BROWSE: Trae todas las categorías (protegido por token)
router.get('/', validarJWT, obtenerCategorias);

// READ: Trae una sola categoría por su ID
router.get('/:id', validarJWT, obtenerCategoriasPorId);

// ADD: Crea una categoría nueva
router.post('/', [
    validarJWT, // Primero chequeamos que el usuario esté logueado
    verificarDirector,
    check('descripcion', 'La descripción es obligatoria').not().isEmpty() // Después validamos los datos
], crearCategoria);

// EDIT: Modifica una categoría existente
router.put('/:id', [
    validarJWT,
    verificarDirector,
    check('descripcion', 'La descripción no puede quedar vacía').not().isEmpty()
], actualizarCategoria);

// DELETE: Borrado lógico (cambia el estado activo a 0)
router.delete('/:id', validarJWT, verificarDirector, eliminarCategoria);

module.exports = router;
