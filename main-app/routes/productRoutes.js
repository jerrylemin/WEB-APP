// routes/productRoutes.js

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { isAdmin } = require('../utils/authMiddleware');
const { ensureAuthenticated } = require('../utils/authMiddleware');

// API Route để lấy danh sách các category hiện có
router.get('/categories', productController.getAllCategories);

// API Route để lấy danh sách giá thấp nhất và giá cao nhất
router.get('/price/range', productController.getPriceRange)

// API Route để lấy danh sách sản phẩm theo từng trang
router.post('/page/:page', productController.getProducts);

// API Route để lấy danh sách sản phẩm đã tìm kiếm theo từng trang
router.post('/search/:page', productController.getSearchedProducts);

// API Route để lấy danh sách sản phẩm của 1 category theo từng trang
router.post("/category/page/:page", productController.getByCategory);

// API Route để hiển thị chi tiết sản phẩm
router.get('/id/:id', productController.getProductDetails);

// API Route để lấy sản phẩm tương tự (cùng category)
router.get('/id/:id/related', productController.getRelatedProducts);

// Route để render danh sách sản phẩm 
router.get('/', productController.renderProducts);

// Route để render danh sách sản phẩm đã tìm kiếm
router.post('/search', productController.renderSearchedProducts);

// Route để render danh sách sản phẩm theo hạng mục
router.get('/category', productController.renderProductsByCategory);

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
