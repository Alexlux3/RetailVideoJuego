const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(403).json({ message: "Se requiere token." });

    jwt.verify(token, 'tu_secreto_super_secreto_para_jwt', (err, decoded) => {
        if (err) return res.status(401).json({ message: "Token inválido." });
        req.user = decoded;
        next();
    });
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.rol === 'admin') {
        next();
    } else {
        res.status(403).json({ message: "Se requiere rol de administrador." });
    }
};

module.exports = { verifyToken, isAdmin };