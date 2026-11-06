// Permite pasar un arreglo con los IDs de roles permitidos
const permitirRoles = (...rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.usuario) {
            return res.status(500).json({ ok: false, mensaje: 'Se requiere validar el token primero.' });
        }

        // Validamos q el usuario tenga uno de los roles permitidos
        if (!rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({
                ok: false,
                mensaje: 'No tienes los permisos necesarios para realizar esta acción.'
            });
        }

        next();
    };
};

module.exports = { permitirRoles };