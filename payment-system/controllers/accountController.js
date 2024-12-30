// controllers/accountController.js

const Account = require('../models/accountModel');
const crypto = require('crypto');


// Tạo tài khoản mới
exports.createAccount = async (req, res) => {
    try {
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
        // console.log(err);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Kiểm tra số dư tài khoản
exports.checkBalance = async (req, res) => {
    try {
        const account = await Account.findOne({ userID: req.userId }).lean(); // Tìm tài khoản ứng với userID trong jwt token của người dùng
        // console.log(account);
        // Nếu không tìm thấy tài khoản trong cơ sở dữ liệu, trả về lỗi
        if (!account) {
            return res.status(404).json({ error: 'Tài khoản không tồn tại' });
        }
        res.json({ balance: account.balance }); // Trả về số dư tài khoản nếu không có lỗi
    } catch (err) {
        // console.log(err);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Cập nhật số dư tài khoản
exports.updateBalance = async (req, res) => {
    try {
        console.log("Đang cập nhật số dư tài khoản...");
        const account = await Account.findOne({ userID: req.userId }); // Tìm tài khoản ứng với userID trong jwt token của người dùng
        // Nếu không tìm thấy tài khoản trong cơ sở dữ liệu, trả về lỗi
        if (!account) return res.status(404).json({ error: 'Tài khoản không tồn tại' });
        const addedAmount = parseInt(req.body.amount);
        if(account.balance + addedAmount < 0) {
            return res.status(400).json({ message: 'Số dư mới không thể là số âm!' });
        }
        account.balance += addedAmount;
        await account.save(); // Lưu số dư mới
        return res.status(200).json({ message: 'Số dư tài khoản đã được cập nhật!', balance: account.balance });
    } catch (err) {
        // console.log(err);
        return res.status(500).json({ error: 'Lỗi server' });
    }
};