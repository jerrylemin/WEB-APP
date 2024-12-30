// controllers/cartController.js

const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

// Thêm sản phẩm vào giỏ hàng
exports.addToCart = async (req, res) => {
    try {
        const productId = req.params.id;
        const quantity = 1;

        // Tìm sản phẩm trong cơ sở dữ liệu
        const product = await Product.findById(productId);
        if (!product) {
            res.status(500).json({ message: 'Sản phẩm không tồn tại' });
        }

        // Nếu chưa đăng nhập thì thao tác với cart trong session
        if(!req.isAuthenticated()) {
            if(!req.session.cart) {
                req.session.cart = { items: [], totalPrice: 0 };
            }
            const cart = req.session.cart;

            // Tìm xem sản phẩm đã có trong giỏ chưa
            const findRes = cart.items.findIndex((element) => {
                return element.product === productId;
            });

            // Nếu chưa có trong giỏ
            if(findRes === -1) {
                // Không thể thêm vì hết hàng
                if(product.stock === 0) {
                    return res.status(400).json({ message: "Số lượng sản phẩm vượt quá kho" });
                }
                // Nếu chưa hết hàng 
                cart.items.push({
                    product: productId,
                    quantity: 1
                });
            }
            // Nếu đã có trong giỏ
            else {
                // Không thể thêm vì hết hàng
                if(cart.items[findRes].quantity + 1 > product.stock) {
                    return res.status(400).json({ message: "Số lượng sản phẩm vượt quá kho" });
                }  
                cart.items[findRes].quantity += 1;
            }

            // Cập nhật lại tổng giá
            cart.totalPrice = cart.items.reduce((acc, item) => {
                return acc + product.price * item.quantity;
            }, 0);
        }
        // Nếu đã đăng nhập thì thao tác với cart trong cơ sở dữ liệu
        else {
            let cart = await Cart.findOne({ user: req.user._id });
            if (!cart) {
                cart = new Cart({ user: req.user._id, items: [], totalPrice: 0 });
                await cart.save();
            }

            // Tìm xem sản phẩm đã có trong giỏ chưa
            const existingItemIndex = cart.items.findIndex(item => item.product.toString() === productId.toString());

            // Nếu đã có
            if (existingItemIndex >= 0) {
                // Không thể thêm vì hết hàng
                if (cart.items[existingItemIndex].quantity + quantity > product.stock) {
                    return res.status(400).json({ message: "Số lượng sản phẩm vượt quá kho" });
                }
                // Còn hàng -> còn thêm được
                cart.items[existingItemIndex].quantity += quantity;
                await cart.save();
            // Nếu chưa có
            } else {
                // Nếu hết kho -> Không thêm được
                if(product.stock === 0) {
                    return res.status(400).json({ message: "Số lượng sản phẩm vượt quá kho" });
                }
                // Còn tồn kho -> Thêm được
                cart.items.push({
                    product: productId,
                    quantity: quantity
                });
                await cart.save();
                // Tính lại tổng tiền
                cart.totalPrice = cart.items.reduce((acc, item) => {
                    return acc + product.price * item.quantity;
                }, 0);
                await cart.save();
            }
        }

        res.status(200).json({ message: "Thêm vào giỏ hàng thành công!" });

    } catch (err) {
        console.error('Error in addToCart:', err);
        res.status(500).json({ message: "Đã xảy ra lỗi khi thêm sản phẩm vào giỏ hàng" });
    }
};

// Hiển thị giỏ hàng
exports.getCart = async (req, res) => {
    // Nếu chưa đăng nhập thì tìm kiếm giỏ hàng trong session
    if(!req.isAuthenticated()) {
        if(!req.session.cart) {
            req.session.cart = {
                items: [],
                totalPrice: 0
            }
        }
        req.session.cart.items = await Promise.all(req.session.cart.items.map(async item => {
            const product = await Product.findById(item.product).lean();
            // console.log({...item, productInfo: product});
            return { ...item, productInfo: product };
        }));
        return res.render('client/cart', { 
            user: null,
            cart: req.session.cart,
            title: 'Giỏ Hàng',
            message: null 
        });
    }
    // Khi đăng nhập rồi thì merge giỏ hàng trong session vào giỏ hàng trong tài khoản
    let cart = await Cart.findOne({ user: req.user._id });
    if(req.session.cart && req.session.cart.items.length > 0) {
        req.session.cart.items.forEach(item => {
            cart.items.push(item); // Lấy các item từ session
        });
        cart.totalPrice += req.session.cart.totalPrice;
        await cart.save(); 
        req.session.cart = {
            items: [],
            totalPrice: 0
        };
    }
    cart = await Cart.findById(cart._id).lean();
    cart.items = await Promise.all(cart.items.map(async item => {
        const product = await Product.findById(item.product).lean();
        // console.log({...item, productInfo: product})
        return {...item, productInfo: product};
    }));
    // console.log(cart.items.length);
    res.render('client/cart', { user: req.user, cart, title: 'Giỏ Hàng', message: req.query.message });
};

// Xóa sản phẩm khỏi giỏ hàng
exports.removeFromCart = async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    // Nếu chưa đăng nhập
    if(!req.isAuthenticated()) {
        // Nếu trong session tồn tại giỏ hàng -> Tìm sản phẩm để xóa
        if(req.session.cart) {
            const findIdx = req.session.cart.items.findIndex((item) => {
                return item.product === productId;
            });
            if(findIdx !== -1) {
                req.session.cart.totalPrice -= product.price * req.session.cart.items[findIdx].quantity;
                req.session.cart.items.splice(findIdx, 1);
                return res.status(200).json({
                    message: 'Xóa thành công'
                });
            }
            return res.status(404).json({
                message: 'Sản phẩm không tồn tại trong giỏ hàng'
            });
        }
        return res.status(200).json({ message: 'Giỏ hàng của bạn đang trống' });
    }
    // Nếu đã đăng nhập
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        return res.status(404).json({ message: "Không có gì để xóa" });
    }

    if (cart.items.length > 0) {
        cart.items = cart.items.filter(item => item.product.toString() !== productId.toString());
        
        // Tính lại tổng tiền
        cart.totalPrice = cart.items.reduce((acc, item) => acc + product.price * item.quantity, 0);
        await cart.save();
        res.status(200).json({ message: 'Xóa sản phẩm khỏi giỏ hàng thành công' });
    } else {
        res.status(200).json({ message: 'Giỏ hàng của bạn đang trống' });
    }
    
    res.status(200).end();
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