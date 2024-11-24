// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { ensureAuthenticated } = require('../utils/authMiddleware');

// Hiển thị trang cá nhân
router.get('/profile', ensureAuthenticated, userController.getProfile);

// Cập nhật thông tin cá nhân
router.post('/profile', ensureAuthenticated, userController.updateProfile);

// Chỉnh sửa hồ sơ người dùng
router.get('/profile/edit', ensureAuthenticated, userController.editProfile);
router.post('/profile/edit', ensureAuthenticated, userController.updateProfile);

// Hiển thị form cập nhật số dư
router.get('/balance/edit', ensureAuthenticated, userController.editBalanceForm);

// Xử lý cập nhật số dư
router.post('/balance/edit', ensureAuthenticated, userController.updateBalance);

module.exports = router;
