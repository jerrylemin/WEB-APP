const jwt = require('jsonwebtoken');

const SECRET_KEY = "tm_qd_lm";

function verifyToken(req, res, next) {
    const token = req.headers['AccessToken'];
    if (!token) {
        return res.status(403).send({ message: 'Không tìm thấy token!' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'Không được phép truy cập!' });
        }
        req.userId = decoded.username; // Lưu thông tin người dùng vào request
        next();
    });
}

module.exports = verifyToken;