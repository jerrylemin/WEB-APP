// controllers/transactionController.js
const fs = require('fs');
const path = require('path');
const Account = require('../models/accountModel');
const Transaction = require('../models/transactionModel');

// Thực hiện giao dịch chuyển khoản
exports.transfer = async (req, res) => {
    const { amount } = req.body;
    const fromUserId = req.userId;
    try {
        const fromAccount = await Account.findOne({ userId: fromUserId });
        const toAccount = await Account.findOne({ userId: 'main_account' }); // Tài khoản chính

        if (!fromAccount || !toAccount) {
            return res.status(404).json({ error: 'Tài khoản không tồn tại' });
        }

        if (fromAccount.balance < amount) {
            return res.status(400).json({ error: 'Số dư không đủ' });
        }

        // Tạo giao dịch
        const transaction = new Transaction({
            fromAccount: fromAccount._id,
            toAccount: toAccount._id,
            amount,
            status: 'Completed'
        });

        // Cập nhật số dư
        fromAccount.balance -= amount;
        toAccount.balance += amount;

        // Lưu thay đổi
        await fromAccount.save();
        await toAccount.save();
        await transaction.save();

        res.json({ message: 'Giao dịch thành công', transaction });

        // Sau khi giao dịch thành công
        const logData = `Transaction ID: ${transaction._id}, From: ${fromUserId}, Amount: ${amount}, Date: ${new Date().toISOString()}\n`;
        fs.appendFile(path.join(__dirname, '../logs/transactions.log'), logData, (err) => {
            if (err) console.log('Lỗi ghi log:', err);
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Lấy thông tin giao dịch
exports.getTransaction = async (req, res) => {
    const { transactionId } = req.params;
    try {
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) return res.status(404).json({ error: 'Giao dịch không tồn tại' });
        res.json(transaction);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Lỗi server' });
    }
};