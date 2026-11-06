const { Router } = require('express');
const { listar, crear, cancelar } = require('../controllers/incidenciaController');
const { validarJWT } = require('../middlewares/validarToken');
const { permitirRoles } = require('../middlewares/validarRoles');

const router = Router();

// Los 3 roles pueden ver y crear sus incidencias
router.get('/', [validarJWT, permitirRoles(1, 2, 3)], listar);
router.post('/', [validarJWT, permitirRoles(1, 2, 3)], crear);

// Solo Director (1) y Técnico (2) pueden cancelar/modificar estado
router.put('/:id/cancelar', [validarJWT, permitirRoles(1, 2)], cancelar);

module.exports = router;