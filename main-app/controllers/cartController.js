// controllers/cartController.js

const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

// Thêm sản phẩm vào giỏ hàng
exports.addToCart = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            req.flash('error_msg', 'Sản phẩm không tồn tại');
            return res.redirect('/products');
        }

        let cart = req.session.cart || {};

        if (cart[product.id]) {
            cart[product.id].quantity += 1;
        } else {
            cart[product.id] = {
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: 1
            };
        }

        req.session.cart = cart;
        req.flash('success_msg', 'Thêm sản phẩm vào giỏ hàng thành công');
        res.redirect('/products');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Đã xảy ra lỗi khi thêm sản phẩm vào giỏ hàng');
        res.redirect('/products');
    }
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
