// routes/productRoutes.js

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { isAdmin } = require('../utils/authMiddleware');

// Hiển thị danh sách sản phẩm cho khách hàng
router.get('/', productController.getProducts);

// Hiển thị chi tiết sản phẩm
router.get('/:id', productController.getProductDetails);

// Các route cho admin quản lý sản phẩm
router.get('/admin', isAdmin, productController.getProductsAdmin);
router.get('/admin/add', isAdmin, productController.addProductForm);
router.post('/admin/add', isAdmin, productController.addProduct);
router.get('/admin/edit/:id', isAdmin, productController.editProductForm);
router.put('/admin/edit/:id', isAdmin, productController.editProduct);
router.delete('/admin/delete/:id', isAdmin, productController.deleteProduct);

// Tìm kiếm sản phẩm
router.get('/search', productController.searchProducts);

module.exports = router;
