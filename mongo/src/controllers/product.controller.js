const pool = require('../config/database');
// IMPORTANTE: Se importa el servicio de logging
const { logAction } = require('../services/logging.service');

// --- ACTUALIZAR UN PRODUCTO (PUT) ---
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    // Se obtiene el estado del producto ANTES de actualizarlo para el log
    const productBeforeResult = await pool.query('SELECT * FROM productos WHERE id_producto = $1', [id]);
    if (productBeforeResult.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    const productBefore = productBeforeResult.rows[0];

    // Lógica para construir la consulta UPDATE (del Estudiante 1)
    const result = await pool.query(
      'UPDATE productos SET titulo = $1, descripcion = $2, precio_venta = $3 WHERE id_producto = $4 RETURNING *',
      [updates.titulo, updates.descripcion, updates.precio_venta, id]
    );
    const productAfter = result.rows[0];

    // **HOOK**: Se llama al servicio de logging después de una actualización exitosa
    await logAction({
      nivel: 'info',
      modulo: 'productos',
      accion: 'actualizar',
      usuario_id: 1, // En un sistema real, esto vendría de req.user.id
      mensaje: `Se actualizó el producto con ID ${id}`,
      datos_anteriores: productBefore,
      datos_nuevos: updates // o productAfter para ver el resultado final
    });
    
    res.status(200).json({ message: 'Producto actualizado exitosamente', producto: productAfter });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el producto', error });
  }
};
const getAllProducts = async (req, res) => { /* ... */ };

// --- OBTENER UN PRODUCTO POR ID (GET) ---
// (Esta función no necesita cambios)
const getProductById = async (req, res) => { /* ... */ };

// --- CREAR UN NUEVO PRODUCTO (POST) ---
// (Se puede añadir un log aquí también si se desea)
const createProduct = async (req, res) => { /* ... */ };


// --- DESACTIVAR UN PRODUCTO (DELETE - Soft Delete) ---
// (Se puede añadir un log aquí también)
const deleteProduct = async (req, res) => { /* ... */ };


module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};