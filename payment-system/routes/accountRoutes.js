// routes/accountRoutes.js

const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const verifyToken = require('../utils/authMiddleware');

// Tạo tài khoản mới
router.post('/create', verifyToken, accountController.createAccount);

// Kiểm tra số dư tài khoản
router.post('/balance', verifyToken, accountController.checkBalance);

// // Cập nhật số dư tài khoản
router.post('/balance/update', verifyToken, accountController.updateBalance);

module.exports = router;