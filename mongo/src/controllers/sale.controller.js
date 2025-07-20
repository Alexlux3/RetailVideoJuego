const { createRemoteSaleAndLog } = require('../services/sale.service');

const postSaleRemote = async (req, res) => {
  try {
    const saleData = req.body;
    const authHeader = req.headers.authorization || '';
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token requerido' });
    }

    const result = await createRemoteSaleAndLog(saleData, token);
    res.status(200).json({ message: 'Venta registrada y logueada', data: result });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar venta', error: error.message });
  }
};

module.exports = { postSaleRemote };


