const express = require('express');
const { connectToMongo } = require('./src/config/mongo');

const saleRoutes = require('./src/routes/sale.routes');
const logRoutes = require('./src/routes/log.routes');
const userRoutes = require('./src/routes/user.routes');
const productoRoutes = require('./src/routes/product.routes'); // Importa las rutas de productos
const reportRoutes = require('./src/routes/report.routes');

const app = express();
const PORT = 3000; // Puerto donde corre Estudiante 2 (puede cambiar)

app.use(express.json());

app.use('/api/ventas', saleRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/users', userRoutes);
app.use('/api/productos', productoRoutes);

app.use('/api/reportes', reportRoutes);

async function startServer() {
  await connectToMongo();
  app.listen(PORT, () => {
    console.log(`🚀 Servidor Estudiante 2 corriendo en http://localhost:${PORT}`);
  });
}

startServer();
