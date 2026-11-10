const { Router } = require('express');
const router = Router();
const { check } = require('express-validator');

//Traemos el middleware 
const { validarJWT } = require('../middlewares/validarToken');
const { permitirRoles } = require('../middlewares/validarRoles');

//Funciones del controlador de categorías
const {
    obtenerCategorias,
    obtenerCategoriasPorId,
    actualizarCategoria,
    crearCategoria,
    eliminarCategoria
} = require('../controllers/categoriaController');

//Permisos
//BROWSE y READ
router.get('/', [validarJWT, permitirRoles(1, 2, 3)], obtenerCategorias);
router.get('/:id', [validarJWT, permitirRoles(1, 2, 3)], obtenerCategoriasPorId);

//ADD, EDIT y DELETE
router.post('/', [
    validarJWT,
    permitirRoles(1, 2),
    check('descripcion', 'La descripción es obligatoria').not().isEmpty()
], crearCategoria);

router.put('/:id', [
    validarJWT,
    permitirRoles(1, 2),
    check('descripcion', 'La descripción no puede quedar vacía').not().isEmpty()
], actualizarCategoria);

router.delete('/:id', [validarJWT, permitirRoles(1, 2), eliminarCategoria])

module.exports = router;