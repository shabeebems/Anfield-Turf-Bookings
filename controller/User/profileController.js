const basePath = '../../'
const turfSchema = require (basePath + 'models/turfs')
const userSchema = require (basePath + 'models/user')
const orderSchema = require (basePath + 'models/order')
const wishlistSchema = require (basePath + 'models/wishlist')
const walletSchema = require(basePath + 'models/wallet')
const couponSchema = require(basePath + 'models/coupon')
const easyinvoice = require('easyinvoice')



const bcrypt = require ('bcrypt')
const { trusted } = require ('mongoose')
const hashPass = async (password) => {
    const hashed = await bcrypt.hash (password, 10)
    console.log ('Password bcrypted')
    return hashed
}


const myAccounts = async (req, res) => {
    try {
        const member = req.session.user

        // ----- Getting current time -----
        const options = { hour12: false, hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' };
        const currentTime = new Date().toLocaleTimeString('en-IN', options);

        // ----- Getting current day -----
        const today = new Date().toISOString().split('T')[0];

        // ----- Storing session to data -----
        const data = req.session.user
        // ----- Finding logged user -----
        const user = await userSchema.findOne({ email: data.email })
        // ------ Finding orders(with userId) on orderSchema ------
        const Bookings = await orderSchema.findOne({ userId: data._id })

        // ------ Finding wishlist with logger user Id ------
        const wishlist = await wishlistSchema.findOne({ userId: member._id }).populate('turfs')
        
        // ------ Finding Wallet with logger user Id ------
        const wallet = await walletSchema.findOne({ userId: member._id })
        
        const coupon = await couponSchema.find({ users: { $nin: [member._id] }, expiredAt: { $gt: today } })

        if (Bookings) {
            // ---- Store booked turf details and sort with booked date ----
            const orders = Bookings.turfDetails
            const order = orders.sort((a, b) => new Date(b.slotBookDate) - new Date(a.slotBookDate));
            // const order = orders.sort((a,b)=>b.date-a.date)
            // ----- Sending userdetails and booking details ------
            res.render('my-account', { user, order ,currentTime, today, wishlist, wallet, coupon })
        } else {
            // ----- Sending userdetails (user with no bookings) ------
            res.render('my-account', { user, wishlist, wallet, coupon })
        }
    } catch (error) {
        console.log(error.message)
    }
}

const invoiceCheck = async (req, res) => {
    try {
        res.send({ message: 'Ok' })
    } catch (error) {
        console.log(error.message)
    }
}

const invoice = async (req, res) => {
    try {
        // ---- Took logged user details from session ----
        const user = req.session.user
        // ---- Took order from query ----
        const order = JSON.parse(req.query.order)
        
        // ---- Import the library into your project
        var data = {
            apiKey: "free",
            mode: "development",
            images: {
                logo: "https://public.budgetinvoice.com/img/logo_en_original.png",
            },
            // Your own data
            sender: {
                company: "Anfield Turf Bookings",
                address: "Kerala",
                zip: "1234 AB",
                city: "Calicut",
                country: "India"
            },
            // Your recipient
            client: {
                company: user.name,
                address: user.email,
                zip: user.username,
                city: user.address,
            },
            information: {
                // Invoice number
                number: order.startingTime,
                // Invoice data
                date: order.orderedDate,
                // Invoice due date
                dueDate: order.slotBookDate,
            },
            products: [
                {
                    // quantity: 33,
                    description: order.name,
                    // taxRate: 2,
                    price: order.cash
                }
            ],
            // Settings to customize your invoice
            settings: {
                currency: "USD", // See documentation 'Locales and Currency' for more info. Leave empty for no currency.
            },
            // Translate your invoice to your preferred language
            translate: {
                number: "Time",
                dueDate: "Slot booked date",
                products: "Turf",
                quantity: "Slots"
            },
        };

        const results = easyinvoice.createInvoice(data, function (result) {
            const pdfBuffer = Buffer.from(result.pdf, 'base64');
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');
            res.send(pdfBuffer);
        })

    } catch (error) {
        console.log(error.message)
    }
}


const editProfile = async (req, res) => {
    try {
        // ----- Storing query(user entered details for editing) to query variable -----
        const query = req.query
        const data = req.session.user
        // ----- Checking user entered is username already existing -----
        const username = await userSchema.findOne({ username: query.username })
        // ----- Checking is username already exist (username._id and logged user id are same) -----
        if (data._id==username?._id || !username) {
            if (!/^[A-Za-z ]+$/.test(req.query.name)) {
                const message = 'Enter valid name'
                res.json({ message })
            } else if (query.currentPass.length != 0 || query.newPass.length != 0 || query.confirmPass.length != 0) {
                // ---- Compare entered password and saved password ----
                const password = await bcrypt.compare(query.currentPass, data.password)
                // ------ If user entered password ------
                if (query.currentPass.length == 0 || query.newPass.length == 0 || query.confirmPass.length == 0) {
                    const message = 'Enter all password fields'
                    res.json({ message })
                } else if (query.newPass != query.confirmPass) {
                    const message = 'Confirm password is wrong'
                    res.json({ message })
                } else if(query.newPass == query.currentPass) {
                    const message = 'Old password and new password are same'
                    res.json({ message })
                } else if (password == false) {
                    const message = 'Current password is not correct'
                    res.json({ message })
                } else {
                    req.session.user = null
                    // ----- bcrypting new password -----
                    const bPass = await hashPass(query.newPass)
                    // ------ Updating new details -----
                    await userSchema.findOneAndUpdate({ email: data.email }, { $set: { username: query.username, address: query.address, name: query.name, password: bPass }})
                    console.log(req.session.user)
                    const message = 'Update details successfully'
                    res.json({ message })
                }
            } else {
                // ------ Updating new details -----
                await userSchema.findOneAndUpdate({ email: data.email },{ $set: { username: query.username, address: query.address, name: query.name }})
                const message = 'Update success'
                res.json({ message })
                console.log(req.session.user)
            }
            
        } else {
            const message = 'Username already exist'
            res.json({ message })
        }
        
        res.redirect('/my-accounts')
    } catch (error) {
        console.log(error.message)
    }
}

const continuePayment = async (req, res) => {
    try {
        const order = JSON.parse(req.query.order)
        const turf = await turfSchema.findOne({ _id: order.turfId })
        const time = {
            startingTime: order.startingTime,
            endingTime: order.endingTime,
            cash: order.cash + order.offer + order.couponDiscount
        }
        const date = order.slotBookDate
        const percentage = (order.offer / time.cash) * 100
        res.render('checkout', { turf, time, date, percentage })
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    myAccounts,
    editProfile,
    invoiceCheck,
    invoice,
    continuePayment
}
