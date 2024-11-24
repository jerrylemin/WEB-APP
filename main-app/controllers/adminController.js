// controllers/adminController.js

const User = require('../models/userModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const logger = require('../logger');

exports.getDashboard = (req, res) => {
    res.render('admin/dashboard', { title: 'Dashboard Admin' });
};

// Render Dashboard Admin
exports.renderDashboard = async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const productCount = await Product.countDocuments();
        const orderCount = await Order.countDocuments();
        const totalRevenue = await Order.aggregate([
            { $match: { status: 'Delivered' } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);
        const revenue = totalRevenue[0] ? totalRevenue[0].total : 0;
        logger.info(`Admin ${req.user.email} đã truy cập dashboard`);
        res.render('admin/dashboard', { user: req.user, userCount, productCount, orderCount, revenue, title: 'Dashboard Admin' });
    } catch (err) {
        logger.error('Lỗi khi render dashboard với thống kê:', err);
        console.error('Lỗi khi render dashboard với thống kê:', err);
        req.flash('error_msg', 'Đã xảy ra lỗi khi tải dashboard');
        res.redirect('/');
    }
};

// Quản Lý Người Dùng
exports.listUsers = async (req, res) => {
    try {
        const users = await User.find().lean();
        res.render('admin/users', { users, title: 'Quản Lý Người Dùng' });
    } catch (err) {
        console.error('Lỗi khi lấy danh sách người dùng:', err);
        req.flash('error_msg', 'Đã xảy ra lỗi khi lấy danh sách người dùng');
        res.redirect('/admin/dashboard');
    }
};


exports.editUserForm = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).lean();
        if (!user) {
            req.flash('error_msg', 'Người dùng không tồn tại');
            return res.redirect('/admin/users');
        }
        res.render('admin/editUser', { user, title: 'Chỉnh Sửa Người Dùng' });
    } catch (err) {
        console.error('Lỗi khi lấy thông tin người dùng:', err);
        req.flash('error_msg', 'Đã xảy ra lỗi khi lấy thông tin người dùng');
        res.redirect('/admin/users');
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { name, email, isAdmin } = req.body;
        await User.findByIdAndUpdate(req.params.id, { name, email, isAdmin: isAdmin === 'on' });
        req.flash('success_msg', 'Cập nhật người dùng thành công');
        res.redirect('/admin/users');
    } catch (err) {
        console.error('Lỗi khi cập nhật người dùng:', err);
        req.flash('error_msg', 'Đã xảy ra lỗi khi cập nhật người dùng');
        res.redirect('/admin/users');
    }
};

exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'Xóa người dùng thành công');
        res.redirect('/admin/users');
    } catch (err) {
        console.error('Lỗi khi xóa người dùng:', err);
        req.flash('error_msg', 'Đã xảy ra lỗi khi xóa người dùng');
        res.redirect('/admin/users');
    }
};

// Quản Lý Sản Phẩm
exports.listProducts = async (req, res) => {
    try {
        const products = await Product.find().lean();
        res.render('admin/products', { products, title: 'Quản Lý Sản Phẩm' });
    } catch (err) {
        console.error('Lỗi khi lấy danh sách sản phẩm:', err);
        req.flash('error_msg', 'Đã xảy ra lỗi khi lấy danh sách sản phẩm');
        res.redirect('/admin/dashboard');
    }
};



exports.addProductForm = (req, res) => {
    res.render('admin/addProduct', { title: 'Thêm Sản Phẩm Mới' });
};


exports.addProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock } = req.body;
        const newProduct = new Product({ name, description, price, category, stock });
        await newProduct.save();
        req.flash('success_msg', 'Thêm sản phẩm thành công');
        res.redirect('/admin/products');
    } catch (err) {
        console.error('Lỗi khi thêm sản phẩm:', err);
        req.flash('error_msg', 'Đã xảy ra lỗi khi thêm sản phẩm');
        res.redirect('/admin/products');
    }
};

exports.editProductForm = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).lean();
        if (!product) {
            req.flash('error_msg', 'Sản phẩm không tồn tại');
            return res.redirect('/admin/products');
        }
        res.render('admin/editProduct', { product, title: 'Chỉnh Sửa Sản Phẩm' });
    } catch (err) {
        console.error('Lỗi khi lấy thông tin sản phẩm:', err);
        req.flash('error_msg', 'Đã xảy ra lỗi khi lấy thông tin sản phẩm');
        res.redirect('/admin/products');
    }
};


exports.updateProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock } = req.body;
        await Product.findByIdAndUpdate(req.params.id, { name, description, price, category, stock });
        req.flash('success_msg', 'Cập nhật sản phẩm thành công');
        res.redirect('/admin/products');
    } catch (err) {
        console.error('Lỗi khi cập nhật sản phẩm:', err);
        req.flash('error_msg', 'Đã xảy ra lỗi khi cập nhật sản phẩm');
        res.redirect('/admin/products');
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'Xóa sản phẩm thành công');
        res.redirect('/admin/products');
    } catch (err) {
        console.error('Lỗi khi xóa sản phẩm:', err);
        req.flash('error_msg', 'Đã xảy ra lỗi khi xóa sản phẩm');
        res.redirect('/admin/products');
    }
};

// Quản Lý Đơn Hàng
exports.listOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user')
            .populate('cart.items.productId')
            .lean();

        // Tính toán totalPrice nếu chưa tồn tại
        orders.forEach(order => {
            if (!order.cart.totalPrice) {
                order.totalPrice = order.cart.items.reduce(
                    (acc, item) => acc + item.price * item.quantity,
                    0
                );
            } else {
                order.totalPrice = order.cart.totalPrice; // Nếu đã có, sử dụng trực tiếp
            }
        });

        console.log('Orders with totalPrice:', orders);
        res.render('admin/orders', { orders, title: 'Quản Lý Đơn Hàng' });
    } catch (err) {
        console.error('Error fetching orders for admin:', err);
        req.flash('error_msg', 'Đã xảy ra lỗi khi lấy danh sách đơn hàng');
        res.redirect('/admin');
    }
};


exports.viewOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user').populate('cart.items.productId').lean();
        if (!order) {
            req.flash('error_msg', 'Đơn hàng không tồn tại');
            return res.redirect('/admin/orders');
        }
        res.render('admin/viewOrder', { order });
    } catch (err) {
        console.error('Lỗi khi lấy thông tin đơn hàng:', err);
        req.flash('error_msg', 'Đã xảy ra lỗi khi lấy thông tin đơn hàng');
        res.redirect('/admin/orders');
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        await Order.findByIdAndUpdate(req.params.id, { status });
        req.flash('success_msg', 'Cập nhật trạng thái đơn hàng thành công');
        res.redirect('/admin/orders');
    } catch (err) {
        console.error('Lỗi khi cập nhật trạng thái đơn hàng:', err);
        req.flash('error_msg', 'Đã xảy ra lỗi khi cập nhật trạng thái đơn hàng');
        res.redirect('/admin/orders');
    }
};

const Category = require('../models/categoryModel'); // Tạo model category nếu chưa có

// Quản Lý Danh Mục
exports.listCategories = async (req, res) => {
    try {
        const categories = await Category.find().lean();
        res.render('admin/categories', { categories, title: 'Quản Lý Danh Mục' });
    } catch (err) {
        console.error('Lỗi khi lấy danh sách danh mục:', err);
        req.flash('error_msg', 'Đã xảy ra lỗi khi lấy danh sách danh mục');
        res.redirect('/admin/dashboard');
    }
};


exports.addCategoryForm = (req, res) => {
    res.render('admin/addCategory', { title: 'Thêm Danh Mục Mới' });
};


exports.addCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            req.flash('error_msg', 'Danh mục đã tồn tại');
            return res.redirect('/admin/categories/add');
        }
        const newCategory = new Category({ name });
        await newCategory.save();
        req.flash('success_msg', 'Thêm danh mục thành công');
        res.redirect('/admin/categories');
    } catch (err) {
        console.error('Lỗi khi thêm danh mục:', err);
        req.flash('error_msg', 'Đã xảy ra lỗi khi thêm danh mục');
        res.redirect('/admin/categories/add');
    }
};

exports.editCategoryForm = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id).lean();
        if (!category) {
            req.flash('error_msg', 'Danh mục không tồn tại');
            return res.redirect('/admin/categories');
        }
        res.render('admin/editCategory', { category, title: 'Chỉnh Sửa Danh Mục' });
    } catch (err) {
        console.error('Lỗi khi lấy thông tin danh mục:', err);
        req.flash('error_msg', 'Đã xảy ra lỗi khi lấy thông tin danh mục');
        res.redirect('/admin/categories');
    }
};


exports.updateCategory = async (req, res) => {
    try {
        const { name } = req.body;
        await Category.findByIdAndUpdate(req.params.id, { name });
        req.flash('success_msg', 'Cập nhật danh mục thành công');
        res.redirect('/admin/categories');
    } catch (err) {
        console.error('Lỗi khi cập nhật danh mục:', err);
        req.flash('error_msg', 'Đã xảy ra lỗi khi cập nhật danh mục');
        res.redirect('/admin/categories');
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'Xóa danh mục thành công');
        res.redirect('/admin/categories');
    } catch (err) {
        console.error('Lỗi khi xóa danh mục:', err);
        req.flash('error_msg', 'Đã xảy ra lỗi khi xóa danh mục');
        res.redirect('/admin/categories');
    }
};

const Post = require('../models/postModel'); // Tạo model post nếu chưa có

// Quản Lý Bài Viết
exports.listPosts = async (req, res) => {
    try {
        const posts = await Post.find().lean();
        res.render('admin/posts', { posts, title: 'Quản Lý Bài Viết' });
    } catch (err) {
        console.error('Lỗi khi lấy danh sách bài viết:', err);
        req.flash('error_msg', 'Đã xảy ra lỗi khi lấy danh sách bài viết');
        res.redirect('/admin/dashboard');
    }
};


exports.addPostForm = (req, res) => {
    res.render('admin/addPost', { title: 'Thêm Bài Viết Mới' });
};


exports.addPost = async (req, res) => {
    try {
        const { title, content } = req.body;
        const newPost = new Post({ title, content });
        await newPost.save();
        req.flash('success_msg', 'Thêm bài viết thành công');
        res.redirect('/admin/posts');
    } catch (err) {
        console.error('Lỗi khi thêm bài viết:', err);
        req.flash('error_msg', 'Đã xảy ra lỗi khi thêm bài viết');
        res.redirect('/admin/posts/add');
    }
};

exports.editPostForm = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).lean();
        if (!post) {
            req.flash('error_msg', 'Bài viết không tồn tại');
            return res.redirect('/admin/posts');
        }
        res.render('admin/editPost', { post, title: 'Chỉnh Sửa Bài Viết' });
    } catch (err) {
        console.error('Lỗi khi lấy thông tin bài viết:', err);
        req.flash('error_msg', 'Đã xảy ra lỗi khi lấy thông tin bài viết');
        res.redirect('/admin/posts');
    }
};


exports.updatePost = async (req, res) => {
    try {
        const { title, content } = req.body;
        await Post.findByIdAndUpdate(req.params.id, { title, content });
        req.flash('success_msg', 'Cập nhật bài viết thành công');
        res.redirect('/admin/posts');
    } catch (err) {
        console.error('Lỗi khi cập nhật bài viết:', err);
        req.flash('error_msg', 'Đã xảy ra lỗi khi cập nhật bài viết');
        res.redirect('/admin/posts');
    }
};

exports.deletePost = async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'Xóa bài viết thành công');
        res.redirect('/admin/posts');
    } catch (err) {
        console.error('Lỗi khi xóa bài viết:', err);
        req.flash('error_msg', 'Đã xảy ra lỗi khi xóa bài viết');
        res.redirect('/admin/posts');
    }
};

// Hiển thị danh sách đơn hàng chờ xác nhận
exports.listPendingOrders = async (req, res) => {
    try {
        const orders = await Order.find({ status: 'Pending' }).populate('user').lean();
        res.render('admin/pendingOrders', { orders, title: 'Đơn Hàng Chờ Xác Nhận' });
    } catch (err) {
        console.error('Error fetching pending orders:', err);
        req.flash('error_msg', 'Đã xảy ra lỗi khi lấy danh sách đơn hàng chờ xác nhận');
        res.redirect('/admin');
    }
};

// Xác nhận đơn hàng
exports.confirmOrder = async (req, res) => {
    try {
        await Order.findByIdAndUpdate(req.params.id, { status: 'Confirmed' });
        req.flash('success_msg', 'Đơn hàng đã được xác nhận');
        res.redirect('/admin/orders/pending');
    } catch (err) {
        console.error('Error confirming order:', err);
        req.flash('error_msg', 'Đã xảy ra lỗi khi xác nhận đơn hàng');
        res.redirect('/admin/orders/pending');
    }
};