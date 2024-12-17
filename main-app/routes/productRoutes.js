// routes/productRoutes.js

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { isAdmin } = require('../utils/authMiddleware');
const { ensureAuthenticated } = require('../utils/authMiddleware');

// Route để hiển thị danh sách sản phẩm (Client)
router.get('/products', productController.getProducts);

// Route để tìm kiếm sản phẩm
router.get('/products/search', productController.searchProducts);

// // Route để hiển thị chi tiết sản phẩm (Client)
// router.get('/:id', productController.getProductDetails);

// Route quản trị để liệt kê sản phẩm
router.get('/admin', productController.getProductsAdmin);

// Route quản trị để thêm sản phẩm
router.get('/admin/add', productController.addProductForm);
router.post('/admin/add', productController.addProduct);

// Route quản trị để chỉnh sửa sản phẩm
router.get('/admin/edit/:id', productController.editProductForm);
router.post('/admin/edit/:id', productController.editProduct);

// Route quản trị để xóa sản phẩm
router.post('/admin/delete/:id', productController.deleteProduct);

// Thêm đánh giá sản phẩm
router.post('/:id/review', ensureAuthenticated, productController.addReview);
module.exports = router;
