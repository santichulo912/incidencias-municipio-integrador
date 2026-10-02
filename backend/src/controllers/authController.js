const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator'); 
const { Usuario } = require('../models');

const login = async (req, res) => {
    try {
        // 1. Validar los datos de entrada (express-validator)
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            return res.status(400).json({
                ok: false,
                errores: errores.array()
            });
        }

        const { usuario, contrasenia } = req.body;

        // 2. Buscar el usuario en la base de datos usando Sequelize y aplicando Soft Delete
        const user = await Usuario.findOne({
            where: { 
                usuario: usuario, 
                activo: 1 
            }
        });

        // 3. Validar si el usuario existe o está activo
        if (!user) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Credenciales inválidas. El usuario no existe o fue dado de baja.'
            });
        }

        // 4. Comparar la contraseña ingresada con el hash de la base de datos (SHA-256)
        const hashIngresado = crypto.createHash('sha256').update(contrasenia).digest('hex');

        if (hashIngresado !== user.contrasenia) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Credenciales inválidas.'
            });
        }

        // 5. Generar el Token JWT con el payload necesario
        const payload = {
            id_usuario: user.id_usuario,
            rol: user.rol,
            id_area: user.id_area
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '4h'
        });

        // 6. Enviar respuesta consistente y exitosa
        return res.status(200).json({
            ok: true,
            mensaje: 'Inicio de sesión exitoso',
            token: token,
            usuario: {
                id_usuario: user.id_usuario,
                nombres: user.nombres,
                apellidos: user.apellidos,
                rol: user.rol
            }
        });

    } catch (error) {
        console.error('Error en el login:', error);
        return res.status(500).json({
            ok: false,
            mensaje: 'Error interno del servidor al intentar iniciar sesión.'
        });
    }
};

module.exports = {
    login
};

