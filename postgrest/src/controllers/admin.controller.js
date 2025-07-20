const cmd = require('node-cmd');
const path = require('path');
const pool = require('../config/database');

const manualBackup = (req, res) => {
  // req.user.id debería venir de un middleware de autenticación
  const userId = req.user ? req.user.id : 1; // Usamos 1 como fallback para pruebas
  const scriptPath = path.join(__dirname, '..', '..', 'scripts', 'backup.sh');

  console.log(`Iniciando backup manual solicitado por el usuario ID: ${userId}`);
  console.log(`Ruta del script: ${scriptPath}`);

  cmd.get(scriptPath, async (err, data, stderr) => {
    const backupPath = data.split(': ')[1] ? data.split(': ')[1].trim() : 'N/A';

    if (err || stderr) {
      const errorMessage = (err ? err.message : '') + (stderr || '');
      console.error('Error en backup manual:', errorMessage);

      // Registrar el backup fallido en la BD
      await pool.query(
        `INSERT INTO backups_registro (tipo_backup, base_datos, ruta_archivo, fecha_inicio, estado, mensaje_error, usuario_id)
         VALUES ('completo', 'ambas', 'N/A', NOW(), 'fallido', $1, $2)`,
        [errorMessage, userId]
      );
      return res.status(500).json({ message: 'Falló el backup manual', error: errorMessage });
    }

    // Registrar el backup exitoso en la BD
    await pool.query(
      `INSERT INTO backups_registro (tipo_backup, base_datos, ruta_archivo, fecha_inicio, fecha_fin, estado, usuario_id)
       VALUES ('completo', 'ambas', $1, NOW(), NOW(), 'completado', $2)`,
      [backupPath, userId]
    );
    console.log(data); // Muestra la salida del script (ej. "✅ Backup completado...")
    res.status(200).json({ message: 'Backup manual completado exitosamente', details: data });
  });
};

module.exports = { manualBackup };