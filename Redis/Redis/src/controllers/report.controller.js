// src/controllers/report.controller.js

const pool = require('../config/database');
const redisClient = require('../config/redis');

const getVentasPorCategoria = async (req, res) => {
    try {
        const { fecha_inicio, fecha_fin } = req.query;
        const cacheKey = `report:ventas_por_categoria:${fecha_inicio}:${fecha_fin}`;

        // Intenta obtener el reporte desde Redis.
        const cachedResult = await redisClient.get(cacheKey);

        // Si el reporte está en caché, devuélvelo inmediatamente.
        if (cachedResult) {
            console.log(`✅ CACHE HIT! Sirviendo desde Redis.`);
            return res.status(200).json({
                source: 'cache',
                data: JSON.parse(cachedResult)
            });
        }

        // Si no está en caché, consúltalo en la base de datos.
        console.log(`❌ CACHE MISS. Consultando la base de datos.`);
        const query = `
            SELECT c.nombre AS categoria, SUM(dv.subtotal) AS total_ventas
            FROM detalle_ventas dv
            JOIN productos p ON dv.id_producto = p.id_producto
            JOIN categorias c ON p.id_categoria = c.id_categoria
            JOIN ventas v ON dv.id_venta = v.id_venta
            WHERE v.fecha_venta BETWEEN $1 AND $2
            GROUP BY c.nombre ORDER BY total_ventas DESC;
        `;
        const dbResult = await pool.query(query, [fecha_inicio, fecha_fin]);

        // Guarda el nuevo resultado en Redis por 1 hora (3600 seg).
        await redisClient.set(cacheKey, JSON.stringify(dbResult.rows), { EX: 3600 });

        res.status(200).json({
            source: 'database',
            data: dbResult.rows
        });

    } catch (error) {
        res.status(500).json({ message: 'Error al generar el reporte' });
    }
};

module.exports = { getVentasPorCategoria };