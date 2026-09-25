const jwt = require('jsonwebtoken');

const validarJWT = (req, res, next) => {
    // 1. Leer el token que viene en los headers (por convención usamos x-token o Authorization)
    const token = req.header('x-token');

    // 2. Si no enviaron ningún token, rebotamos la petición
    if (!token) {
        return res.status(401).json({
            ok: false,
            mensaje: 'No hay token en la petición. Acceso denegado.'
        });
    }

    try {
        // 3. Verificar si el token es válido, fue firmado por nosotros y no está vencido
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Guardamos los datos del usuario en la request por si el controlador los necesita
        req.usuario = payload;

        // 5. Dar luz verde para que la petición siga su camino
        next();
    } catch (error) {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token no válido o expirado.'
        });
    }
};

module.exports = {
    validarJWT
};