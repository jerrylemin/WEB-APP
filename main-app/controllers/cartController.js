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
            // req.flash('error_msg', 'Sản phẩm không tồn tại');
            // return res.redirect('/products');
            res.send('Sản phẩm không tồn tại');
        }

        if (quantity < 1) {
            // req.flash('error_msg', 'Số lượng không hợp lệ');
            // return res.redirect('/products/' + productId);
            res.send('Số lượng không hợp lệ');
        }

        if (quantity > product.stock) {
            // req.flash('error_msg', 'Số lượng sản phẩm vượt quá kho');
            // return res.redirect('/products/' + productId);
            res.send('Số lượng sản phẩm vượt quá kho');
        }

        // Lấy giỏ hàng hiện tại từ session hoặc khởi tạo mới
        // let cart = req.session.cart || { items: [], totalPrice: 0 };
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [], totalPrice: 0 });
            await cart.save();
        }
        
        // Tìm xem sản phẩm đã có trong giỏ chưa
        const existingItemIndex = cart.items.findIndex(item => item.product.toString() === productId.toString());

        if (existingItemIndex >= 0) {
            // Nếu đã có, tăng số lượng
            if (cart.items[existingItemIndex].quantity + quantity > product.stock) {
                // req.flash('error_msg', 'Số lượng sản phẩm vượt quá kho');
                // return res.redirect('/products/' + productId);
                // req.flash("error_msg", "Số lượng sản phẩm vượt quá kho");
                // return res.status(400).end();
                return res.send("Số lượng sản phẩm vượt quá kho");
            }
            cart.items[existingItemIndex].quantity += quantity;
            await cart.save();
        } else {
            // Nếu chưa có, thêm sản phẩm mới vào giỏ
            cart.items.push({
                product: productId,
                quantity: quantity
            });
            // console.log(cart.items);
            await cart.save();
        }
        
        // Tính lại tổng tiền
        cart.totalPrice = cart.items.reduce((acc, item) => {
            return acc + product.price * item.quantity;
        }, 0);
        await cart.save();
        // console.log(cart);
    
        // console.log('Cart Updated:', req.session.cart); // Logging để kiểm tra
        // req.flash("success_msg", "Thêm vào giỏ hàng thành công!");
        // return res.status("200").end();
        res.send("Thêm vào giỏ hàng thành công!");

    } catch (err) {
        console.error('Error in addToCart:', err);
        // req.flash('error_msg', 'Đã xảy ra lỗi khi thêm sản phẩm vào giỏ hàng');
        // return res.status("500").end();
        res.send("Đã xảy ra lỗi khi thêm sản phẩm vào giỏ hàng");
    }
};

// Xem giỏ hàng
// exports.viewCart = (req, res) => {
//     const cart = req.session.cart || { items: [], totalPrice: 0 };
//     res.render('client/cart', { cart, title: 'Giỏ Hàng' });
// };

// Hiển thị giỏ hàng
exports.getCart = async (req, res) => {
    let cart = await Cart.findOne({ user: req.user._id }).lean();
    cart.items = await Promise.all(cart.items.map(async item => {
        const product = await Product.findById(item.product).lean();
        return { ...item, productInfo: product };
    }));
    // console.log(cart);
    res.render('client/cart', { user: req.user, cart, title: 'Giỏ Hàng' });
};

// Xóa sản phẩm khỏi giỏ hàng
exports.removeFromCart = async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        return res.send("Không có gì để xóa");
    }

    if (cart.items.length > 0) {
        cart.items = cart.items.filter(item => item.product.toString() !== productId.toString());
        // Tính lại tổng tiền
        cart.totalPrice = cart.items.reduce((acc, item) => acc + product.price * item.quantity, 0);
        await cart.save();
        // req.flash('success_msg', 'Xóa sản phẩm khỏi giỏ hàng thành công');
        res.send('Xóa sản phẩm khỏi giỏ hàng thành công');
    } else {
        // req.flash('error_msg', 'Giỏ hàng của bạn đang trống');
        res.send('Giỏ hàng của bạn đang trống');
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
            // req.flash('error_msg', 'Giỏ hàng của bạn đang trống');
            // return res.redirect('/cart');
            res.send('Giỏ hàng của bạn đang trống');
        }

        // Kiểm tra số dư của người dùng
        const user = await User.findById(req.user._id);
        if (user.balance < cart.totalPrice) {
            // req.flash('error_msg', 'Số dư không đủ để thanh toán');
            // return res.redirect('/cart');
            res.send('Số dư không đủ để thanh toán');
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

        // req.flash('success_msg', 'Đặt hàng thành công. Đơn hàng đang chờ xác nhận từ admin.');
        // res.redirect('/orders');
        res.send('Đặt hàng thành công. Đơn hàng đang chờ xác nhận từ admin.');
    } catch (err) {
        console.error('Error in postCheckout:', err);
        // req.flash('error_msg', 'Đã xảy ra lỗi khi thanh toán');
        // res.redirect('/cart');
        res.send('Đã xảy ra lỗi khi thanh toán');
    }
};