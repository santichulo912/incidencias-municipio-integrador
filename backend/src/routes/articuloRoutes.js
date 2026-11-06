const { Router } = require('express');
const { listar } = require('../controllers/articuloController');
const { validarJWT } = require('../middlewares/validarToken');
const { permitirRoles } = require('../middlewares/validarRoles');

const router = Router();

router.get('/', [validarJWT, permitirRoles(1, 2, 3)], listar);

module.exports = router;