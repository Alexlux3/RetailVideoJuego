// Archivo: src/controllers/product.controller.js

// Importamos el pool de conexiones que creamos anteriormente
const pool = require('../config/database');

// --- OBTENER TODOS LOS PRODUCTOS (VERSIÓN MEJORADA) ---
const getAllProducts = async (req, res) => {
  try {
    // 1. Extraemos los posibles filtros de la URL (req.query)
    const { search, plataforma, genero, sortBy } = req.query;
    
    // 2. Construimos la consulta base
    //    Usamos JOIN para poder filtrar por el nombre de la plataforma y categoría
    let query = `
      SELECT p.*, plat.nombre as plataforma_nombre, cat.nombre as categoria_nombre 
      FROM productos p 
      JOIN plataformas plat ON p.id_plataforma = plat.id_plataforma 
      JOIN categorias cat ON p.id_categoria = cat.id_categoria 
      WHERE p.activo = true`;
    
    const params = [];
    let paramIndex = 1;

    // 3. Añadimos filtros dinámicamente si existen
    if (search) {
      // ILIKE es como LIKE pero no distingue mayúsculas/minúsculas
      query += ` AND p.titulo ILIKE $${paramIndex++}`;
      params.push(`%${search}%`);
    }
    if (plataforma) {
      query += ` AND plat.nombre = $${paramIndex++}`;
      params.push(plataforma);
    }
    if (genero) {
      // Asumimos que el filtro de género se basa en el nombre de la categoría
      query += ` AND cat.nombre = $${paramIndex++}`;
      params.push(genero);
    }

    // 4. Añadimos el ordenamiento dinámicamente
    if (sortBy) {
      if (sortBy === 'precio_asc') query += ' ORDER BY p.precio_venta ASC';
      if (sortBy === 'precio_desc') query += ' ORDER BY p.precio_venta DESC';
      if (sortBy === 'titulo_asc') query += ' ORDER BY p.titulo ASC';
      if (sortBy === 'titulo_desc') query += ' ORDER BY p.titulo DESC';
    } else {
      // Orden por defecto si no se especifica
      query += ' ORDER BY p.id_producto ASC';
    }

    // 5. Ejecutamos la consulta final con los parámetros
    const result = await pool.query(query, params);
    res.status(200).json(result.rows);

  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los productos', error: error.message });
  }
};

// --- OBTENER UN PRODUCTO POR ID (GET) ---
const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM productos WHERE id_producto = $1 AND activo = true', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el producto', error });
  }
};

// --- CREAR UN NUEVO PRODUCTO (POST) ---
const createProduct = async (req, res) => {
  const { titulo, descripcion, id_categoria, id_plataforma, precio_compra, precio_venta } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO productos (titulo, descripcion, id_categoria, id_plataforma, precio_compra, precio_venta) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [titulo, descripcion, id_categoria, id_plataforma, precio_compra, precio_venta]
    );
    res.status(201).json({ message: 'Producto creado exitosamente', producto: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el producto', error });
  }
};

// --- ACTUALIZAR UN PRODUCTO (PUT) ---
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, precio_venta } = req.body;
  try {
    const result = await pool.query(
      'UPDATE productos SET titulo = $1, descripcion = $2, precio_venta = $3 WHERE id_producto = $4 RETURNING *',
      [titulo, descripcion, precio_venta, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado para actualizar' });
    }
    res.status(200).json({ message: 'Producto actualizado exitosamente', producto: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el producto', error });
  }
};

// --- DESACTIVAR UN PRODUCTO (DELETE - Soft Delete) ---
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE productos SET activo = false WHERE id_producto = $1 RETURNING id_producto',
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Producto no encontrado para eliminar' });
    }
    res.status(200).json({ message: `Producto con ID ${id} ha sido desactivado.` });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el producto', error });
  }
};


// Exportamos todas las funciones para usarlas en las rutas
module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};