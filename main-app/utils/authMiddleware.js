// utils/authMiddleware.js

module.exports = {
    ensureAuthenticated: function (req, res, next) {
        if (req.isAuthenticated()) return next();
        req.flash('error_msg', 'Vui lòng đăng nhập để truy cập');
        res.redirect('/login');
    },
    forwardAuthenticated: function (req, res, next) {
        if (!req.isAuthenticated()) return next();
        res.redirect('/dashboard');
    },
    isAdmin: function (req, res, next) {
        if (req.isAuthenticated() && req.user.role === 'admin') return next();
        req.flash('error_msg', 'Bạn không có quyền truy cập trang này');
        res.redirect('/');
    }
};
