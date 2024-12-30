const jwt = require('jsonwebtoken');

const SECRET_KEY = "tm_lm_qd";

function verifyToken(req, res, next) {
    const token = req.headers['access-token'];
    if (!token) {
        return res.status(403).json({ message: 'Không tìm thấy token!' });
    }
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            console.log(err);
            return res.status(401).send({ message: 'Không được phép truy cập!' });
        }
        req.userId = decoded.userID; // Lưu thông tin người dùng vào request
        next();
    });
}

module.exports = verifyToken;