const pool = require('../config/database');

const createPurchase = async (req, res) => {
    // Datos que un admin enviaría desde el panel de administración
    const { id_proveedor, numero_factura, items } = req.body;
    const id_usuario = req.user.id; // ID del admin que está logueado

    if (!items || items.length === 0) {
        return res.status(400).json({ message: "La lista de ítems no puede estar vacía." });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN'); // Iniciar transacción

        // 1. Calcular totales
        let subtotal = 0;
        items.forEach(item => {
            subtotal += item.cantidad * item.precio_unitario;
        });
        const iva = subtotal * 0.12;
        const total = subtotal + iva;

        // 2. Crear el registro en la tabla 'compras'
        const compraQuery = `
            INSERT INTO compras (id_proveedor, id_usuario, numero_factura, subtotal, iva, total, estado)
            VALUES ($1, $2, $3, $4, $5, $6, 'recibida') RETURNING id_compra;
        `;
        const compraResult = await client.query(compraQuery, [id_proveedor, id_usuario, numero_factura, subtotal, iva, total]);
        const newCompraId = compraResult.rows[0].id_compra;

        // 3. Bucle para insertar detalles y AUMENTAR el stock
        for (const item of items) {
            await client.query(
                `INSERT INTO detalle_compras (id_compra, id_producto, cantidad, precio_unitario, subtotal) VALUES ($1, $2, $3, $4, $5)`,
                [newCompraId, item.id_producto, item.cantidad, item.precio_unitario, item.cantidad * item.precio_unitario]
            );

            const stockAnteriorRes = await client.query('SELECT stock_actual FROM inventario WHERE id_producto = $1', [item.id_producto]);
            const stock_anterior = stockAnteriorRes.rows[0].stock_actual;

            await client.query(
                `UPDATE inventario SET stock_actual = stock_actual + $1 WHERE id_producto = $2`,
                [item.cantidad, item.id_producto]
            );

            await client.query(
                `INSERT INTO movimientos_inventario (id_producto, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, referencia_id, referencia_tipo, id_usuario)
                 VALUES ($1, 'entrada', $2, $3, $4, $5, 'compra', $6)`,
                [item.id_producto, item.cantidad, stock_anterior, stock_anterior + item.cantidad, newCompraId, id_usuario]
            );
        }

        await client.query('COMMIT');
        res.status(201).json({ message: 'Compra registrada y stock actualizado exitosamente', id_compra: newCompraId });

        sendLog({
            nivel: 'info',
            modulo: 'compras',
            accion: 'crear',
            usuario_id: id_usuario,
            mensaje: `Admin (ID: ${id_usuario}) registró una compra al proveedor ID ${id_proveedor} (Factura: ${numero_factura})`,
            datos_nuevos: { id_compra: newCompraId, id_proveedor, total, items }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: "Error al registrar la compra", error: error.message });
    } finally {
        client.release();
    }
};

module.exports = { createPurchase };
