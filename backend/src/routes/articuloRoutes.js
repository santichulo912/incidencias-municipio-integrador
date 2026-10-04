const { Router } = require('express');
const { listar } = require('../controllers/articuloController');
const { validarJWT } = require('../middlewares/validarToken');

const router = Router();

router.get('/', validarJWT, listar);

module.exports = router;