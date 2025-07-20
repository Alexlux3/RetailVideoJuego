const fetch = require('node-fetch');

const IP_ESTUDIANTE_1 = '100.91.20.100';

const loginUser = async (req, res) => {
    try {
        const response = await fetch(`http://${IP_ESTUDIANTE_1}:3000/api/auth/login`, {
            method: 'POST',
            body: JSON.stringify(req.body),
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        res.status(500).json({ message: "No se pudo conectar al servicio de autenticación." });
    }
};

const registerUser = async (req, res) => {
    try {
        const response = await fetch(`http://${IP_ESTUDIANTE_1}:3000/api/usuarios`, {
            method: 'POST',
            body: JSON.stringify(req.body),
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        res.status(500).json({ message: "No se pudo conectar al servicio de registro." });
    }
};

module.exports = {
    loginUser,
    registerUser
};

