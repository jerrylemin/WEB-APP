// routes/homeRoutes.js

const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

// Route cho trang chủ
router.get('/', homeController.renderHome);

module.exports = router;
