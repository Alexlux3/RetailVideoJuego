const express = require('express');
const { connectToMongo } = require('./src/config/mongo');
const app = express();
const PORT = 3000;

app.use(express.json());

// Rutas...
const logRoutes = require('./src/routes/log.routes');
app.use('/api/logs', logRoutes);

async function startServer() {
  await connectToMongo();
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
}

startServer();
