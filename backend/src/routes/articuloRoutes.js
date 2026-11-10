const { Router } = require('express');
const { check } = require('express-validator');
const { validarJWT } = require('../middlewares/validarToken');
const { permitirRoles } = require('../middlewares/validarRoles');

const router = Router();

const {
    obtenerArticulos,
    obtenerArticuloPorId,
    crearArticulo,
    actualizarArticulo,
    eliminarArticulo
} = require('../controllers/articuloController');

//Obtener todos los artículos
router.get('/', [validarJWT, permitirRoles(1, 2, 3)], obtenerArticulos);

//Obtener un artículo por ID
router.get('/:id', [validarJWT, permitirRoles(1, 2, 3)], obtenerArticuloPorId);

//Crear artículo
router.post('/', [
    validarJWT,
    permitirRoles(1, 2),
    check('descripcion', 'La descripción del artículo es obligatoria').not().isEmpty(),
    check('id_categoria', 'La categoría es obligatoria').isInt()
], crearArticulo);

//Actualizar artículo
router.put('/:id', [
    validarJWT,
    permitirRoles(1, 2),
    check('descripcion', 'La descripción del artículo es obligatoria').not().isEmpty(),
    check('id_categoria', 'La categoría es obligatoria').isInt()
], actualizarArticulo);

//Eliminar artículo
router.delete('/:id', [validarJWT, permitirRoles(1, 2)], eliminarArticulo);

module.exports = router;