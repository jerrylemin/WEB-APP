// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { ensureAuthenticated } = require('../utils/authMiddleware');

// Hiển thị trang cá nhân
router.get('/profile', ensureAuthenticated, userController.getProfile);

// Cập nhật thông tin cá nhân
router.post('/profile', ensureAuthenticated, userController.updateProfile);

module.exports = router;
