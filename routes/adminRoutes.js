const express = require('express')
const adminRoutes = express()


// Admin Session //
const config = require('../configuration/configuration');
const session = require('express-session');
const auth = require('../middleware/adminAuth');
const adminController = require('../Controllers/admincontroller');
const categorycontroller = require('../Controllers/categorycontroller');
const prductController = require('../Controllers/productController');
const orderController = require('../Controllers/orderController')
const couponontroller = require('../Controllers/couponController')
const bannerController = require('../Controllers/bannerController');
const upload = require('../configuration/multerConfig');

adminRoutes.use(session({
    secret:config.sessionSecret,
    resave:false,
    saveUninitialized:true,
}));



adminRoutes.set('view engine','ejs')
adminRoutes.set('views','./views/admin')




//----------------- ADMIN ROUTES ----------------------//
adminRoutes.get('/',auth.isLogout,adminController.loadLogin)
adminRoutes.post('/loginAdmin',adminController.verifyLogin)
adminRoutes.get('/userlist',auth.isLogin,adminController.loaduserlist)
adminRoutes.get('/dashboard',auth.isLogin,adminController.loadDashboard)
adminRoutes.get('/logout',adminController.adminLogout)
adminRoutes.get('/block',auth.isLogin,adminController.block)
adminRoutes.get('/unblock',auth.isLogin,adminController.unblock)
adminRoutes.get('/saleReportPage',auth.isLogin,adminController.loadSalesReport)
adminRoutes.get('/saleSortPage/:id',auth.isLogin,adminController.saleSort)
adminRoutes.post('/range-sort',adminController.rangeSort);


//----------------- CATEGORY ROUTES ----------------------//
adminRoutes.get('/categoryList',auth.isLogin,categorycontroller.loadCategory)
adminRoutes.post('/insert-category',categorycontroller.insertCategory)
adminRoutes.get('/deleteCategory',categorycontroller.deleteCategory)
adminRoutes.post('/editcategory',categorycontroller.updateCategory)

//----------------- PRODUCT ROUTES ----------------------//
adminRoutes.get('/productList',auth.isLogin,prductController.loadProduct)
adminRoutes.get('/addProduct',auth.isLogin,upload.upload.array('image',10),prductController.loadAddproduct)
adminRoutes.post('/addProduct',upload.upload.array('image',10),prductController.insertProduct)
adminRoutes.get('/editproduct/:id',auth.isLogin,prductController.loadEditProduct);
adminRoutes.post('/updateproduct/:id',prductController.updateProduct)
adminRoutes.get('/deleteProduct',auth.isLogin,prductController.deleteproduct)
adminRoutes.get("/deleteimg/:imageid/:productid", auth.isLogin, prductController.deleteimage);
adminRoutes.post('/updateimage/:id', upload.upload.array('image', 10), prductController.updateImage);


//----------------- ORDER ROUTES ----------------------//
adminRoutes.get("/adminOrderShow",auth.isLogin,orderController.adminOrderShowProfile)
adminRoutes.get('/singleorder/:id',auth.isLogin,orderController.adminSingleOrderShow)
adminRoutes.post("/updateStatus",orderController.changeStatus)


// ---------------- COUPON & OFFER ROUTES --------------------//
adminRoutes.get('/couponLoad',auth.isLogin,couponontroller.loadCoupon)
adminRoutes.post('/addCoupon',couponontroller.addCoupon)
adminRoutes.post('/deleteCoupon',couponontroller.deleteCoupon)
adminRoutes.post('/editCoupon/:id',couponontroller.editCoupon)
adminRoutes.post("/addOffer",couponontroller.addOffer)


// ---------------- BANNER ROUTES --------------------//
adminRoutes.get('/bannerLoad',auth.isLogin,bannerController.loadBanner)
adminRoutes.post("/addbanner",upload.upload.single('image'),bannerController.addBanner)
adminRoutes.post('/bannerEdit',upload.upload.single('image'),bannerController.editBanner)
adminRoutes.post("/deleteBanner",bannerController.deleteBanner) 

module.exports = adminRoutes