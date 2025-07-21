// Importa la clase Pool desde la librería pg
const { Pool } = require('pg');


const pool = new Pool({
  user: 'app_user',           // El usuario que creamos en PostgreSQL
  host: 'localhost',          // O la IP del servidor de tu base de datos
  database: 'videojuegos_retail', // El nombre de tu base de datos
  password: 'ajkgr05$', // La contraseña que le pusiste a app_user
  port: 5432,                 // El puerto por defecto de PostgreSQL
});

// Exportamos el pool para poder usarlo en otros archivos
module.exports = pool;