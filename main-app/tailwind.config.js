/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/client/cart.ejs",
    "./views/client/orders.ejs",
    "./views/client/products.ejs",
    "./views/client/productDetails.ejs",
    "./views/client/profile.ejs",
    "./views/client/editProfile.ejs",
    "./views/admin/layouts/main.ejs",
    "./views/admin/addCategory.ejs",
    "./views/admin/editCategory.ejs",
    "./views/admin/products.ejs",
    "./views/admin/orders.ejs",
    "./views/admin/editProduct.ejs",
    "./views/admin/addProduct.ejs",
    "./views/admin/editUser.ejs",
    "./views/admin/users.ejs",
    "./views/admin/addPost.ejs",
    "./views/admin/editPost.ejs",
    "./views/admin/posts.ejs",
    "./views/admin/viewOrder.ejs",
    "./views/admin/categories.ejs",
    "./views/partials/footer.ejs",
    "./views/partials/header.ejs",
    "./views/404.ejs",
    "./views/500.ejs",
    "./views/forgotPassword.ejs",
    "./views/home.ejs",
    "./views/login.ejs",
    "./views/register.ejs",
    "./views/resetPassword.ejs",
    "./views/admin/layout.ejs",
    "./views/layout.ejs"
  ],
  theme: {
    extend: {
      colors: {
        'primaryGreen': '#518C27',
        'secondaryGreen': '#5C8C46',
        'tertiaryGreen': '#9ABF80',
        'darkGreen': '#012622',
        'yellow': '#F29F05',
        'red': '#F23A29',
        'cream': '#FFFDD0'
      },
      fontFamily: {
        title: ['Berkshire Swash', 'serif'],
        serif: ['Be Vietnam Pro', 'serif'],
      },
      borderRadius: {
        outer: '10px',
        inner: '8px'
      },
      fontSize: {
        fat: '6rem',
        biggest: '4rem',
        bigger: '3rem',
        big: '2rem',
        medium: '1rem'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}