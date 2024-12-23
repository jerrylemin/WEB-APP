// controllers/accountController.js

const Account = require('../models/accountModel');

const encryptAES = (text, key) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

// Tạo tài khoản mới
exports.createAccount = async (req, res) => {
    try {
        // Tạo số tài khoản ngẫu nhiên (8 chữ số)
        const randomNumber = crypto.randomInt(88888889) + 11111111;

        // Tạo API key ngẫu nhiên (32 ký tự)
        const apiKey = crypto.randomBytes(16).toString('hex');

        // API key được mã hóa bằng sha256 rồi lưu xuống collection Account
        const newAccount = new Account({
            accountID: randomNumber,
            balance: 0,
            APIKey: crypto.createHash('sha256').update(apiKey).digest('hex')
        });
        await newAccount.save();
        // Gửi API key về cho người dùng. Lưu ý: API key này được mã hóa bằng AES với key là password gốc của người dùng
        res.status(201).json({ message: 'Tài khoản được tạo thành công', bankAccountID: newAccount.accountID, APIKey: encryptAES(apiKey, req.body.password) });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Kiểm tra số dư tài khoản
exports.checkBalance = async (req, res) => {
    try {
        const account = await Account.findById(req.body.bankAccountID);
        if (!account) return res.status(404).json({ error: 'Tài khoản không tồn tại' });
        res.json({ balance: account.balance });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Cập nhật số dư tài khoản
exports.updateBalance = async (req, res) => {
    try {
        const account = await Account.findById(req.body.bankAccountID);
        if (!account) return res.status(404).json({ error: 'Tài khoản không tồn tại' });
        const newBalance = req.body.newBalance;
        account.balance = newBalance;
        await account.save();
        res.json({ message: 'Số dư tài khoản đã được cập nhật!', balance: account.balance });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Lỗi server' });
    }
};