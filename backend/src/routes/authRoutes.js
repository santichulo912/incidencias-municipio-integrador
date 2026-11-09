const { Router } = require('express');
const router = Router();
const { body } = require('express-validator');
const { login } = require('../controllers/authController');

//Al hacer un POST a /login, valida los datos y luego ejecuta la función
router.post(
  '/login',
  [
    body('usuario').notEmpty().withMessage('El usuario es obligatorio'),
    body('contrasenia').notEmpty().withMessage('La contraseña es obligatoria')
  ],
  login //Llama a la funcion login para consultar BD
);

module.exports = router;