const pool = require('../config/database');

//BROWSE: Listar todos los artículos
const obtenerArticulos = async (req, res) => {
  try {
    const queryText = `
            SELECT 
                a.id_articulo,
                a.descripcion,
                a.id_categoria,
                a.id_area,
                a.activo,
                c.descripcion AS categoria_descripcion
            FROM articulos a
            LEFT JOIN categorias c ON a.id_categoria = c.id_categoria
            ORDER BY a.id_articulo ASC;
        `;
    const result = await pool.query(queryText);

    return res.status(200).json({
      ok: true,
      data: result.rows
    });
  } catch (error) {
    console.error("Error al obtener artículos:", error.message);
    return res.status(500).json({
      ok: false,
      mensaje: "Error interno al recuperar artículos"
    });
  }
};

//READ: Obtener artículo por ID
const obtenerArticuloPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const queryText = `
            SELECT 
                a.id_articulo,
                a.descripcion,
                a.id_categoria,
                a.id_area,
                a.activo,
                c.descripcion AS categoria_descripcion
            FROM articulos a
            LEFT JOIN categorias c ON a.id_categoria = c.id_categoria
            WHERE a.id_articulo = $1;
        `;
    const result = await pool.query(queryText, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: "Artículo no encontrado"
      });
    }

    return res.status(200).json({
      ok: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error al buscar el artículo:", error.message);
    return res.status(500).json({
      ok: false,
      mensaje: "Error interno al recuperar el artículo"
    });
  }
};

//EDIT: Actualizar artículo
const actualizarArticulo = async (req, res) => {
  const { id } = req.params;
  const { descripcion, id_categoria, id_area, activo } = req.body;

  if (!descripcion || !id_categoria) {
    return res.status(400).json({
      ok: false,
      mensaje: "La descripción y la categoría son requeridas"
    });
  }

  try {
    const areaValor = id_area || 1;
    const activoValor = activo !== undefined ? activo : 1;

    const queryText = `
            UPDATE articulos 
            SET descripcion = $1, id_categoria = $2, id_area = $3, activo = $4
            WHERE id_articulo = $5
            RETURNING *;
        `;
    const result = await pool.query(queryText, [descripcion, id_categoria, areaValor, activoValor, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: "El artículo a actualizar no existe"
      });
    }

    return res.status(200).json({
      ok: true,
      mensaje: "Artículo actualizado correctamente",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error al actualizar artículo:", error.message);
    return res.status(500).json({
      ok: false,
      mensaje: "Error interno al modificar el artículo"
    });
  }
};

//ADD: Crear artículo
const crearArticulo = async (req, res) => {
  const { descripcion, id_categoria, id_area } = req.body;

  if (!descripcion || !id_categoria) {
    return res.status(400).json({
      ok: false,
      mensaje: "La descripción y la categoría son campos obligatorios"
    });
  }

  try {
    const areaValor = id_area || 1;

    const queryText = `
            INSERT INTO articulos (descripcion, id_categoria, id_area, activo) 
            VALUES ($1, $2, $3, 1) 
            RETURNING *;
        `;
    const result = await pool.query(queryText, [descripcion, id_categoria, areaValor]);

    return res.status(201).json({
      ok: true,
      mensaje: "Artículo creado con éxito",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error al crear artículo:", error.message);
    return res.status(500).json({
      ok: false,
      mensaje: `Error al guardar el artículo: ${error.message}`
    });
  }
};

//DELETE: Eliminar artículo por ID
const eliminarArticulo = async (req, res) => {
  const { id } = req.params;

  try {
    const queryText = `
            DELETE FROM articulos 
            WHERE id_articulo = $1 
            RETURNING *;
        `;
    const result = await pool.query(queryText, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: "El artículo que intenta borrar no existe"
      });
    }

    return res.status(200).json({
      ok: true,
      mensaje: "Artículo eliminado con éxito",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error al eliminar artículo:", error.message);

    // Control de restricción por fk(no puede eliminarse si tiene incidencias registradas)
    if (error.code === '23503') {
      return res.status(400).json({
        ok: false,
        mensaje: "No se puede eliminar el artículo porque tiene incidencias registradas en el sistema."
      });
    }

    return res.status(500).json({
      ok: false,
      mensaje: "Error interno al eliminar el artículo"
    });
  }
};

module.exports = {
  obtenerArticulos,
  obtenerArticuloPorId,
  crearArticulo,
  actualizarArticulo,
  eliminarArticulo
};