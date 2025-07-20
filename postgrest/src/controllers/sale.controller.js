const pool = require('../config/database');

const createSale = async (req, res) => {
    const { items, metodo_pago, id_cliente } = req.body; // Se espera id_cliente desde el frontend
    const id_usuario = req.user.id; // Obtenido del token

    if (!items || items.length === 0) {
        return res.status(400).json({ message: "La lista de ítems no puede estar vacía." });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Calcular totales basado en los precios de la BD
        let subtotal = 0;
        for (const item of items) {
            const productoRes = await client.query(
                `SELECT p.precio_venta, i.stock_actual 
                 FROM productos p 
                 JOIN inventario i ON p.id_producto = i.id_producto 
                 WHERE p.id_producto = $1`, 
                [item.id_producto]
            );
            if (productoRes.rows.length === 0) throw new Error(`Producto con ID ${item.id_producto} no encontrado.`);
            if (productoRes.rows[0].stock_actual < item.cantidad) throw new Error(`Stock insuficiente para el producto ID ${item.id_producto}.`);
            
            subtotal += productoRes.rows[0].precio_venta * item.cantidad;
        }
        const iva = subtotal * 0.12;
        const total = subtotal + iva;

        // Crear el registro en la tabla 'ventas'
        const ventaQuery = `
            INSERT INTO ventas (id_cliente, id_usuario, subtotal, iva, total, metodo_pago)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_venta;
        `;
        const ventaResult = await client.query(ventaQuery, [id_cliente, id_usuario, subtotal, iva, total, metodo_pago]);
        const newVentaId = ventaResult.rows[0].id_venta;

        // Crear registros en 'detalle_ventas' y actualizar 'inventario'
        for (const item of items) {
            const productoRes = await client.query('SELECT precio_venta FROM productos WHERE id_producto = $1', [item.id_producto]);
            const precio_unitario = productoRes.rows[0].precio_venta;

            // --- CORRECCIÓN 1: Se añadieron comillas invertidas ---
            await client.query(
                `INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario, subtotal) VALUES ($1, $2, $3, $4, $5)`,
                [newVentaId, item.id_producto, item.cantidad, precio_unitario, item.cantidad * precio_unitario]
            );

            const stockAnteriorRes = await client.query('SELECT stock_actual FROM inventario WHERE id_producto = $1', [item.id_producto]);
            const stock_anterior = stockAnteriorRes.rows[0].stock_actual;

            // --- CORRECCIÓN 2: Se añadieron comillas invertidas ---
            await client.query(
                `UPDATE inventario SET stock_actual = stock_actual - $1 WHERE id_producto = $2`,
                [item.cantidad, item.id_producto]
            );

            await client.query(
                `INSERT INTO movimientos_inventario (id_producto, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, referencia_id, referencia_tipo, id_usuario)
                 VALUES ($1, 'salida', $2, $3, $4, $5, 'venta', $6)`,
                [item.id_producto, item.cantidad, stock_anterior, stock_anterior - item.cantidad, newVentaId, id_usuario]
            );
        }

        await client.query('COMMIT');
        res.status(201).json({ message: 'Compra realizada exitosamente', id_venta: newVentaId });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error en la transacción de venta:", error); // Es importante que él vea este error en su consola
        res.status(500).json({ message: "Error al procesar la compra", error: error.message });
    } finally {
        client.release();
    }
};

module.exports = { createSale };