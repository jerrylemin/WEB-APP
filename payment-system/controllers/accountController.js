// controllers/accountController.js

const Account = require('../models/accountModel');

// Tạo tài khoản mới
exports.createAccount = async (req, res) => {
    const { userId } = req.body;
    try {
        const newAccount = new Account({ userId });
        await newAccount.save();
        res.status(201).json({ message: 'Tài khoản được tạo thành công', account: newAccount });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Lấy thông tin tài khoản
exports.getAccount = async (req, res) => {
    try {
        const account = await Account.findOne({ userId: req.params.userId });
        if (!account) return res.status(404).json({ error: 'Tài khoản không tồn tại' });
        res.json(account);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Kiểm tra số dư tài khoản
exports.checkBalance = async (req, res) => {
    try {
        const account = await Account.findOne({ userId: req.params.userId });
        if (!account) return res.status(404).json({ error: 'Tài khoản không tồn tại' });
        res.json({ balance: account.balance });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Lỗi server' });
    }
};