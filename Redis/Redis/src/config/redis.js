// src/config/redis.js

const redis = require('redis');

// 1. Creamos el cliente que se conectará a nuestro servidor Redis.
const redisClient = redis.createClient();

// 2. Creamos un listener para escuchar y mostrar errores de conexión.
redisClient.on('error', (err) => console.error('❌ Error en el Cliente de Redis', err));

// 3. Creamos una función para establecer la conexión.
async function connectToRedis() {
    try {
        await redisClient.connect();
        console.log('✅ Conectado exitosamente a Redis');
    } catch (error) {
        console.error('❌ No se pudo conectar a Redis', error);
    }
}

// 4. Ejecutamos la función de conexión.
connectToRedis();

// 5. Exportamos el cliente para usarlo en otros archivos.
module.exports = redisClient;