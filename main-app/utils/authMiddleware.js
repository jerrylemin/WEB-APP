// utils/authMiddleware.js

module.exports = {
    ensureAuthenticated: (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash('error_msg', 'Vui lòng đăng nhập để tiếp tục');
        res.redirect('/login');
    },
    isAdmin: (req, res, next) => {
        if (req.user && req.user.isAdmin) {
            return next();
        }
        req.flash('error_msg', 'Bạn không có quyền truy cập vào trang này');
        res.redirect('/');
    }
};
