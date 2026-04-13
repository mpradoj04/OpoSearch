const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

const isAuthenticated = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        logger.warn('Unauthorized access attempt: No token provided', {
            context: 'AuthMiddleware',
            ip: req.ip,
            method: req.method,
        });
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Falta implementar el Json WebToken
        req.user = decoded;
        next();
    } catch (error) {
        logger.error('Invalid token', {
            context: 'AuthMiddleware',
            ip: req.ip,
            method: req.method,
            error: error.message
        });
        return res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = { isAuthenticated };