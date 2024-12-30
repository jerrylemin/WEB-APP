// controllers/transactionController.js
const fs = require('fs');
const path = require('path');
const Account = require('../models/accountModel');
const Transaction = require('../models/transactionModel');
const { default: mongoose } = require('mongoose');

// Thực hiện giao dịch chuyển khoản
exports.transfer = async (req, res) => {
    const { amount } = req.body;
    const fromUserId = req.userId;
    // Tài khoản chính nhận thanh toán
    // Sử dụng API để hỏi hệ thống chính xem tài khoản nhận thanh toán chính là của người dùng nào
    const response = await fetch("https://localhost:5000/mainaccount");
    const resData = await response.json();
    if(resData.message) {
        return res.status(404).json({message: resData.message});
    }
    const toUserId = resData.id;
    try {
        const fromAccount = await Account.findOne({ userID: fromUserId });
        const toAccount = await Account.findOne({ userID: toUserId }); // Tài khoản chính

        if (!fromAccount || !toAccount) {
            console.log("Tài khoản không tồn tại")
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

        // Sử dụng Transaction để lưu thay đổi 
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            await fromAccount.save();
            await toAccount.save();
            await transaction.save();
            await session.commitTransaction();
        }
        catch(err) {
            await session.abortTransaction();
            // console.log(err);
        }
        finally {
            session.endSession();
        }

        res.status(200).json({ message: 'Giao dịch thành công', transaction, error: null });
    } catch (err) {
        // console.log(err);
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
        // console.log(err);
        res.status(500).json({ error: 'Lỗi server' });
    }
};