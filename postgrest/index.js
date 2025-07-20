const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000; // Puedes usar el puerto que prefieras

// --- Middlewares ---
// Permite que la aplicación entienda el JSON en el cuerpo de las peticiones
app.use(cors());
app.use(express.json());

// --- Rutas ---
// Se cargan únicamente las rutas correspondientes al Estudiante 1
const productRoutes = require('./src/routes/product.routes');
const saleRoutes = require('./src/routes/sale.routes');
const adminRoutes = require('./src/routes/admin.routes');
const categoriaRoutes = require('./src/routes/categoria.routes');
const plataformaRoutes = require('./src/routes/plataforma.routes');
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');

// Se asocian las rutas con sus prefijos de API
app.use('/api/productos', productRoutes);
app.use('/api/ventas', saleRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/plataformas', plataformaRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);

// --- Iniciar el servidor ---
// Se modifica para escuchar en '0.0.0.0', permitiendo conexiones externas
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT} y accesible en la red.`);
});
