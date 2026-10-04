const { Articulo, Area, Categoria } = require('../models');

async function listar(req, res) {
  try {
    const articulos = await Articulo.findAll({
      where: { activo: 1 },
      include: [
        { model: Area, attributes: ['id_area', 'descripcion'] },
        { model: Categoria, as: 'Categoria', attributes: ['id_categoria', 'descripcion'] },
    ],
        
      order: [['descripcion', 'ASC']],
    });

    res.json({ success: true, data: articulos });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al listar artículos' });
  }
}

module.exports = { listar };