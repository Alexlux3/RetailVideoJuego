const express = require('express');
const cors = require('cors');
require('./src/config/redis');

const app = express();
const PORT = 4000; // Usando el puerto 4000 como en tus capturas

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rutas del API Intermediario
const productRoutes = require('./src/routes/product.routes');
const userRoutes = require('./src/routes/user.routes');
const saleRoutes = require('./src/routes/sale.routes');
const adminRoutes = require('./src/routes/admin.routes');
const categoriaRoutes = require('./src/routes/categoria.routes');
const plataformaRoutes = require('./src/routes/plataforma.routes');

app.use('/api/productos', productRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/ventas', saleRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/plataformas', plataformaRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT} y accesible en la red.`);
});