const pool = require('../config/database');

async function listar(req, res) {
  try {
    const query = `
      SELECT 
        a.id_articulo,
        a.descripcion,
        a.activo,
        ar.id_area,
        ar.descripcion AS area_descripcion,
        c.id_categoria,
        c.descripcion AS categoria_descripcion
      FROM articulos a
      LEFT JOIN areas ar ON a.id_area = ar.id_area
      LEFT JOIN categorias c ON a.id_categoria = c.id_categoria
      WHERE a.activo = 1
      ORDER BY a.descripcion ASC;
    `;

    const result = await pool.query(query);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error al listar artículos:', error);
    res.status(500).json({ success: false, message: 'Error al listar artículos' });
  }
}

module.exports = { listar };