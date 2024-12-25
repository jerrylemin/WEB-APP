const jwt = require('jsonwebtoken');

const SECRET_KEY = "tm_lm_qd";

function verifyToken(req, res, next) {
    console.log(req);
    const token = req.headers['access-token'];
    if (!token) {
        return res.status(403).json({ message: 'Không tìm thấy token!' });
    }
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            console.log(err);
            return res.status(401).send({ message: 'Không được phép truy cập!' });
        }
        console.log("Decoded token: ");
        console.log(decoded);
        req.userId = decoded.userID; // Lưu thông tin người dùng vào request
        console.log("User ID được lưu vào req là: " + req.userId);
        next();
    });
}

module.exports = verifyToken;