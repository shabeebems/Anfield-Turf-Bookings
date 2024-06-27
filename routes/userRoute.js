const express = require('express')
const path = require('path')
const user_route = express()
const auth = require('../middleware/userAuth')

// ------- Passport starts ---------
const passport = require('passport')
require('../utils/passport')
user_route.use(passport.initialize())
user_route.use(passport.session())

const googleAuthController = require('../controller/User/googleAuthController')

user_route.get('/auth/google', 
    passport.authenticate('google', {
        scope: ['email', 'profile']
}))

user_route.get('/auth/google/callback', 
    passport.authenticate('google', {
        successRedirect: '/success',
        failureRedirect: '/failure'
}))

user_route.get('/success', googleAuthController.successGoogleLogin)
user_route.get('/failure', googleAuthController.failureGoogleLogin)

// ------- Passport Ends ---------


const userControler = require('../controller/User/userControler')
const userPageControler = require('../controller/User/userPageControler')
const profileControler = require('../controller/User/profileController')
const bookingControler = require('../controller/User/bookingController')
const wishlistController = require('../controller/User/wishlistController')



user_route.use(express.static(path.join(__dirname,'../public/user')))


user_route.use(express.json())
user_route.use(express.urlencoded({extended:true}))

user_route.set("view engine",'ejs');
user_route.set('views','./views/users');

user_route.get('/signup',auth.isLogout,userControler.signup)
user_route.get('/check-refferal',auth.isLogout,userControler.refferalCodeCheck)
user_route.get('/signup-check',auth.isLogout,userControler.signupCheck)
user_route.get('/otpSend',auth.isLogout,userControler.otpSend)
user_route.get('/check-otp',auth.isLogout,userControler.checkOtp)
user_route.get('/resend',auth.isLogout,userControler.resendOtp)

user_route.get('/',auth.isLogout,userControler.login)
user_route.get('/logout',auth.isLogin,userControler.logout)
user_route.get('/login-check',auth.isLogout,userControler.loginCheck)
user_route.get('/forget-password',auth.isLogout,userControler.forgetPassword)
user_route.get('/check-forget',auth.isLogout,userControler.checkForget)


// ------ User-page ------
user_route.get('/home',auth.isLogin,userPageControler.home)
user_route.get('/turfs',auth.isLogin,userPageControler.listTurf)
user_route.get('/turf-details',auth.isLogin,userPageControler.turfDetails)
user_route.get('/search-location',auth.isLogin,userPageControler.searchLocation)


// ----- Booking ------
user_route.post('/slot-selection',auth.isLogin,bookingControler.slotSelection)
user_route.get('/check-bookings',auth.isLogin,bookingControler.checkBookings)
user_route.get('/check-payment',auth.isLogin,bookingControler.checkPayment)
user_route.get('/coupon-check',auth.isLogin,bookingControler.couponCheck)
user_route.get('/payment-success',auth.isLogin,bookingControler.paymentSuccess)
user_route.get('/cancel-bookings',auth.isLogin,bookingControler.cancelBookings)
user_route.get('/confirm-booking',auth.isLogin,bookingControler.confirmBooking)


// ------ Profile --------
user_route.get('/my-accounts',auth.isLogin,profileControler.myAccounts)
user_route.get('/edit-profile',auth.isLogin,profileControler.editProfile)
user_route.get('/invoice-check',auth.isLogin,profileControler.invoiceCheck)
user_route.get('/invoice',auth.isLogin,profileControler.invoice)
user_route.get('/continue-payment',auth.isLogin,profileControler.continuePayment)




// ------ Wishlist -------
user_route.get('/add-wishlist',auth.isLogin,wishlistController.addWishlist)

module.exports = user_route




