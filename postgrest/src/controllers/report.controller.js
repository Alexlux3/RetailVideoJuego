const pool = require('../config/database');
const redisClient = require('../config/redis'); // Importamos el cliente de Redis

const CACHE_EXPIRATION_SECONDS = 3600; // 1 hora

/**
 * Reporte de Ventas por Rango de Fechas (con caché).
 */
const getVentasPorFecha = async (req, res) => {
    const { fecha_inicio, fecha_fin } = req.query;
    if (!fecha_inicio || !fecha_fin) {
        return res.status(400).json({ message: "Se requieren fecha_inicio y fecha_fin." });
    }

    const cacheKey = `report:ventas:${fecha_inicio}:${fecha_fin}`;

    try {
        // 1. Intentar obtener el resultado desde Redis
        const cachedResult = await redisClient.get(cacheKey);
        if (cachedResult) {
            console.log('CACHE HIT para:', cacheKey);
            return res.status(200).json(JSON.parse(cachedResult));
        }

        console.log('CACHE MISS para:', cacheKey);
        // 2. Si no está en caché, obtenerlo de PostgreSQL
        const query = `
            SELECT v.id_venta, v.fecha_venta, c.nombre || ' ' || c.apellido as cliente, u.nombre_completo as vendedor, v.total
            FROM ventas v
            JOIN clientes c ON v.id_cliente = c.id_cliente
            JOIN usuarios u ON v.id_usuario = u.id_usuario
            WHERE v.fecha_venta::date BETWEEN $1 AND $2
            ORDER BY v.fecha_venta DESC;
        `;
        const result = await pool.query(query, [fecha_inicio, fecha_fin]);
        
        // 3. Guardar el resultado en Redis antes de enviarlo
        await redisClient.set(cacheKey, JSON.stringify(result.rows), {
            EX: CACHE_EXPIRATION_SECONDS
        });

        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Error al generar el reporte de ventas", error: error.message });
    }
};

/**
 * Reporte de Productos con Stock Bajo (con caché).
 */
const getStockBajo = async (req, res) => {
    const cacheKey = 'report:stock_bajo';
    try {
        const cachedResult = await redisClient.get(cacheKey);
        if (cachedResult) {
            console.log('CACHE HIT para:', cacheKey);
            return res.status(200).json(JSON.parse(cachedResult));
        }

        console.log('CACHE MISS para:', cacheKey);
        const query = `
            SELECT p.id_producto, p.titulo, i.stock_actual, i.stock_minimo
            FROM productos p
            JOIN inventario i ON p.id_producto = i.id_producto
            WHERE i.stock_actual <= i.stock_minimo AND p.activo = true
            ORDER BY i.stock_actual ASC;
        `;
        const result = await pool.query(query);
        
        await redisClient.set(cacheKey, JSON.stringify(result.rows), { EX: CACHE_EXPIRATION_SECONDS });
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Error al generar el reporte de stock bajo", error: error.message });
    }
};

/**
 * Reporte de los 10 Productos Más Vendidos (con caché).
 */
const getMasVendidos = async (req, res) => {
    const cacheKey = 'report:mas_vendidos';
    try {
        const cachedResult = await redisClient.get(cacheKey);
        if (cachedResult) {
            console.log('CACHE HIT para:', cacheKey);
            return res.status(200).json(JSON.parse(cachedResult));
        }

        console.log('CACHE MISS para:', cacheKey);
        const query = `
            SELECT p.titulo, SUM(dv.cantidad) as total_vendido
            FROM detalle_ventas dv
            JOIN productos p ON dv.id_producto = p.id_producto
            GROUP BY p.titulo
            ORDER BY total_vendido DESC
            LIMIT 10;
        `;
        const result = await pool.query(query);

        await redisClient.set(cacheKey, JSON.stringify(result.rows), { EX: CACHE_EXPIRATION_SECONDS });
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Error al generar el reporte de más vendidos", error: error.message });
    }
};

module.exports = {
    getVentasPorFecha,
    getStockBajo,
    getMasVendidos
};