// utils/notification.js

const nodemailer = require('nodemailer');
require('dotenv').config();

// Hàm gửi email thông báo đơn hàng đến admin
async function sendOrderConfirmationToAdmin(order) {
    try {
        // Cấu hình transporter cho Nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Thay bằng email của bạn
                pass: process.env.EMAIL_PASS  // Thay bằng mật khẩu email của bạn hoặc App Password
            }
        });

        // Cấu hình email
        const mailOptions = {
            from: 'no-reply@yourapp.com',
            to: process.env.ADMIN_EMAIL, // Thay bằng email admin
            subject: 'Đơn Hàng Mới Đã Được Tạo',
            html: `
                <h1>Đơn Hàng Mới</h1>
                <p>Mã Đơn Hàng: ${order._id}</p>
                <p>Người Đặt: ${order.user}</p>
                <p>Tổng Tiền: ${order.cart.totalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
                <p>Trạng Thái: ${order.status}</p>
                <a href="http://localhost:5000/admin/orders/${order._id}">Xem Chi Tiết Đơn Hàng</a>
            `
        };

        // Gửi email
        await transporter.sendMail(mailOptions);
        console.log('Email thông báo đơn hàng đã được gửi đến admin');
    } catch (err) {
        console.error('Error sending order confirmation email:', err);
    }
}

module.exports = {
    sendOrderConfirmationToAdmin
};
