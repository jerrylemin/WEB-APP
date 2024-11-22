// controllers/cartController.js

const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

// Thêm sản phẩm vào giỏ hàng
exports.addToCart = async (req, res) => {
    const productId = req.params.id;
    const quantity = parseInt(req.body.quantity) || 1;

    try {
        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [], totalPrice: 0 });
        }

        const product = await Product.findById(productId);
        const itemIndex = cart.items.findIndex(item => item.product.equals(productId));

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ product: productId, quantity });
        }

        cart.totalPrice += product.price * quantity;
        cart.updatedAt = Date.now();

        await cart.save();
        req.flash('success_msg', 'Đã thêm sản phẩm vào giỏ hàng');
        res.redirect('/cart');
    } catch (err) {
        console.log(err);
        res.redirect('/products');
    }
};

// Hiển thị giỏ hàng
exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        res.render('client/cart', { cart });
    } catch (err) {
        console.log(err);
        res.redirect('/products');
    }
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
