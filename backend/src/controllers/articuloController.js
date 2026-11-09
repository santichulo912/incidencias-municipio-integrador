const pool = require('../config/database');

//BROWSE: Listar articulos
async function listarArticulos(req, res) {
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

    res.json({ ok: true, data: result.rows });
  } catch (error) {
    console.error('Error al listar artículos:', error);
    res.status(500).json({ ok: false, message: 'Error al listar artículos' });
  }
}

//READ: Obtener articulo por ID
async function obtenerArticuloPorId(req, res) {
  const { id } = req.params;
  try {
    const query = `
      SELECT 
        a.id_articulo,
        a.descripcion,
        a.activo,
        a.id_area,
        ar.descripcion AS area_descripcion,
        a.id_categoria,
        c.descripcion AS categoria_descripcion
      FROM articulos a
      LEFT JOIN areas ar ON a.id_area = ar.id_area
      LEFT JOIN categorias c ON a.id_categoria = c.id_categoria
      WHERE a.id_articulo = $1 AND a.activo = 1;
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Artículo no encontrado' });
    }

    res.json({ ok: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error al obtener artículo:', error);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener el artículo' });
  }
}

//EDIT: Modificar articulo
async function actualizarArticulo(req, res) {
  const { id } = req.params;
  const { descripcion, id_area, id_categoria } = req.body;

  try {
    const query = `
      UPDATE articulos 
      SET descripcion = $1, id_area = $2, id_categoria = $3
      WHERE id_articulo = $4 AND activo = 1
      RETURNING *;
    `;

    const result = await pool.query(query, [descripcion, id_area, id_categoria, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Artículo no encontrado para actualizar' });
    }

    res.json({
      ok: true,
      mensaje: 'Artículo actualizado exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar artículo:', error);
    res.status(500).json({ ok: false, mensaje: 'Error al actualizar el artículo' });
  }
}

//ADD: Crear nuevo articulo
async function crearArticulo(req, res) {
  const { descripcion, id_area, id_categoria } = req.body;

  try {
    const query = `
      INSERT INTO articulos (descripcion, id_area, id_categoria, activo)
      VALUES ($1, $2, $3, 1)
      RETURNING *;
    `;

    const result = await pool.query(query, [descripcion, id_area, id_categoria]);

    res.status(201).json({
      ok: true,
      mensaje: 'Artículo creado exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al crear artículo:', error);
    res.status(500).json({ ok: false, mensaje: 'Error al crear el artículo' });
  }
}

//DELETE: Soft Delete (marcar activo = 0)
async function eliminarArticulo(req, res) {
  const { id } = req.params;

  try {
    const query = `
      UPDATE articulos 
      SET activo = 0 
      WHERE id_articulo = $1 AND activo = 1
      RETURNING *;
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Artículo no encontrado' });
    }

    res.json({
      ok: true,
      mensaje: 'Artículo eliminado con éxito'
    });
  } catch (error) {
    console.error('Error al eliminar artículo:', error);
    res.status(500).json({ ok: false, mensaje: 'Error al eliminar el artículo' });
  }
}

module.exports = {
  listarArticulos,
  obtenerArticuloPorId,
  actualizarArticulo,
  crearArticulo,
  eliminarArticulo,
};