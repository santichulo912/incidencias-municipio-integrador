const { Router } = require('express');
const router = Router();
const { check } = require('express-validator');

// Middlewares de autenticación y autorización
const { validarJWT } = require('../middlewares/validarToken');
const { permitirRoles } = require('../middlewares/validarRoles');

// Funciones del controlador de articulos
const {
    listarArticulos,
    obtenerArticuloPorId,
    actualizarArticulo,
    crearArticulo,
    eliminarArticulo
} = require('../controllers/articuloController');

//Permisos de las funciones

//BROWSE y READ
router.get('/', [validarJWT, permitirRoles(1, 2, 3)], listarArticulos);
router.get('/:id', [validarJWT, permitirRoles(1, 2, 3)], obtenerArticuloPorId);

//ADD, EDIT y DELETE
router.post('/', [
    validarJWT,
    permitirRoles(1, 2),
    check('descripcion', 'La descripción es obligatoria').not().isEmpty(),
    check('id_area', 'El área es obligatoria').not().isEmpty(),
    check('id_categoria', 'La categoría es obligatoria').not().isEmpty()
], crearArticulo);

router.put('/:id', [
    validarJWT,
    permitirRoles(1, 2),
    check('descripcion', 'La descripción no puede quedar vacía').not().isEmpty()
], actualizarArticulo);

router.delete('/:id', [validarJWT, permitirRoles(1, 2)], eliminarArticulo);

module.exports = router;