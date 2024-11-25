// models/orderModel.js

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cart: {
        items: [
            {
                productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
                // Loại bỏ trường 'product' để tránh trùng lặp và nhầm lẫn
                name: { type: String, required: true },
                price: { type: Number, required: true },
                quantity: { type: Number, required: true }
            }
        ],
        totalPrice: { type: Number, required: true } // Tổng tiền của giỏ hàng
    },
    status: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
