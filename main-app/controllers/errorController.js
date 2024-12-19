// controllers/errorController.js

exports.get404 = (req, res) => {
    res.status(404).render('404', { pageTitle: 'Trang không tồn tại', layout: false });
};

exports.get500 = (req, res) => {
    res.status(500).render('500', { pageTitle: 'Lỗi server', layout: false });
};
