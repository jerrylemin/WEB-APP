// routes/accountRoutes.js

const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const { verifyToken, verifyAPIKey } = require('../utils/authMiddleware');

router.post('/create', verifyToken, verifyAPIKey, accountController.createAccount);

// Tạo tài khoản mới
router.post('/create', accountController.createAccount);

// Lấy thông tin tài khoản
router.get('/:userId', accountController.getAccount);

// Kiểm tra số dư tài khoản
router.get('/balance/:userId', accountController.checkBalance);

module.exports = router;
