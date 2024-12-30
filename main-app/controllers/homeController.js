// controllers/homeController.js

exports.renderHome = (req, res) => {
    const message = req.query.message;

    res.render('home', { title: 'Trang Chủ', message }); // Thêm 'title' vào render
};
