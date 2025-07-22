const pool = require("../config/database");
const { sendLog } = require("../services/apiLogger.service");

/**

 * Obtiene todos los productos.

 * Acepta filtros opcionales en la URL para buscar, filtrar por género/plataforma y ordenar.

 * Esta es la función que alimenta la vista principal de la tienda.

 */

const getAllProducts = async (req, res) => {
  try {
    const { search, genero, plataforma, sortBy } = req.query; // La consulta base une las tablas para obtener los nombres de la categoría y plataforma.

    let query = `

            SELECT p.*, plat.nombre as plataforma_nombre, cat.nombre as categoria_nombre

            FROM productos p

            LEFT JOIN plataformas plat ON p.id_plataforma = plat.id_plataforma

            LEFT JOIN categorias cat ON p.id_categoria = cat.id_categoria

            WHERE p.activo = true`;

    const params = [];

    let paramIndex = 1; // Añade dinámicamente los filtros a la consulta si se proporcionan

    if (search) {
      query += ` AND p.titulo ILIKE $${paramIndex++}`;

      params.push(`%${search}%`);
    }

    if (plataforma) {
      query += ` AND plat.nombre = $${paramIndex++}`;

      params.push(plataforma);
    }

    if (genero) {
      query += ` AND cat.nombre = $${paramIndex++}`;

      params.push(genero);
    } // Añade el ordenamiento

    if (sortBy === "precio_asc") query += " ORDER BY p.precio_venta ASC";
    else if (sortBy === "precio_desc") query += " ORDER BY p.precio_venta DESC";
    else query += " ORDER BY p.id_producto ASC"; // MODIFICADO: Ordena por ID por defecto

    const result = await pool.query(query, params);

    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los productos",
      error: error.message,
    });
  }
};

/**

 * Obtiene un solo producto por su ID.

 */

const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `

        SELECT p.*, plat.nombre AS plataforma_nombre, cat.nombre AS categoria_nombre

        FROM productos p

        LEFT JOIN plataformas plat ON p.id_plataforma = plat.id_plataforma

        LEFT JOIN categorias cat ON p.id_categoria = cat.id_categoria

        WHERE p.id_producto = $1 AND p.activo = true`;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener el producto", error: error.message });
  }
};

/**

 * Crea un nuevo producto. (Función solo para Admins)

 */

const createProduct = async (req, res) => {
  const {
    titulo,
    descripcion,
    id_categoria,
    id_plataforma,
    precio_compra,
    precio_venta,
  } = req.body;
  const adminUserId = req.user.id; // ID del admin que realiza la acción

  try {
    const result = await pool.query(
      `INSERT INTO productos (titulo, descripcion, id_categoria, id_plataforma, precio_compra, precio_venta) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        titulo,
        descripcion,
        id_categoria,
        id_plataforma,
        precio_compra,
        precio_venta,
      ]
    );
    const newProduct = result.rows[0];

    // --- HOOK DE LOGGING ---
    sendLog({
      nivel: "info",
      modulo: "productos",
      accion: "crear",
      usuario_id: adminUserId,
      mensaje: `Admin (ID: ${adminUserId}) creó el producto: ${newProduct.titulo} (ID: ${newProduct.id_producto})`,
      datos_nuevos: newProduct,
    });

    res
      .status(201)
      .json({ message: "Producto creado exitosamente", producto: newProduct });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al crear el producto", error: error.message });
  }
};

/**

 * Actualiza un producto existente. (Función solo para Admins)

 */

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const adminUserId = req.user.id;

  try {
    const productBeforeResult = await pool.query(
      "SELECT * FROM productos WHERE id_producto = $1",
      [id]
    );
    if (productBeforeResult.rows.length === 0)
      return res.status(404).json({ message: "Producto no encontrado" });

    const result = await pool.query(
      "UPDATE productos SET titulo = $1, descripcion = $2, precio_venta = $3 WHERE id_producto = $4 RETURNING *",
      [updates.titulo, updates.descripcion, updates.precio_venta, id]
    );

    // --- HOOK DE LOGGING ---
    sendLog({
      nivel: "info",
      modulo: "productos",
      accion: "actualizar",
      usuario_id: adminUserId,
      mensaje: `Admin (ID: ${adminUserId}) actualizó el producto ID: ${id}`,
      datos_anteriores: productBeforeResult.rows[0],
      datos_nuevos: updates,
    });

    res.status(200).json({
      message: "Producto actualizado exitosamente",
      producto: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar el producto",
      error: error.message,
    });
  }
};

/**

 * Desactiva un producto (Soft Delete). (Función solo para Admins)

 */

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const adminUserId = req.user.id;
  try {
    const productBeforeResult = await pool.query(
      "SELECT titulo FROM productos WHERE id_producto = $1",
      [id]
    );
    if (productBeforeResult.rows.length === 0)
      return res.status(404).json({ message: "Producto no encontrado" });

    await pool.query(
      "UPDATE productos SET activo = false WHERE id_producto = $1",
      [id]
    );

    // --- HOOK DE LOGGING ---
    sendLog({
      nivel: "warn",
      modulo: "productos",
      accion: "desactivar",
      usuario_id: adminUserId,
      mensaje: `Admin (ID: ${adminUserId}) desactivó el producto: ${productBeforeResult.rows[0].titulo} (ID: ${id})`,
    });

    res
      .status(200)
      .json({ message: `Producto con ID ${id} ha sido desactivado.` });
  } catch (error) {
    res.status(500).json({
      message: "Error al desactivar el producto",
      error: error.message,
    });
  }
};

module.exports = {
  getAllProducts,

  getProductById,

  createProduct,

  updateProduct,

  deleteProduct,
};
