// routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { ensureAdmin } = require('../middleware/adminMiddleware');

// Dashboard Admin
router.get('/dashboard', ensureAdmin, adminController.renderDashboard);

// Quản Lý Người Dùng
router.get('/users', ensureAdmin, adminController.listUsers);
router.get('/users/edit/:id', ensureAdmin, adminController.editUserForm);
router.post('/users/edit/:id', ensureAdmin, adminController.updateUser);
router.post('/users/delete/:id', ensureAdmin, adminController.deleteUser);

// Quản Lý Sản Phẩm
router.get('/products', ensureAdmin, adminController.listProducts);
router.get('/products/add', ensureAdmin, adminController.addProductForm);
router.post('/products/add', ensureAdmin, adminController.addProduct);
router.get('/products/edit/:id', ensureAdmin, adminController.editProductForm);
router.post('/products/edit/:id', ensureAdmin, adminController.updateProduct);
router.post('/products/delete/:id', ensureAdmin, adminController.deleteProduct);

// Quản Lý Đơn Hàng
router.get('/orders', ensureAdmin, adminController.listOrders);
router.get('/orders/view/:id', ensureAdmin, adminController.viewOrder);
router.post('/orders/update/:id', ensureAdmin, adminController.updateOrderStatus);

// Thêm vào routes/adminRoutes.js

// Quản Lý Danh Mục
router.get('/categories', ensureAdmin, adminController.listCategories);
router.get('/categories/add', ensureAdmin, adminController.addCategoryForm);
router.post('/categories/add', ensureAdmin, adminController.addCategory);
router.get('/categories/edit/:id', ensureAdmin, adminController.editCategoryForm);
router.post('/categories/edit/:id', ensureAdmin, adminController.updateCategory);
router.post('/categories/delete/:id', ensureAdmin, adminController.deleteCategory);

// Quản Lý Bài Viết
router.get('/posts', ensureAdmin, adminController.listPosts);
router.get('/posts/add', ensureAdmin, adminController.addPostForm);
router.post('/posts/add', ensureAdmin, adminController.addPost);
router.get('/posts/edit/:id', ensureAdmin, adminController.editPostForm);
router.post('/posts/edit/:id', ensureAdmin, adminController.updatePost);
router.post('/posts/delete/:id', ensureAdmin, adminController.deletePost);

module.exports = router;
