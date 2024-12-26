// routes/productRoutes.js

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { isAdmin } = require('../utils/authMiddleware');
const { ensureAuthenticated } = require('../utils/authMiddleware');

// Route để hiển thị danh sách sản phẩm (Client)
router.get('/', productController.renderProducts);

// Route để hiển thị danh sách sản phẩm theo trang
router.get('/page/:page', productController.getProducts);

// Route để hiển thị danh sách sản phẩm đã tìm kiếm (Client)
router.post('/search', productController.renderSearchedProducts);

// Route để tìm kiếm sản phẩm
router.post('/search/:page', productController.getSearchedProducts);

// Route để hiển thị chi tiết sản phẩm (Client)
router.get('/id/:id', productController.getProductDetails);

// Route quản trị để liệt kê sản phẩm
router.get('/admin', isAdmin, productController.getProductsAdmin);

// Route quản trị để thêm sản phẩm
router.get('/admin/add', isAdmin, productController.addProductForm);
router.post('/admin/add', isAdmin, productController.addProduct);

// Route quản trị để chỉnh sửa sản phẩm
router.get('/admin/edit/:id', isAdmin, productController.editProductForm);
router.post('/admin/edit/:id', isAdmin, productController.editProduct);

// Route quản trị để xóa sản phẩm
router.post('/admin/delete/:id', isAdmin, productController.deleteProduct);

// Thêm đánh giá sản phẩm
// router.post('/:id/review', ensureAuthenticated, productController.addReview);

module.exports = router;
