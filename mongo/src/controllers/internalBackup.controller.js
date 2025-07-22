const { exec } = require('child_process');
const path = require('path');

const triggerBackup = (req, res) => {
    // Medida de seguridad simple para asegurar que la llamada viene del otro backend
    const secretHeader = req.headers['x-backup-secret'];
    if (secretHeader !== 'backup123') {
        return res.status(403).json({ message: "Acceso no autorizado." });
    }

    const scriptPath = path.join(__dirname, '..', '..', 'scripts', 'backup_mongo.sh');
    console.log(`[PC 2] Orden de backup recibida. Ejecutando script: ${scriptPath}`);

    exec(`"${scriptPath}"`, (error, stdout, stderr) => {
        if (error || stderr) {
            console.error(`[PC 2] Error en la ejecución del script de backup: ${error || stderr}`);
        }
        console.log(`[PC 2] Salida del script de backup: ${stdout}`);
    });

    res.status(202).json({ message: "Proceso de backup en PC 2 iniciado en segundo plano." });
};

module.exports = { triggerBackup };