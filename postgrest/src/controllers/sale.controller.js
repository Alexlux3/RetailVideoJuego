const pool = require('../config/database');

const createSale = async (req, res) => {
  // El cuerpo de la petición debe tener: { id_cliente, id_usuario, metodo_pago, items: [{id_producto, cantidad, precio_unitario}, ...] }
  const { id_cliente, id_usuario, metodo_pago, items } = req.body;

  // Obtenemos un "cliente" del pool. Es VITAL para manejar la transacción.
  const client = await pool.connect();

  try {
    // a. Iniciar una transacción
    await client.query('BEGIN');

    // b. INSERT en la tabla ventas
    // Primero calculamos los totales a partir de los items
    let subtotal = 0;
    items.forEach(item => {
      subtotal += item.cantidad * item.precio_unitario;
    });
    const iva = subtotal * 0.12; // Asumimos un 12% de IVA
    const total = subtotal + iva;

    const ventaQuery = `
      INSERT INTO ventas (id_cliente, id_usuario, metodo_pago, subtotal, iva, total)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id_venta;
    `;
    const ventaResult = await client.query(ventaQuery, [id_cliente, id_usuario, metodo_pago, subtotal, iva, total]);
    const newVentaId = ventaResult.rows[0].id_venta;

    // Usamos Promise.all para ejecutar todas las inserciones de items en paralelo
    await Promise.all(items.map(async (item) => {
      // c. INSERT en detalle_ventas
      const detalleVentaQuery = `
        INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario, subtotal)
        VALUES ($1, $2, $3, $4, $5);
      `;
      await client.query(detalleVentaQuery, [newVentaId, item.id_producto, item.cantidad, item.precio_unitario, item.cantidad * item.precio_unitario]);

      // d. UPDATE en inventario para reducir el stock
      const inventarioQuery = `
        UPDATE inventario SET stock_actual = stock_actual - $1 WHERE id_producto = $2;
      `;
      await client.query(inventarioQuery, [item.cantidad, item.id_producto]);
      
      // e. INSERT en movimientos_inventario (para auditoría)
      const movimientoQuery = `
        INSERT INTO movimientos_inventario (id_producto, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, referencia_id, referencia_tipo, id_usuario)
        SELECT $1, 'salida', $2, stock_actual + $2, stock_actual, $3, 'venta', $4
        FROM inventario WHERE id_producto = $1;
      `;
      // Nota: Hacemos el SELECT del stock ya actualizado para calcular el anterior.
      await client.query(movimientoQuery, [item.id_producto, item.cantidad, newVentaId, id_usuario]);
    }));

    // f. Si todo sale bien, confirmar la transacción
    await client.query('COMMIT');
    res.status(201).json({ message: 'Venta creada exitosamente', id_venta: newVentaId });

  } catch (error) {
    // g. Si ocurre algún error, revertir todos los cambios
    await client.query('ROLLBACK');
    console.error('Error en la transacción de venta:', error);
    res.status(500).json({ message: 'Error al procesar la venta', error: error.message });
  } finally {
    // ¡MUY IMPORTANTE! Liberar el cliente para devolverlo al pool.
    client.release();
  }
};

module.exports = { createSale };