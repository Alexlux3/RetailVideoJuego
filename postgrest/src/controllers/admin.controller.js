// Se importa la función 'exec' del módulo nativo 'child_process'
const { exec } = require('child_process');
const path = require('path');
const pool = require('../config/database');
const { sendLog } = require('../services/apiLogger.service');

const manualBackup = (req, res) => {
    const userId = req.user.id;
    const scriptPath = path.join(__dirname, '..', '..', 'scripts', 'backup.sh');

    console.log(`Iniciando backup manual solicitado por el usuario ID: ${userId}`);
    console.log(`Ruta del script: ${scriptPath}`);

    // --- HOOK DE LOGGING (Inicio) ---
    sendLog({
        nivel: 'info',
        modulo: 'backup',
        accion: 'inicio_manual',
        usuario_id: userId,
        mensaje: `Admin (ID: ${userId}) ha iniciado un proceso de backup manual.`
    });

    // Se reemplaza cmd.get por exec
    exec(`"${scriptPath}"`, async (error, stdout, stderr) => {
        // stdout es la salida exitosa del script (lo que antes era 'data')
        const backupPathMatch = stdout.match(/✅ Backup de PostgreSQL completado: (.*)/);
        const backupPath = backupPathMatch ? backupPathMatch[1].trim() : 'N/A';

        if (error || stderr) {
            const errorMessage = (error ? error.message : '') + (stderr || '');
            console.error('Error en backup manual:', errorMessage);

            await pool.query(`INSERT INTO backups_registro (tipo_backup, base_datos, ruta_archivo, fecha_inicio, estado, mensaje_error, usuario_id) VALUES ('completo', 'ambas', 'N/A', NOW(), 'fallido', $1, $2)`, [errorMessage, userId]);
            
            sendLog({
                nivel: 'error',
                modulo: 'backup',
                accion: 'fallo_manual',
                usuario_id: userId,
                mensaje: `El proceso de backup manual iniciado por el admin (ID: ${userId}) ha fallado.`,
                datos_nuevos: { error: errorMessage }
            });

            // Se envía la respuesta de error aquí, dentro del callback
            return res.status(500).json({ message: 'Falló el backup manual', error: errorMessage });
        }

        await pool.query(`INSERT INTO backups_registro (tipo_backup, base_datos, ruta_archivo, fecha_inicio, fecha_fin, estado, usuario_id) VALUES ('completo', 'ambas', $1, NOW(), NOW(), 'completado', $2)`, [backupPath, userId]);
        
        sendLog({
            nivel: 'info',
            modulo: 'backup',
            accion: 'exito_manual',
            usuario_id: userId,
            mensaje: `El proceso de backup manual iniciado por el admin (ID: ${userId}) ha completado exitosamente.`
        });
        
        console.log(stdout); // Muestra la salida del script
        // Se envía la respuesta de éxito aquí, dentro del callback
        res.status(200).json({ message: 'Backup manual completado exitosamente', details: stdout });
    });
};

module.exports = { manualBackup };