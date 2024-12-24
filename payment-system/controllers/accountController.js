// controllers/accountController.js

const Account = require('../models/accountModel');


// Tạo tài khoản mới
exports.createAccount = async (req, res) => {
    try {
        console.log("Đang tạo tài khoản...");

        // Tạo số tài khoản ngẫu nhiên (8 chữ số)
        const randomNumber = crypto.randomInt(88888889) + 11111111;

        const newAccount = new Account({
            userID: req.userId,
            accountID: randomNumber,
            balance: 0
        });
        await newAccount.save();
        res.status(201).json(
            { 
                message: 'Tài khoản được tạo thành công', 
                bankAccountID: newAccount.accountID
            });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Kiểm tra số dư tài khoản
exports.checkBalance = async (req, res) => {
    try {
        const account = await Account.findById(req.body.bankAccountID); // Tìm tài khoản
        // Nếu req.userId không khớp với userID của tài khoản, trả về lỗi
        if (account.userID !== req.userId) {
            return res.status(403).json({ error: 'Không được phép truy cập' });
        }
        // Nếu không tìm thấy tài khoản trong cơ sở dữ liệu, trả về lỗi
        if (!account) return res.status(404).json({ error: 'Tài khoản không tồn tại' });
        res.json({ balance: account.balance }); // Trả về số dư tài khoản nếu không có lỗi
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Cập nhật số dư tài khoản
exports.updateBalance = async (req, res) => {
    try {
        const account = await Account.findById(req.body.bankAccountID); // Tìm tài khoản
        // Nếu req.userId không khớp với userID của tài khoản, trả về lỗi
        if (account.userID !== req.userId) {
            return res.status(403).json({ error: 'Không được phép truy cập' });
        }
        // Nếu không tìm thấy tài khoản trong cơ sở dữ liệu, trả về lỗi
        if (!account) return res.status(404).json({ error: 'Tài khoản không tồn tại' });
        const newBalance = req.body.newBalance;
        account.balance = newBalance;
        await account.save(); // Lưu số dư mới
        res.json({ message: 'Số dư tài khoản đã được cập nhật!', balance: account.balance });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Lỗi server' });
    }
};