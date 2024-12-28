// controllers/productController.js

const Product = require('../models/productModel');
const Category = require('../models/categoryModel');

// API để lấy danh sách tất cả các Category
exports.getAllCategories = async (req, res, next) => {
    try {
        const data = await Category.find().lean();
        res.status(200).json(data);
    }
    catch(err) {
        return res.status(500).json({ msg: 'Đã xảy ra lỗi khi lấy danh sách sản phẩm' });
    }
}

// API để lấy danh sách sản phẩm
exports.getProducts = async (req, res) => {
    try {
        console.log("running")
        const perPage = 8;
        const currPage = req.params.page;
        const products = await Product.find().sort({name: 1}).skip(perPage * (currPage - 1)).limit(perPage).lean();
        res.json(products);
    } catch (err) {
        res.status(500).json({ msg: 'Đã xảy ra lỗi khi lấy danh sách sản phẩm' });
    }
};

// API để lấy danh sách sản phẩm đã tìm kiếm theo từng trang
exports.getSearchedProducts = async (req, res) => {
    try {
        const searchQuery = req.body.q;
        const currPage = req.params.page;
        const perPage = 8;
        const products = await Product.find({name: { $regex: searchQuery, $options: 'i' }}).sort({name: 1}).skip(perPage * (currPage - 1)).limit(perPage).lean();
        res.json(products);
    } catch (err) {
        res.status(500).json({ msg: 'Đã xảy ra lỗi khi lấy danh sách sản phẩm' });
    }
};

// API để lấy thông tin chi tiết về sản phẩm
exports.getProductDetails = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).lean();
        const category = await Category.findById(product.category).lean();
        product.category = category.name;
        return res.json(product);
    } catch (err) {
        res.status(500).json({ msg: 'Đã xảy ra lỗi khi lấy chi tiết sản phẩm'});
    }
};

// API để lấy danh sách sản phẩm theo hạng mục theo từng trang
exports.getByCategory = async (req, res, next) => {
    try {
        const currPage = req.params.page;
        const perPage = 8;
        const products = await Product.find({category: req.query.category}).sort({name: 1}).skip(perPage * (currPage - 1)).limit(perPage).lean();
        res.status(200).json(products);
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({ msg: 'Đã xảy ra lỗi khi lấy danh sách sản phẩm' });
    }
}

// Hiển thị sanh sách sản phẩm theo hạng mục
exports.renderProductsByCategory = async (req, res, next) => {
    try {
        console.log("running renderByCat")
        const categoryName = req.query.catName;
        const category = await Category.findOne({name: categoryName}).lean();
        const categoryId = category._id;
        const products = await Product.find({category: categoryId}).sort({name: 1}).lean();
        const perPage = 8;
        const totalPages = Math.ceil(products.length / perPage);
        res.render('client/products', {
            totalPages,
            searchQuery: null,
            category: categoryId
        });
    }
    catch(err) {
        return next(err);
    }
}

// Hiển thị danh sách sản phẩm
exports.renderProducts = async (req, res, next) => {
    try {
        const perPage = 8;
        const totalPages = Math.ceil(await Product.countDocuments() / perPage);
        res.render('client/products', {
            totalPages,
            searchQuery: null,
            category: null
        });
    }
    catch(err) {
        return next(err);
    }
}

// Hiển thị danh sách sản phẩm đang tìm kiếm
exports.renderSearchedProducts = async (req, res) => {
    try {
        const perPage = 8;
        const searchQuery = req.body.q;
        const products = await Product.find({name: { $regex: searchQuery, $options: 'i' }}).lean();
        const totalPages = Math.ceil(products.length / perPage);
        res.render('client/products', {
            totalPages,
            searchQuery,
            category: null
        });
    }
    catch(err) {
        return next(err);
    }
}

// Hiển thị danh sách sản phẩm cho admin
exports.getProductsAdmin = async (req, res) => {
    try {
        const products = await Product.find();
        res.render('admin/products', { products, title: 'Quản Lý Sản Phẩm' });
    } catch (err) {
        console.log(err);
        req.flash('error_msg', 'Đã xảy ra lỗi khi lấy danh sách sản phẩm');
        res.redirect('/admin');
    }
};

// Hiển thị form thêm sản phẩm
exports.addProductForm = async (req, res) => {
    res.render('admin/addProduct', { title: 'Thêm Sản Phẩm Mới' });
};

// Xử lý thêm sản phẩm
exports.addProduct = async (req, res) => {
    const { name, description, price, image } = req.body;
    let errors = [];

    if (!name || !price) {
        errors.push({ msg: 'Vui lòng nhập tên và giá sản phẩm' });
    }

    if (errors.length > 0) {
        res.render('admin/addProduct', { errors, name, description, price, image, title: 'Thêm Sản Phẩm Mới' });
    } else {
        const newProduct = new Product({ name, description, price, image });
        try {
            await newProduct.save();
            req.flash('success_msg', 'Thêm sản phẩm thành công');
            res.redirect('/admin/products');
        } catch (err) {
            console.log(err);
            req.flash('error_msg', 'Đã xảy ra lỗi khi thêm sản phẩm');
            res.redirect('/admin/products');
        }
    }
};

// Hiển thị form chỉnh sửa sản phẩm
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
    const query = req.body.q || '';
    try {
        const products = await Product.find({ name: new RegExp(query, 'i') }).lean();

        res.render('client/products', { products, title: 'Kết Quả Tìm Kiếm' });
    } catch (err) {
        console.log(err);
        res.send('Đã xảy ra lỗi khi tìm kiếm sản phẩm');
    }
};



// exports.addReview = async (req, res) => {
//     try {
//         const { rating, comment } = req.body;
//         const product = await Product.findById(req.params.id);

//         const alreadyReviewed = product.reviews.find(r => r.user.toString() === req.user._id.toString());

//         if (alreadyReviewed) {
//             req.flash('error_msg', 'Bạn đã đánh giá sản phẩm này');
//             return res.redirect('/products/' + req.params.id);
//         }

//         const review = {
//             user: req.user._id,
//             name: req.user.name,
//             rating: Number(rating),
//             comment
//         };

//         product.reviews.push(review);
//         product.numReviews = product.reviews.length;
//         product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

//         await product.save();
//         req.flash('success_msg', 'Đánh giá của bạn đã được thêm');
//         res.redirect('/products/' + req.params.id);
//     } catch (err) {
//         console.error('Error adding review:', err);
//         req.flash('error_msg', 'Đã xảy ra lỗi khi thêm đánh giá');
//         res.redirect('/products/' + req.params.id);
//     }
// };
