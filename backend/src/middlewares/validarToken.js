const jwt = require('jsonwebtoken');

const validarJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      ok: false,
      mensaje: 'No cuenta con token. Acceso denegado.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload;
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