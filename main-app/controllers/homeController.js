// controllers/homeController.js

exports.renderHome = (req, res) => {
    res.render('home', { user: req.user });
};
