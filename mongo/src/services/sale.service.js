const fetch = require('node-fetch');
const { logAction } = require('./logging.service');

const IP_ESTUDIANTE_1 = '100.91.20.100';
const PUERTO_ESTUDIANTE_1 = '3000';

async function createRemoteSaleAndLog(saleData, token) {
  const usuario_id = saleData.usuario_id || null;

  // Log: Venta recibida
  await logAction({
    nivel: 'info',
    modulo: 'ventas',
    accion: 'recibir_venta',
    usuario_id,
    mensaje: 'Venta recibida en Estudiante 2',
    datos_nuevos: saleData,
  });

  try {
    const response = await fetch(`http://${IP_ESTUDIANTE_1}:${PUERTO_ESTUDIANTE_1}/api/ventas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(saleData),
    });

    const data = await response.json();

    await logAction({
      nivel: response.ok ? 'info' : 'error',
      modulo: 'ventas',
      accion: 'respuesta_estudiante_1',
      usuario_id,
      mensaje: response.ok ? 'Venta registrada en Estudiante 1' : 'Error en Estudiante 1',
      datos_nuevos: data,
    });

    return data;
  } catch (error) {
    await logAction({
      nivel: 'error',
      modulo: 'ventas',
      accion: 'error_comunicacion',
      usuario_id,
      mensaje: 'Error comunicándose con Estudiante 1',
      datos_nuevos: { error: error.message },
    });

    throw error;
  }
}

module.exports = { createRemoteSaleAndLog };
