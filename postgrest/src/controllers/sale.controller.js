const pool = require('../config/database');

const createSale = async (req, res) => {
    // El frontend envía los items y el método de pago.
    const { items, metodo_pago } = req.body;
    // El id_usuario se obtiene del token verificado por el middleware.
    const id_usuario_logueado = req.user.id; 

    if (!items || !items.length === 0) {
        return res.status(400).json({ message: "La lista de ítems no puede estar vacía." });
    }

    const client = await pool.connect();

    try {
        // Iniciar una transacción
        await client.query('BEGIN');

        // --- CORRECCIÓN CLAVE: Buscar el id_cliente correspondiente al usuario logueado ---
        const clienteRes = await client.query('SELECT id_cliente FROM clientes WHERE id_usuario = $1', [id_usuario_logueado]);
        if (clienteRes.rows.length === 0) {
            throw new Error("No se encontró un perfil de cliente para este usuario. Asegúrate de que el usuario tenga un cliente asociado.");
        }
        const id_cliente = clienteRes.rows[0].id_cliente;

        // --- El resto de la lógica de la transacción ---
        let subtotal = 0;
        for (const item of items) {
            const productoRes = await client.query(
                `SELECT p.precio_venta, i.stock_actual 
                 FROM productos p 
                 JOIN inventario i ON p.id_producto = i.id_producto 
                 WHERE p.id_producto = $1 FOR UPDATE`, // FOR UPDATE bloquea la fila para evitar concurrencia
                [item.id_producto]
            );
            if (productoRes.rows.length === 0) throw new Error(`Producto no encontrado.`);
            if (productoRes.rows[0].stock_actual < item.cantidad) throw new Error(`Stock insuficiente.`);
            
            subtotal += productoRes.rows[0].precio_venta * item.cantidad;
        }
        const iva = subtotal * 0.12; // Asumimos 12% de IVA
        const total = subtotal + iva;

        // Crear el registro en la tabla 'ventas'
        const ventaQuery = `
            INSERT INTO ventas (id_cliente, id_usuario, subtotal, iva, total, metodo_pago)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_venta;
        `;
        const ventaResult = await client.query(ventaQuery, [id_cliente, id_usuario_logueado, subtotal, iva, total, metodo_pago]);
        const newVentaId = ventaResult.rows[0].id_venta;

        // Crear registros en 'detalle_ventas' y actualizar 'inventario'
        for (const item of items) {
            const productoRes = await client.query('SELECT precio_venta FROM productos WHERE id_producto = $1', [item.id_producto]);
            const precio_unitario = productoRes.rows[0].precio_venta;

            await client.query(
                `INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario, subtotal) VALUES ($1, $2, $3, $4, $5)`,
                [newVentaId, item.id_producto, item.cantidad, precio_unitario, item.cantidad * precio_unitario]
            );

            await client.query(
                `UPDATE inventario SET stock_actual = stock_actual - $1 WHERE id_producto = $2`,
                [item.cantidad, item.id_producto]
            );
        }

        // Si todo fue bien, confirmar la transacción
        await client.query('COMMIT');
        res.status(201).json({ message: 'Compra realizada exitosamente', id_venta: newVentaId });

        sendLog({
            nivel: 'info',
            modulo: 'ventas',
            accion: 'crear',
            usuario_id: id_usuario,
            mensaje: `Se realizó una nueva venta (ID: ${newVentaId}) por un total de $${total.toFixed(2)}`,
            datos_nuevos: { id_venta: newVentaId, total: total, items: items }
        });

    } catch (error) {
        // Si algo falla, revertir todo
        await client.query('ROLLBACK');
        console.error("Error en la transacción de venta:", error); // Es importante que él vea este error en su consola
        res.status(500).json({ message: "Error al procesar la compra", error: error.message });
    } finally {
        // Liberar la conexión
        client.release();
    }
};

module.exports = { createSale };