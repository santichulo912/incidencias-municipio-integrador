const { Router } = require('express');
const { check } = require('express-validator');
const { validarJWT } = require('../middlewares/validarToken');
const { permitirRoles } = require('../middlewares/validarRoles');

const router = Router();

const {
    listarIncidencias,
    crearIncidencia,
    cancelarIncidencia,
    cambiarEstado,
    asignarTecnico,
    obtenerTecnicos
} = require('../controllers/incidenciaController');

//Consultar incidencias 
router.get('/', [validarJWT, permitirRoles(1, 2, 3)], listarIncidencias);

//Crear incidencia (Cualquier empleado autenticado)
router.post('/', [
    validarJWT,
    permitirRoles(1, 2, 3),
    check('id_articulo', 'El artículo es obligatorio').not().isEmpty(),
    check('descripcion_pedido', 'La descripción del pedido es obligatoria').not().isEmpty()
], crearIncidencia);

//Cancelar incidencia (Permitido para los 3 roles: el empleado cancela las suyas y el Director/Técnico las del sistema)
router.put('/:id/cancelar', [validarJWT, permitirRoles(1, 2, 3)], cancelarIncidencia);

//Cambiar estado de incidencia
router.put('/:id/estado', [
    validarJWT,
    permitirRoles(1, 2),
    check('id_estado', 'El nuevo estado es obligatorio').isInt()
], cambiarEstado);

// Asignar incidencia a un técnico
router.put('/:id/asignar', [
    validarJWT,
    permitirRoles(1),
    check('id_tecnico', 'El ID del técnico es obligatorio y debe ser un número').isInt()
], asignarTecnico);

router.get('/tecnicos', [validarJWT, permitirRoles(1)], obtenerTecnicos);

module.exports = router;