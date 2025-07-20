const fetch = require('node-fetch');
const { LogSistema } = require('../models/LogSistema.model');
const IP_ESTUDIANTE_1 = '100.91.20.100';

const getRemoteCategoriesAndLog = async (token) => {
  const url = `http://${IP_ESTUDIANTE_1}:3000/api/categorias`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  // Log en MongoDB
  await LogSistema.create({
    tipo: 'consulta',
    modulo: 'categorias',
    descripcion: 'Consulta remota de categorías',
    datos: {
      resultado: data,
    },
    fecha: new Date(),
  });

  return data;
};

module.exports = { getRemoteCategoriesAndLog };
