const basePath = '../../'
const turfSchema = require (basePath + 'models/turfs')
const orderSchema = require (basePath + 'models/order')
const couponSchema = require(basePath + 'models/coupon')
const offerSchema = require(basePath + 'models/offer')
const walletSchema = require(basePath + 'models/wallet')

const dotenv = require('dotenv').config()

const { KeyId, KeySecret } = process.env

const Razorpay = require('razorpay');

var instance = new Razorpay({
  key_id: KeyId,
  key_secret: KeySecret,
});

const slotSelection = async (req, res) => {
    try {
        // ----- getting booking turf details -----
        const turf = await turfSchema.findOne({ _id: req.query._id })

        // ----- Checking valid category offer for this turf -----
        const offerCategory = await offerSchema.findOne({ typeName: turf.court, status: 'Valid' })
        // ----- Checking valid turf offer for this turf -----
        const offerTurf = await offerSchema.findOne({ typeId: turf._id, status: 'Valid' })
        
        // ---- Took a percentage, if category offer and turf offer, pick the greatest one ----
        let percentage = 0
        if(offerCategory && offerTurf) {
            percentage = offerCategory.percentage > offerTurf.percentage ? offerCategory.percentage : offerTurf.percentage
        } else if(offerCategory) {
            percentage = offerCategory.percentage
        } else if(offerTurf) {
            percentage = offerTurf.percentage
        }
        
        
        // ----- Getting current time -----
        const options = { hour12: false, hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' };
        const currentTime = new Date().toLocaleTimeString('en-IN', options);

        // ----- Getting current day -----
        const today = new Date().toISOString().split('T')[0];

        // ----- For storing showable starting times -----
        const startingTimes = []

        // ----- Slot booking date ------
        const currentDate = req.body.date


        // -------- sort starting time acending order --------
        turf.time.sort((a, b) => parseInt(a.startingTime) - parseInt(b.startingTime))
        
        // ----- Getting full starting times -----
        const fullStartingTimes = turf.time.map(time => time.startingTime)

        // ----- Loop for storing showables times -----
        for (let i = 0; i < fullStartingTimes.length; i++) {
            if ( today == currentDate ) {
                // ---- Checking fullStartingTimes are greater than current time ----
                let isCheckTimes = new Date(`1970-01-01T${fullStartingTimes[i]}`) > new Date(`1970-01-01T${currentTime}`);
                if ( isCheckTimes == true ) {
                    startingTimes.push(fullStartingTimes[i])
                }
            } else {
                startingTimes.push(fullStartingTimes[i])
            }
        }

        // ----- Finding all orders -----
        const orders = await orderSchema.find({})
        // ----- Check time is it booked or able to booking -----
        const checkTime = orders.flatMap(order => 
            order.turfDetails
                 .filter(detail => detail.slotBookDate === currentDate && detail.turfId === req.query._id && detail.status != 'Canceled' && detail.status != 'Failed')
                 .map(detail => detail.startingTime)
        );
        
        // ----- Dates for booking -----
        const dates = [0, 1, 2, 3, 4].map(day => new Date(Date.now() + day * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        // ---- Finding cities for searching ----
        const turfs = await turfSchema.find({ block: false })
        const city = await turfs.map((value) => value.city)
        const uniqueCity = await [...new Set(city)]
        res.render('slotBooking',{ uniqueCity, dates, turf, currentDate, checkTime, startingTimes, percentage })
    } catch (error) {
        console.log(error.message)
    }
}



const checkBookings = async(req, res) => {
    try {
        // ----- Covert JSON boject to object -----
        const time = JSON.parse(req.query.time);
        const bookingDate = req.query.date
        
        // ----- Finding all orders -----
        const orders = await orderSchema.find({})
        
        // ----- Check time is it booked or able to booking -----
        // ----- Double check -----
        const checkTime = orders.flatMap(order => 
            order.turfDetails
            .filter(detail => detail.slotBookDate === bookingDate && detail.turfId === req.query.id && detail.status !== 'Canceled' && detail.startingTime == time.startingTime && detail.status != 'Failed')
            // .map(detail => detail.startingTime)
        );

        // ------ Find turf based on selected time id -------
        const turf = await turfSchema.findOne({ "time._id": time._id })

        // ------ Picking date from query ( Booking date ) -------
        const date = req.query.date
        const percentage = req.query.percentage
        // ---- Checking others booked that slot ----
        if(checkTime.length != 0){
            console.log('U can,t book')
            res.send({ reject: true })
        }else{
            console.log('U can book')
            res.send({ success: true, time, turf, date, percentage})
        }
    } catch (error) {
        console.log(error.message)
    }
}

// ------ Render checkout page after user select a slot ------
const confirmBooking = async (req, res) => {
    try {
        // ---- Pick booking turf details ----
        const turfData = req.query.turf;
        // ---- Pick booking time details ----
        const timeData = req.query.time;
        // Parse the JSON data
        const turf = JSON.parse(turfData);
        const time = JSON.parse(timeData);
        const date = req.query.date
        const percentage = req.query.percentage

        res.render('checkout', { time, turf, date, percentage })       
        
    } catch (error) {
        console.log(error.message)
    }
}

const checkPayment = async (req, res) => {
    try {
        // ---- Pick user for adding into orderSchema ----
        const user = req.session.user
        // ----- Covert JSON oject to object -----
        const time = JSON.parse(req.query.time)
        // ----- Check time is it booked or able to booking -----
        const orders = await orderSchema.find({})
        // ----- Check time is it booked or able to booking -----
        // ----- Treble check -----
        const checkTime = orders.flatMap(order => 
            order.turfDetails
            .filter(detail => detail.slotBookDate === req.query.date && detail.turfId === req.query.turfId && detail.status !== 'Canceled' && detail.startingTime == time.startingTime && detail.status != 'Failed')
            // .map(detail => detail.startingTime)
        );
        const cash = req.query.totalVal
    
        if(checkTime.length === 0){
            // ------ Storing applied method -----
            const method = req.query.method
            if (method == 'offline') {
                if(cash > 1000){
                    res.send({ offlineLimit: true })
                } else {
                    res.send({ offline: true })
                }
            } else if (method == 'wallet') {
                const wallet = await walletSchema.findOne({ userId: user._id })
                if(wallet.amount < cash) {
                    res.send({ balance: true })
                }
                res.send({ offline: true })
            } else if (method == 'razopay') {
                // ----- Passing razorpay instance to frontend -----
                const options = {
                    amount : cash*100,
                    currency : 'INR',
                    receipt : 'muhammedshabeeb330@gmail.com'
                }
                instance.orders.create(options, 
                    (err, order)=>{
                        if(!err){
                            console.log('start')
                            res.send({
                                success: true,
                                msg: 'Order Created',
                                order_id: order.id,
                                amount: cash,
                                key_id: KeyId,
                                name: user.name,
                                email: "muhammedshabeeb330@gmail.com",
                            });
                            console.log('End')
                        }else{
                            console.log('error')
                            console.error("Error creating order:", err);
                            res.send({ success:false, msg:'Something went wrong!' });
                        }
                    }
                );

            }      
        } else {
        // ---- Checking others booked that slot ----
            res.send({ booked: true })
        }
    } catch (error) {
        console.log(error.message)
    }
}

const couponCheck = async (req,res) => {
    try {

        const user = req.session.user
        // ----- Pick user entered coupon code -----
        const inputCode = req.query.inputCode.trim()
        
        // ----- Finding all coupons codes to check input code -----
        const Coupons = await couponSchema.find()
        const couponCode = Coupons.map(code => code.code);

        // ----- Checking user entered coupon code -----
        if(inputCode.length == 0) {
            // ----- If user dont entered -----
            res.send({ message: 'Enter the code' })
        } else if(couponCode.includes(inputCode)) {
            const check = await couponSchema.findOne({ code: inputCode, users: user._id })
            if(!check) {
                // ----- If user entered code is correct -----
                // ----- Finding User entered coupon -----
                const code = await couponSchema.findOne({ code: inputCode })
                // ----- Took the coupon percentage -----
                const couponPercentage = code.percentage
                res.send({ success: true, couponPercentage, verified: 'Coupon applied' })
            } else {
                res.send({ message: 'Coupon already applied' })
            }
        } else {
            res.send({ message: 'Enter valid code' })
        }
        
    } catch (error) {
        console.log(error.message)
    }
}

const paymentSuccess = async (req, res) => {
    try {
        let status;
        if(req.query.error){
            status = 'Failed'
        } else {
            status = 'Success'
        }
        console.log('sss', req.query)
        // ----- Picking userId and coupon code for pushing id to coupon details -----
        const user = req.session.user
        const couponName = req.query.couponName
        if(couponName.length !== 0 && status !== 'Failed'){
            await couponSchema.findOneAndUpdate({ code: couponName }, { $push: { users: user._id } })
        }
        // ----- The last value of slot -----
        const totalVal = req.query.totalVal
        // ----- Covert JSON oject to object -----
        const time = JSON.parse(req.query.time)
        // ----- Find turf with turfId -----
        const turf = await turfSchema.findOne({ _id: req.query.turfId })
        const turfDetails = [{
            slotBookDate: req.query.date,
            turfId: turf._id,
            name: turf.name,
            court: turf.court,
            startingTime: time.startingTime,
            endingTime: time.endingTime,
            cash: totalVal,
            location: turf.location,
            city: turf.city,
            paymentMethod: req.query.method,
            offer: req.query.offer,
            couponDiscount: req.query.couponDiscount,
            couponCode: req.query.couponName,
            status: status,
            orderedDate: new Date().toISOString().slice(0,10)
        }]
        // ----- Data variable for pushing orderSchema -----
        const data = ({
            userId: req.session.user._id,
            turfDetails: turfDetails
        })
        // ------ Check user have any bookings -------
        const userCheck = await orderSchema.findOne({ userId: data.userId })
        if (userCheck) {
            // ----- Pushing turfDetails to orderSchema -----
            await orderSchema.findOneAndUpdate({ userId: data.userId },{ $push:{ turfDetails:turfDetails }})
        } else {
            // ----- Create new orderSchema document ------
            await orderSchema.insertMany(data)
        }

        if(req.query.method === 'wallet'){
            await walletSchema.findOneAndUpdate({ userId: user._id }, { $inc: { amount: -totalVal } } )
        }
        if(status == 'Failed'){
            res.render('paymentSuccess', { order: 'Failed' })
        } else {
            res.render('paymentSuccess', { order: 'success' })
        }
        
    } catch (error) {
        console.log(error.message)
    }
}

const cancelBookings = async (req, res) => {
    try {
        const user = req.session.user
        
        // ----- Change status to cancel on orderSchema -----
        const a = await orderSchema.findOneAndUpdate({ userId: user._id, "turfDetails._id": req.query.orderId }, { $set: { "turfDetails.$.status": "Canceled" } })
        // ----- Finding the cancelled order -----
        const data  = a.turfDetails.find((turf)=>{
            return turf._id.equals(req.query.orderId)
        })

        // ---- Check cancelled order is noequal to offline for adding to wallet
        if(data.paymentMethod !== 'offline') {
            
            // ----- Cheking is user have already a wallet ----- 
            const wallet = await walletSchema.findOne({ userId: user._id })
            // ---- data to push wallet ----
            const cancelledOrder = {
                name: `Booking cancelled ${data.name} ${data.court} turf`,
                amount: data.cash,
                cancelledDate: new Date().toISOString().slice(0,10)
            }
            // ----- If no wallet create wallet and if wallet push details -----
            if(!wallet){
                await walletSchema.insertMany({ userId: user._id, cancelledOrders: [cancelledOrder], amount: data.cash } )
            } else {
                await walletSchema.findOneAndUpdate({ userId: user._id }, { $push: { cancelledOrders: cancelledOrder }, $inc: {amount: data.cash} } )
            }
        } else {
            console.log('Keeroola')
        }
        // ---- Deleting coupons if user user on this bookings ----
        await couponSchema.findOneAndUpdate({ code: req.query.couponCode }, { $pull: { users: user._id } })

    } catch (error) {
        console.log(error.message)
    }
}


module.exports = {
    slotSelection,
    checkBookings,
    checkPayment,
    couponCheck,
    paymentSuccess,
    cancelBookings,
    confirmBooking,
}