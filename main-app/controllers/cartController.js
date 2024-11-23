// controllers/cartController.js

const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

// Thêm sản phẩm vào giỏ hàng
exports.addToCart = (req, res) => {
    const productId = req.params.id;
    const quantity = parseInt(req.body.quantity) || 1;

    // Giả sử bạn có function để lấy sản phẩm từ DB
    Product.findById(productId, (err, product) => {
        if (err || !product) {
            req.session.error_msg = 'Sản phẩm không tồn tại.';
            return res.redirect('/products');
        }

        let cart = req.session.cart;
        const existingItemIndex = cart.items.findIndex(item => item.product._id.toString() === productId);

        if (existingItemIndex !== -1) {
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            cart.items.push({ product, quantity });
        }

        cart.totalPrice += product.price * quantity;
        req.session.success_msg = 'Đã thêm sản phẩm vào giỏ hàng.';
        res.redirect('/cart');
    });
};

// Hiển thị giỏ hàng
exports.getCart = (req, res) => {
    const cart = req.session.cart;
    res.render('client/cart', { user: req.user, cart });
};

// Cập nhật giỏ hàng
exports.updateCart = async (req, res) => {
    const { items } = req.body;

    try {
        let cart = await Cart.findOne({ user: req.user._id });

        if (cart) {
            cart.items = items;
            cart.totalPrice = 0;

            for (let item of cart.items) {
                const product = await Product.findById(item.product);
                cart.totalPrice += product.price * item.quantity;
            }

            cart.updatedAt = Date.now();
            await cart.save();
            req.flash('success_msg', 'Cập nhật giỏ hàng thành công');
            res.redirect('/cart');
        } else {
            res.redirect('/products');
        }
    } catch (err) {
        console.log(err);
        res.redirect('/cart');
    }
};

// Xóa sản phẩm khỏi giỏ hàng
exports.removeFromCart = async (req, res) => {
    const productId = req.params.id;

    try {
        let cart = await Cart.findOne({ user: req.user._id });

        if (cart) {
            const itemIndex = cart.items.findIndex(item => item.product.equals(productId));

            if (itemIndex > -1) {
                const product = await Product.findById(productId);
                cart.totalPrice -= product.price * cart.items[itemIndex].quantity;
                cart.items.splice(itemIndex, 1);
                cart.updatedAt = Date.now();
                await cart.save();
                req.flash('success_msg', 'Đã xóa sản phẩm khỏi giỏ hàng');
            }
            res.redirect('/cart');
        } else {
            res.redirect('/products');
        }
    } catch (err) {
        console.log(err);
        res.redirect('/cart');
    }
};
