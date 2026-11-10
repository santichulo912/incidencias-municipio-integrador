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
    obtenerTecnicos,
    obtenerDashboard,
    obtenerReportes
} = require('../controllers/incidenciaController');

//Consultar incidencias 
router.get('/', [validarJWT, permitirRoles(1, 2, 3)], listarIncidencias);

//Crear incidencia
router.post('/', [
    validarJWT,
    permitirRoles(1, 2, 3),
    check('id_articulo', 'El artículo es obligatorio').not().isEmpty(),
    check('descripcion_pedido', 'La descripción del pedido es obligatoria').not().isEmpty()
], crearIncidencia);

//Cancelar incidencia
router.put('/:id/cancelar', [validarJWT, permitirRoles(1, 2, 3)], cancelarIncidencia);

//Cambiar estado
router.put('/:id/estado', [
    validarJWT,
    permitirRoles(1, 2),
    check('id_estado', 'El nuevo estado es obligatorio').isInt()
], cambiarEstado);

// Asignar incidencia a técnico
router.put('/:id/asignar', [
    validarJWT,
    permitirRoles(1),
    check('id_tecnico', 'El ID del técnico es obligatorio y debe ser un número').isInt()
], asignarTecnico);


router.get('/tecnicos', [validarJWT, permitirRoles(1)], obtenerTecnicos);
router.get('/dashboard', [validarJWT, permitirRoles(1)], obtenerDashboard);
router.get('/reportes', [validarJWT, permitirRoles(1)], obtenerReportes);

module.exports = router;