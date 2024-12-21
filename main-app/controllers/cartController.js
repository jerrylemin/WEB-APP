// controllers/cartController.js

const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

// Thêm sản phẩm vào giỏ hàng
exports.addToCart = async (req, res) => {
    try {
        const productId = req.params.id;
        const quantity = parseInt(req.body.quantity) || 1;

        // Tìm sản phẩm trong cơ sở dữ liệu
        const product = await Product.findById(productId);
        if (!product) {
            req.flash('error_msg', 'Sản phẩm không tồn tại');
            return res.redirect('/products');
        }

        if (quantity < 1) {
            req.flash('error_msg', 'Số lượng không hợp lệ');
            return res.redirect('/products/' + productId);
        }

        if (quantity > product.stock) {
            req.flash('error_msg', 'Số lượng sản phẩm vượt quá kho');
            return res.redirect('/products/' + productId);
        }

        // Lấy giỏ hàng hiện tại từ session hoặc khởi tạo mới
        // let cart = req.session.cart || { items: [], totalPrice: 0 };
        let cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) {
            cart = new Cart({ userId: req.user._id, items: [], totalPrice: 0 });
            await cart.save();
        }

        // Tìm xem sản phẩm đã có trong giỏ chưa
        const existingItemIndex = cart.items.findIndex(item => item.product.toString() === productId.toString());

        if (existingItemIndex >= 0) {
            // Nếu đã có, tăng số lượng
            if (cart.items[existingItemIndex].quantity + quantity > product.stock) {
                // req.flash('error_msg', 'Số lượng sản phẩm vượt quá kho');
                // return res.redirect('/products/' + productId);
                req.flash("error_msg", "Số lượng sản phẩm vượt quá kho");
                return res.status(400).end();
            }
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            // Nếu chưa có, thêm sản phẩm mới vào giỏ
            cart.items.push({
                user: req.user._id,
                product: product._id,
                quantity: quantity
            });
        }

        // Tính lại tổng tiền
        cart.totalPrice = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

        await cart.save();

        console.log('Cart Updated:', req.session.cart); // Logging để kiểm tra
        // req.flash('success_msg', 'Thêm sản phẩm vào giỏ hàng thành công');
        // res.redirect('/products/' + productId);
        req.flash("success_msg", "Thêm vào giỏ hàng thành công!");
        return res.status("200").end();

    } catch (err) {
        // console.error('Error in addToCart:', err);
        req.flash('error_msg', 'Đã xảy ra lỗi khi thêm sản phẩm vào giỏ hàng');
        return res.status("500").end();
    }
};

// Xem giỏ hàng
// exports.viewCart = (req, res) => {
//     const cart = req.session.cart || { items: [], totalPrice: 0 };
//     res.render('client/cart', { cart, title: 'Giỏ Hàng' });
// };

// Hiển thị giỏ hàng
exports.getCart = async (req, res) => {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        cart = new Cart({ user: req.user._id, items: [], totalPrice: 0 });
        await cart.save();
    }
    res.render('client/cart', { user: req.user, cart, title: 'Giỏ Hàng' });
};

// Cập nhật giỏ hàng
// exports.updateCart = async (req, res) => {
//     const { items } = req.body;

//     try {
//         let cart = await Cart.findOne({ user: req.user._id });

//         if (cart) {
//             cart.items = items;
//             cart.totalPrice = 0;

//             for (let item of cart.items) {
//                 const product = await Product.findById(item.product);
//                 cart.totalPrice += product.price * item.quantity;
//             }

//             cart.updatedAt = Date.now();
//             await cart.save();
//             req.flash('success_msg', 'Cập nhật giỏ hàng thành công');
//             res.redirect('/cart');
//         } else {
//             res.redirect('/products');
//         }
//     } catch (err) {
//         console.log(err);
//         res.redirect('/cart');
//     }
// };

// Xóa sản phẩm khỏi giỏ hàng
exports.removeFromCart = async (req, res) => {
    const productId = req.params.id;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        return res.send("Không có gì để xóa");
    }

    if (cart.items.length > 0) {
        cart.items = cart.items.filter(item => item.product.toString() !== productId.toString());
        // Tính lại tổng tiền
        cart.totalPrice = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
        req.flash('success_msg', 'Xóa sản phẩm khỏi giỏ hàng thành công');
    } else {
        req.flash('error_msg', 'Giỏ hàng của bạn đang trống');
    }
    
    res.status('200').end();
};

// Hiển thị trang thanh toán
exports.getCheckout = (req, res) => {
    const cart = req.session.cart || { items: [], totalPrice: 0 };
    res.render('client/checkout', { cart, user: req.user, title: 'Thanh Toán' });
};

// Xử lý thanh toán
exports.postCheckout = async (req, res) => {
    try {
        const cart = req.session.cart;
        if (!cart || cart.items.length === 0) {
            req.flash('error_msg', 'Giỏ hàng của bạn đang trống');
            return res.redirect('/cart');
        }

        // Kiểm tra số dư của người dùng
        const user = await User.findById(req.user._id);
        if (user.balance < cart.totalPrice) {
            req.flash('error_msg', 'Số dư không đủ để thanh toán');
            return res.redirect('/cart');
        }

        // Tạo đơn hàng mới
        const newOrder = new Order({
            user: req.user._id,
            cart: cart,
            status: 'Pending' // Trạng thái chờ xác nhận
        });
        await newOrder.save();

        // Trừ số dư của người dùng
        user.balance -= cart.totalPrice;
        await user.save();

        // Trừ số lượng trong kho
        for (let item of cart.items) {
            const product = await Product.findById(item.productId);
            if (product) {
                product.stock -= item.quantity;
                if (product.stock < 0) product.stock = 0;
                await product.save();
            }
        }

        // Gửi yêu cầu đến admin (có thể gửi email hoặc thông báo)
        // Ví dụ: Gửi email đến admin với thông tin đơn hàng

        // Xóa giỏ hàng
        req.session.cart = { items: [], totalPrice: 0 };

        req.flash('success_msg', 'Đặt hàng thành công. Đơn hàng đang chờ xác nhận từ admin.');
        res.redirect('/orders');
    } catch (err) {
        console.error('Error in postCheckout:', err);
        req.flash('error_msg', 'Đã xảy ra lỗi khi thanh toán');
        res.redirect('/cart');
    }
};