// middleware/adminMiddleware.js

module.exports = {
    ensureAdmin: (req, res, next) => {
        if (req.isAuthenticated() && req.user.isAdmin) {
            return next();
        }
        req.flash('error_msg', 'Bạn không có quyền truy cập vào trang này');
        res.redirect('/');
    }
};
