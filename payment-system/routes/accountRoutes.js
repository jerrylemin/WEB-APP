// routes/accountRoutes.js

const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
// const { verifyToken, verifyAPIKey } = require('../utils/authMiddleware');
const { verifyAPIKey } = require('../utils/authMiddleware');

// Tạo tài khoản mới
router.post('/create', accountController.createAccount);

// Note: Để sử dụng các API dưới đây, cần phải:
// Trong body của request post chứa bankAccountID, password(người dùng nhập lại, không mã hóa), APIKey(mã hóa bằng AES)

// Kiểm tra số dư tài khoản
router.post('/balance', verifyAPIKey, accountController.checkBalance);

// // Cập nhật số dư tài khoản
router.post('/balance/update', verifyAPIKey, accountController.updateBalance);

module.exports = router;