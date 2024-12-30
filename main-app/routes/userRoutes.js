// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { ensureAuthenticated } = require('../utils/authMiddleware');

// API dùng để lấy ID người dùng với tài khoản thanh toán chính
router.get('/mainaccount', userController.getMainAccount);

// Hiển thị trang cá nhân
router.get('/profile', ensureAuthenticated, userController.getProfile);

// Cập nhật thông tin cá nhân
router.post('/profile', ensureAuthenticated, userController.updateProfile);

// Chỉnh sửa hồ sơ người dùng
router.get('/profile/edit', ensureAuthenticated, userController.editProfile);

router.post('/profile/edit', ensureAuthenticated, userController.updateProfile);

// Hiển thị form cập nhật số dư
router.get('/balance/edit', ensureAuthenticated, userController.editBalanceForm);

module.exports = router;
