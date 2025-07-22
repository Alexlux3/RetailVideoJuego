const { exec } = require('child_process');
const path = require('path');

const triggerBackup = (req, res) => {
    // Medida de seguridad simple para asegurar que la llamada viene de un cliente autorizado.
    // Para producción, considera usar un token más seguro (ej. JWT o uno generado aleatoriamente).
    const secretHeader = req.headers['x-backup-secret'];
    if (secretHeader !== 'backup123') {
        return res.status(403).json({ message: 'Acceso no autorizado.' });
    }

    // Construye la ruta al script de forma segura.
    const scriptPath = path.join(__dirname, '..', '..', 'scripts', 'backup_mongo.sh');

    // Es una buena práctica ejecutar scripts .sh explícitamente con 'bash'
    // y encerrar la ruta entre comillas para manejar espacios en nombres de archivo.
    const command = `bash "${scriptPath}"`;

    console.log(`[PC 2] Orden de backup recibida. Ejecutando comando: ${command}`);

    exec(command, (error, stdout, stderr) => {
        // El 'error' se produce si el script termina con un código de salida distinto de 0.
        if (error) {
            console.error(`[PC 2] Error al ejecutar el script de backup: ${error.message}`);
            // stderr también puede contener información útil sobre el error.
            if (stderr) {
                console.error(`[PC 2] Stderr: ${stderr}`);
            }
            return; // Termina la función aquí para no imprimir el 'stdout' en caso de error.
        }

        // A veces los scripts imprimen información de progreso en stderr, incluso si tienen éxito.
        if (stderr) {
            console.warn(`[PC 2] Salida en Stderr (puede ser un warning o info): ${stderr}`);
        }

        console.log(`[PC 2] Salida del script (Stdout): ${stdout}`);
    });

    // Responde inmediatamente al cliente para no dejarlo esperando.
    // El código 202 (Accepted) indica que la solicitud fue aceptada pero se procesará en segundo plano.
    res.status(202).json({ message: 'Proceso de backup iniciado en segundo plano.' });
};

module.exports = { triggerBackup };