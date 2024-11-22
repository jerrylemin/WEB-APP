// controllers/productController.js

const Product = require('../models/productModel');

// Hiển thị danh sách sản phẩm
exports.getProducts = async (req, res) => {
    const perPage = 9;
    const page = parseInt(req.query.page) || 1;

    try {
        const products = await Product.find()
            .skip((perPage * page) - perPage)
            .limit(perPage);

        const count = await Product.countDocuments();

        res.render('client/products', {
            products,
            current: page,
            pages: Math.ceil(count / perPage)
        });
    } catch (err) {
        console.log(err);
        res.redirect('/');
    }
};

// Hiển thị chi tiết sản phẩm
exports.getProductDetails = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        res.render('client/productDetails', { product });
    } catch (err) {
        console.log(err);
        res.redirect('/products');
    }
};

// Hiển thị danh sách sản phẩm cho admin
exports.getProductsAdmin = async (req, res) => {
    try {
        const products = await Product.find();
        res.render('admin/products', { products });
    } catch (err) {
        console.log(err);
        res.redirect('/admin');
    }
};

// Hiển thị form thêm sản phẩm
exports.addProductForm = (req, res) => {
    res.render('admin/addProduct');
};

// Xử lý thêm sản phẩm
exports.addProduct = async (req, res) => {
    const { name, description, price, image } = req.body;
    let errors = [];

    if (!name || !price) {
        errors.push({ msg: 'Vui lòng nhập tên và giá sản phẩm' });
    }

    if (errors.length > 0) {
        res.render('admin/addProduct', { errors, name, description, price, image });
    } else {
        const newProduct = new Product({ name, description, price, image });
        try {
            await newProduct.save();
            req.flash('success_msg', 'Thêm sản phẩm thành công');
            res.redirect('/admin/products');
        } catch (err) {
            console.log(err);
            res.redirect('/admin/products');
        }
    }
};

// Hiển thị form chỉnh sửa sản phẩm
exports.editProductForm = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        res.render('admin/editProduct', { product });
    } catch (err) {
        console.log(err);
        res.redirect('/admin/products');
    }
};

// Xử lý chỉnh sửa sản phẩm
exports.editProduct = async (req, res) => {
    const { name, description, price, image } = req.body;
    try {
        await Product.findByIdAndUpdate(req.params.id, { name, description, price, image });
        req.flash('success_msg', 'Cập nhật sản phẩm thành công');
        res.redirect('/admin/products');
    } catch (err) {
        console.log(err);
        res.redirect('/admin/products');
    }
};

// Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'Xóa sản phẩm thành công');
        res.redirect('/admin/products');
    } catch (err) {
        console.log(err);
        res.redirect('/admin/products');
    }
};

exports.searchProducts = async (req, res) => {
    const query = req.query.q;
    try {
        const products = await Product.find({ name: new RegExp(query, 'i') });
        res.render('client/products', { products });
    } catch (err) {
        console.log(err);
        res.redirect('/products');
    }
};
