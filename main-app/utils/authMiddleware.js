// utils/authMiddleware.js

// Middleware kiểm tra xem người dùng đã đăng nhập chưa

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        console.log('User is authenticated');
        return next();
    }
    console.log('User is not authenticated');
    req.flash('error_msg', 'Vui lòng đăng nhập để truy cập trang này');
    res.redirect('/login');
}

function isAdmin(req, res, next) {
    if (req.user && req.user.isAdmin) {
        console.log('User is admin');
        return next();
    }
    console.log('User is not admin');
    req.flash('error_msg', 'Bạn không có quyền truy cập trang này');
    res.redirect('/');
}

module.exports = {
    ensureAuthenticated,
    isAdmin
};
