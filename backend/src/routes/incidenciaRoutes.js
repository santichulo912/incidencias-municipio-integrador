const { Router } = require('express');
const { listar, crear, cancelar } = require('../controllers/incidenciaController');
const { validarJWT } = require('../middlewares/validarToken');

const router = Router();

// Obtener todas las incidencias del usuario logueado
router.get('/', validarJWT, listar);

// Crear una nueva incidencia
router.post('/', validarJWT, crear);

// Cancelar una incidencia (cambiar estado)
router.put('/:id/cancelar', validarJWT, cancelar);

module.exports = router;