const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { login } = require('../controllers/authController');

// Define que al hacer un POST a /login, primero valida y luego ejecuta la función
router.post(
  '/login',
  [
    body('usuario').notEmpty().withMessage('El usuario es obligatorio'),
    body('contrasenia').notEmpty().withMessage('La contraseña es obligatoria')
  ],
  login // Llama al controlador de arriba
);

module.exports = router;