// routes/transactionRoutes.js

const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { verifyToken } = require('../utils/authMiddleware');

// Thực hiện giao dịch
router.post('/transfer', verifyToken, transactionController.transfer);

// Lấy thông tin giao dịch
router.get('/:transactionId', verifyToken, transactionController.getTransaction);

module.exports = router;
