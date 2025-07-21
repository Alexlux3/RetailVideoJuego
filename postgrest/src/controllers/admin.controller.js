const cmd = require('node-cmd');
const path = require('path');
const pool = require('../config/database');
const { sendLog } = require('../services/apiLogger.service'); // Importar

const manualBackup = (req, res) => {
    const userId = req.user.id;
    const scriptPath = path.join(__dirname, '..', '..', 'scripts', 'backup.sh');

    // --- HOOK DE LOGGING (Inicio) ---
    sendLog({
        nivel: 'info',
        modulo: 'backup',
        accion: 'inicio_manual',
        usuario_id: userId,
        mensaje: `Admin (ID: ${userId}) ha iniciado un proceso de backup manual.`
    });

    cmd.get(scriptPath, async (err, data, stderr) => {
        const backupPath = data.split(': ')[1] ? data.split(': ')[1].trim() : 'N/A';
        if (err || stderr) {
            const errorMessage = (err ? err.message : '') + (stderr || '');
            console.error('Error en backup manual:', errorMessage);
            await pool.query(`INSERT INTO backups_registro (tipo_backup, base_datos, ruta_archivo, fecha_inicio, estado, mensaje_error, usuario_id) VALUES ('completo', 'ambas', 'N/A', NOW(), 'fallido', $1, $2)`, [errorMessage, userId]);
            
            // --- HOOK DE LOGGING (Fallo) ---
            sendLog({
                nivel: 'error',
                modulo: 'backup',
                accion: 'fallo_manual',
                usuario_id: userId,
                mensaje: `El proceso de backup manual iniciado por el admin (ID: ${userId}) ha fallado.`,
                datos_nuevos: { error: errorMessage }
            });

            return res.status(500).json({ message: 'Falló el backup manual', error: errorMessage });
        }

        await pool.query(`INSERT INTO backups_registro (tipo_backup, base_datos, ruta_archivo, fecha_inicio, fecha_fin, estado, usuario_id) VALUES ('completo', 'ambas', $1, NOW(), NOW(), 'completado', $2)`, [backupPath, userId]);
        
        // --- HOOK DE LOGGING (Éxito) ---
        sendLog({
            nivel: 'info',
            modulo: 'backup',
            accion: 'exito_manual',
            usuario_id: userId,
            mensaje: `El proceso de backup manual iniciado por el admin (ID: ${userId}) ha completado exitosamente.`
        });
        
        res.status(200).json({ message: 'Backup manual completado exitosamente', details: data });
    });
};

module.exports = { manualBackup };