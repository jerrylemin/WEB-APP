// utils/authMiddleware.js

const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: 'Không có token' });

    jwt.verify(token, 'secretKey', (err, decoded) => {
        if (err) return res.status(500).json({ error: 'Xác thực token thất bại' });
        req.userId = decoded.id;
        next();
    });
};

exports.verifyAPIKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey === 'your_api_key_here') {
        next();
    } else {
        res.status(403).json({ error: 'API Key không hợp lệ' });
    }
};
