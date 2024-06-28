const basePath = '../../'
const users = require(basePath + 'models/user')
const otpSchema = require(basePath + 'models/otp')
const walletSchema = require(basePath + 'models/wallet')

const sendOtp = require(basePath + 'utils/sendOtp')
const sendPassword = require(basePath + 'utils/forgetPassword')

const bcrypt = require('bcrypt')

const { trusted } = require('mongoose')

const hashPass = async (password) => {
    const hashed = await bcrypt.hash(password, 10)
    console.log('Password bcrypted')
    return hashed
}


// ------ signup ------
const signup = async (req, res) => {
    try {
        if (typeof(req.query.refferal) !==  'undefined') {
            req.session.refferal = req.query.refferal
        } else {
            req.session.refferal = undefined
        }
        res.render('register')

    } catch (error) {
        console.log(error)
    }
}

const refferalCodeCheck = async (req, res) => {
    try {
        const code = req.query.code
        const find = await users.findOne({ refferalCode: code })
        if(find){
            req.session.refferalCode = code
            res.send({ message: 'Refferal code applied' })
        } else if(code.length !== 8) {
            res.send({ message: 'Refferal code must 8 character' })
        } else {
            res.send({ message: 'Enter valid refferal code' })
        }
    } catch (error) {
        console.log(error)
    }
}


// ------- After signup --------
const signupCheck = async (req, res) => {
    try {
        const name = req.query.name.trim()
        const mobile = req.query.mobile.trim()
        const userName = req.query.username.trim()
        // ----- Checking new user entered Email and Username -----
        const email = await users.findOne({ email: req.query.email })
        const username = await users.findOne({ username: req.query.username })
        // ----- Password strong checking function -----
        function isStrongPassword(password) {
            const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
            return strongPasswordRegex.test(password);
        }
        if (email) {
            const message = 'Email already exist'
            res.json({ message })
        } else if (username) {
            const message = 'Username already exist'
            res.json({ message })
        } else if (userName.length < 6 || userName.length > 20) {
            const message = 'Enter username length btw 6 to 20'
            res.json({ message })
        } else if (!/[A-Za-z0-9.%]+@gmail.com/.test(req.query.email)) {
            const message = 'Enter valid email'
            res.json({ message })
        } else if (!/^[0-9]+$/.test(mobile) || mobile.length < 7 || mobile.length > 15) {
            const message = 'Enter valid mobile'
            res.json({ message })
        } else if (!/^[A-Za-z ]+$/.test(name) || name.length < 3 || name.length > 30) {
            const message = 'Enter valid name'
            res.json({ message })
        } else if(!isStrongPassword(req.query.password)){
            const message = 'Enter a strong password'
            res.json({ message })
        }
        else if (req.query.password != req.query.conformPassword) {
            const message = 'Conform password is not correct'
            res.json({ message })
        }else{
            // ------ bcrypte password ----=
            const password = await hashPass(req.query.password)
                const data = ({
                    name: req.query.name,
                    email: req.query.email,
                    mobile: req.query.mobile,
                    username: req.query.username,
                    password: password,
                    is_admin: 0,
                    block: false
                })
                // // ------ userData save to session ------
                req.session.data = data;
                emaile = req.query.email
                // --- Call sendOtp function ---
                sendOtp(emaile)
                res.json({success: true})
        }
        res.redirect('/signup')
    } catch (error) {
        console.log(error.messsage)
    }
}

// ------- After signup --------
const otpSend = async (req, res) => {
    try {
        res.render('otp')
    } catch (error) {
        console.log(error.message)
    }
}

// ----- Checking Otp -----
const checkOtp = async (req, res) => {
    try {
        // ----- userDetails session saving to data variable -----
        const data = req.session.data
        // ----- Creating a refferal code and saving to data -----
        const newRefferalCode = data.username.slice(0,4) + Math.floor(1000 + Math.random() * 9000)
        data.refferalCode = newRefferalCode
        // ----- Checking session email in otpSchema -----
        const email = await otpSchema.findOne({ email: data.email })
        // ----- Checking session email and entered Otp in otpSchema -----
        const find = await otpSchema.findOne({ $and: [{ otp: req.query.otp }, { email: data.email }]})
        // ---- After entering correct otp ----
        if (find) {
            
            // ------ Delete Otp at mongodb --------
            await otpSchema.deleteOne({ email: data.email })
            // ------ userData inserting to mongodb --------
            await users.insertMany(data)

            // ---- Checking refferals and add money to wallet
            const user = await users.findOne({ email: data.email })

            if (typeof(req.session.refferal) !==  'undefined' || typeof(req.session.refferalCode) !==  'undefined') {
                let cancelledOrder = {
                    name: `Refferal`,
                    amount: 21,
                    cancelledDate: new Date().toISOString().slice(0,10)
                }
                await walletSchema.insertMany({ userId: user._id, amount: 21, cancelledOrders: cancelledOrder })
                cancelledOrder.amount = 121
                if(typeof(req.session.refferalCode) !==  'undefined') {
                    const refferalCode = req.session.refferalCode
                    // ----- Find the refferal user with referal code -----
                    const findRefferal = await users.findOne({
                        refferalCode: refferalCode,
                        // refferalCode: { $exists: true} 
                    })
                    await walletSchema.findOneAndUpdate({ userId: findRefferal._id }, { $inc: { amount: 121 }, $push: { cancelledOrders: cancelledOrder } } )
                } else {
                    await walletSchema.findOneAndUpdate({ userId: req.session.refferal }, { $inc: { amount: 121 }, $push: { cancelledOrders: cancelledOrder } } )
                }
            } else {
                await walletSchema.insertMany({ userId: user._id, amount: 0 })
            }

            req.session.destroy()
            console.log('userData inserted to mongodb')
            res.json({ success: true })
        } else if (email) {
            const message = 'Incorrect otp'
            res.json({ message })
        } else {
            const message = 'time is over'
            res.json({ message })
        }
    } catch (error) {
        console.log(error.message)
    }
}

const resendOtp = async (req, res) => {
    try{
        // ----- Delete old otps -----
        await otpSchema.deleteMany({ email: req.query.email })
        const message = 'Otp resended'
        res.json({ message })
        // ----- Calling sendOtp function -----
        sendOtp(req.query.email)
        console.log('otp resended')
    }catch(error){
        console.log(error.message)
    }
}

const registrationSuccess = async(req, res) => {
    try {
        res.render('registrationSuccess')
    } catch (error) {
        console.log(reeor.message)
    }
}

// ------ Login page --------
const login = async (req, res) => {
    try{
        res.render('login')
    }catch(error){
        console.log(error)
    }
}



// ------- Check users after login --------
const loginCheck = async (req, res) => {
    try {
        // ----- Check is username correct -----
        const check = await users.findOne({ username: req.query.username })
        // ----- If username is true -----
        if (check) {
            // ------ compare bcrypted password and entered password ----
            const password = await bcrypt.compare(req.query.password, check.password)
            // ----- If password is true -----
            if (password == true) {
                if (check.block == false) {
                    let user = new users({
                        _id: check._id,
                        email: check.email,
                        name: check.name,
                        username: check.username,
                        address: check.address,
                        password: check.password
                    })
                    // ----- User details saving on session ----
                    req.session.user = user
                    console.log('user logged')
                    const success = 'Go to Home'
                    res.json({ success })
                } else {
                    const message = 'Your entry restricted'
                    res.json({ message })
                }
            } else {
                const message = 'Password is incorrect'
                res.json({ message })
            }
        } else {
            const message = 'User not found'
            res.json({ message })
        }
    } catch (error) {
        console.log(error.message)
    }
}

const logout = async (req, res) => {
    try {
        // ----- User details deleting on session ----
        req.session.user = null
        console.log('User logout successfully')
        res.redirect('/')
    } catch (error) {
        console.log(error.message)
    }
}


const forgetPassword = async (req, res) => {
    try{
        res.render('forget-Password')
    }catch(error){
        console.log(error)
    }
}

const checkForget = async (req, res) => {
    try {
        // ----- Check is user entered email -----
        const email = await users.findOne({ email: req.query.email })
        // ----- If entered email is on mongodb -----
        if (email) {
            // ------ Calling password sending email ------
            sendPassword(req.query.email, req.query.password)
            // ------ bcrypting password ------
            const password = await hashPass(req.query.password)
            console.log(req.query.password)
            // ------ Update password on mongoDb -------
            await users.findOneAndUpdate({ email: req.query.email }, { $set: { password: password }})
            const message = 'Password sended on your email account'
            res.json({ message })
        } else if (!/[A-Za-z0-9.%]+@gmail.com/.test(req.query.email)) {
            // ----- If email is not valid -----
            const message = 'Enter valid email'
            res.json({ message })
        } else {
            // ----- If email not existing in mongodb -----
            const message = 'Email not exist'
            res.json({ message })
        }
        
        res.redirect('/forget-password')
    } catch (error) {
        console.log(error.message)
    }
}


module.exports = {
    signup,
    refferalCodeCheck,
    signupCheck,
    otpSend,
    checkOtp,
    registrationSuccess,
    login,
    logout,
    forgetPassword,
    loginCheck,
    checkForget,
    resendOtp
}