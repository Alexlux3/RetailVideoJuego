// 1. IMPORTACIONES
const express = require('express');
require('./src/config/redis');

// Importar todas las rutas
const productRoutes = require('./src/routes/product.routes');
const saleRoutes = require('./src/routes/sale.routes');
const reportRoutes = require('./src/routes/report.routes');
const userRoutes = require('./src/routes/user.routes');

// 2. CREACIÓN DE LA APP
const app = express();
const PORT = 4000;

// 3. MIDDLEWARES (Configuraciones)
app.use(express.json()); // Para entender JSON
app.use(express.static('public')); // Para servir la página web

// 4. RUTAS (Aquí le decimos a la app que use las rutas importadas)
app.use('/api/productos', productRoutes);
app.use('/api/ventas', saleRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/usuarios', userRoutes); // <-- La nueva línea va aquí

// 5. INICIAR SERVIDOR
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});