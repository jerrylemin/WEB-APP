// controllers/homeController.js

exports.renderHome = (req, res) => {
    res.render('home', { title: 'Trang Chủ' }); // Thêm 'title' vào render
};
