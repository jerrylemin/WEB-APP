const crypto = require('crypto');

// Hàm tiện ích
// Note: key là khóa riêng của người dùng
// Hàm mã hóa AES
const encryptAES = (text, key) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

// Hàm giải mã AES
const decryptAES = (text, key) => {
    const [iv, encryptedText] = text.split(':');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(Buffer.from(encryptedText, 'hex'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};

// Khi cần thực hiện các tác vụ liên quan đến ngân hàng, người
exports.verifyAPIKey = async (req, res, next) => {
    const privateKey = req.body.password;
    const encodedAPIKey = req.body.APIKey;
    // Dùng privateKey(mật khẩu người dùng) để giải mã API key bằng AES
    const decodedAPIKey = decryptAES(encodedAPIKey, privateKey);
    
    // Tìm tài khoản ngân hàng của người dùng
    const bankAccountID = req.body.bankAccountID;
    const bankAccount = await Account.findOne({ bankAccountID});

    // So sánh API key giải mã với API key trong collection Account
    const hashedAPIKey = crypto.createHash('sha256').update(decodedAPIKey).digest('hex');
    if (hashedAPIKey === bankAccount.APIKey) {
        next();
    } else {
        res.status(403).json({ error: 'API Key không hợp lệ' });
    }
}