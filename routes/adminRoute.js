const express = require('express')
const admin_route = express()


const bodyParser = require('body-parser');
admin_route.use(bodyParser.json());


const adminControler = require('../controller/Admin/adminControler')
const dashboardController = require('../controller/Admin/dashboardController')
const userManagementController = require('../controller/Admin/userManagement')
const categoryManagementController = require('../controller/Admin/categoryManagement')
const turfManagementController = require('../controller/Admin/turfManagement')
const offerController = require('../controller/Admin/offerController')
const couponController = require('../controller/Admin/couponController')
const reportManagement = require('../controller/Admin/reportManagement')
const orderController = require('../controller/Admin/orderController')



const path = require('path')
const multer = require('../middleware/multer')
const auth = require('../middleware/adminAuth')


admin_route.use(express.static(path.join(__dirname,'../public/admin')))


admin_route.use(express.json())
admin_route.use(express.urlencoded({extended:true}))

admin_route.set("view engine",'ejs');
admin_route.set('views','./views/admin');

// ------- Admin page --------
admin_route.get('/admin',auth.isLogout,adminControler.login)
admin_route.get('/admin-login-check',adminControler.loginCheck)
admin_route.get('/admin-logout',adminControler.logout)


// ------- Dashboard management --------
admin_route.get('/admin-home',auth.isLogin,dashboardController.dashboard)
admin_route.get('/data',auth.isLogin,dashboardController.data)


// ------- User management ---------
admin_route.get('/admin-users-list',auth.isLogin,userManagementController.userList)
admin_route.get('/admin-block-user',auth.isLogin,userManagementController.blockUser)
admin_route.get('/admin-add-user',auth.isLogin,userManagementController.addUsers)
admin_route.post('/admin-add-user',auth.isLogin,userManagementController.addingUser)

// ------- Category management ---------
admin_route.get('/admin-category',auth.isLogin,categoryManagementController.category)
admin_route.get('/admin-add-category',auth.isLogin,categoryManagementController.addCategory)
admin_route.post('/admin-insert-category',categoryManagementController.insertCategory)
admin_route.get('/admin-block-category',auth.isLogin,categoryManagementController.blockCategory)
admin_route.get('/admin-filter-category',auth.isLogin,categoryManagementController.filterTurfCategory)
admin_route.get('/admin-edit-category',auth.isLogin,categoryManagementController.editCategory)
admin_route.get('/admin-updating-category',categoryManagementController.updatingCategory)

// --------- Turf management ---------
admin_route.get('/admin-turf',auth.isLogin,turfManagementController.turf)
admin_route.get('/admin-add-turf',auth.isLogin,turfManagementController.addTurf)
admin_route.get('/admin-add-turfTime',auth.isLogin,turfManagementController.addTime)
admin_route.post('/saveTimeSlots',auth.isLogin,turfManagementController.saveTimeSlots)
admin_route.post('/admin-insert-turf',multer.array('image', 3),turfManagementController.insertTurf)
admin_route.get('/admin-block-turf',auth.isLogin,turfManagementController.blockTurf)
admin_route.get('/admin-edit-turf',auth.isLogin,turfManagementController.editTurf)
admin_route.post('/admin-updating-turf',multer.array('image', 3),turfManagementController.updatingTurf)
admin_route.get('/admin-bookings',auth.isLogin,turfManagementController.bookings)


// --------- Offer management ---------
// admin_route.get('/admin-turf-offer',auth.isLogin,offerController.turfOfferpage)
// admin_route.get('/admin-check-turfOffer-details',auth.isLogin,offerController.checkTurfOffer)
// admin_route.get('/admin-TurfOffer-checkSuccess',auth.isLogin,offerController.turfOfferSuccess)
// admin_route.get('/admin-categoryOffer',auth.isLogin,offerController.categoryOfferPage)
// admin_route.get('/adminCategory-offer-check',auth.isLogin,offerController.categoryOfferCheck)
// admin_route.get('/admin-category-offerCheck-success',auth.isLogin,offerController.categoryOfferSuccess)
admin_route.get('/admin-offerPage',auth.isLogin,offerController.offerpage)
admin_route.get('/admin-addOffer-page',auth.isLogin,offerController.addOfferpage)
admin_route.get('/admin-checkOffer',auth.isLogin,offerController.checkOffer)
admin_route.get('/admin-offer-checkSuccess',auth.isLogin,offerController.checkOfferSuccess)
admin_route.get('/admin-editOfferPage',auth.isLogin,offerController.offerEditPage)
admin_route.get('/admin-editOffer-check',auth.isLogin,offerController.offerEditCheck)
admin_route.get('/admin-offer-editCheckSuccess',auth.isLogin,offerController.offerEditCheckSuccess)





// --------- Coupon management ---------
admin_route.get('/admin-couponPage', auth.isLogin, couponController.couponPage)
admin_route.get('/admin-couponAddPage', auth.isLogin, couponController.addCoupon)
admin_route.get('/admin-couponCheck', auth.isLogin, couponController.couponCheck)
admin_route.get('/admin-couponSuccess', auth.isLogin, couponController.couponSuccess)
admin_route.get('/admin-editCoupon', auth.isLogin, couponController.editCoupon)
admin_route.get('/admin-couponEditCheck', auth.isLogin, couponController.editCouponCheck)
admin_route.get('/admin-couponEditSuccess', auth.isLogin, couponController.editCouponSuccess)


// ------ Reports -------
admin_route.get('/admin-reportPage', auth.isLogin, reportManagement.reportPage)
admin_route.get('/admin-check-report', auth.isLogin, reportManagement.checkReport)
admin_route.get('/admin-report-download', auth.isLogin, reportManagement.reportDownload)
admin_route.get('/admin-pdfDownload', auth.isLogin, reportManagement.pdfDownload)

// ------ Orders -------
admin_route.get('/admin-orderPage', auth.isLogin, orderController.orderPage)




module.exports = admin_route

