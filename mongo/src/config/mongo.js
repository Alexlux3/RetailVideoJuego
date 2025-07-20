// src/config/mongo.js

const { MongoClient } = require('mongodb');

// URI de conexión local
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

let db;

/**
 * Función para conectar a la base de datos de MongoDB.
 * Se debe llamar una vez al iniciar la aplicación.
 */
async function connectToMongo() {
  try {
    await client.connect();
    // Define el nombre de la base de datos a usar
    db = client.db('videojuegos_logs'); 
    console.log('✅ Conectado exitosamente a MongoDB');
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB', error);
    // Si la conexión falla, se detiene la aplicación.
    process.exit(1);
  }
}

/**
 * Función para obtener la instancia de la base de datos ya conectada.
 * @returns {Db} La instancia de la base de datos de MongoDB.
 */
const getDb = () => {
  if (!db) {
    throw new Error('La base de datos no está inicializada. Llama a connectToMongo primero.');
  }
  return db;
};

module.exports = { connectToMongo, getDb };