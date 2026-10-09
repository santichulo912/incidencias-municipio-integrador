
const verificarDirector = (req, res, next) => {
    
    if (!req.usuario) {
        return res.status(500).json({ ok: false, mensaje: 'Se requiere validar el token primero.' });
    }

    // Ajustá el "1" por el número o nombre exacto que use el rol de Director en la base de datos
    if (req.usuario.rol !== 1) { 
        return res.status(403).json({ 
            ok: false, 
            mensaje: 'Acceso denegado. Esta acción es solo para Directores.' 
        });
    }

    next(); // Si es director, lo deja pasar a la función del controlador
};

module.exports = { verificarDirector };