const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const pool = require('../config/database');
const { ok } = require('assert');

const login = async (req, res) => {
    try {
        //Validar errores de express-validator
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            return res.status(400).json({
                ok: false,
                errores: errores.array()
            });
        }

        const { usuario, contrasenia } = req.body;

        //Buscar el usuario
        const queryText = 'SELECT * FROM usuarios WHERE usuario = $1 AND activo = 1';
        const result = await pool.query(queryText, [usuario]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Credenciales inválidas. El usuario no existe o fue dado de baja.'
            });
        }

        //Hashear contraseña enviada con SHA-256
        const hashIngresado = crypto.createHash('sha256').update(contrasenia).digest('hex');

        if (hashIngresado !== user.contrasenia) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Credenciales inválidas.'
            });
        }

        //Payload del Token JWT
        const payload = {
            id_usuario: user.id_usuario,
            rol: user.rol
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '4h'
        });

        //Respuesta JSON al cliente
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