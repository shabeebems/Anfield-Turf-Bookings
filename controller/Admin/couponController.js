const basePath = '../../'
const couponSchema = require(basePath + 'models/coupon')
const today = new Date().toISOString().split('T')[0];

const couponPage = async (req,res) => {
    try {
        await couponSchema.updateMany({ expiredAt: { $lte: today } }, { status: 'Expired' })
        await couponSchema.updateMany({ expiredAt: { $gt: today } }, { status: 'Valid' })
        const coupons = await couponSchema.find({})
        res.render('coupon', { coupons })
    } catch (error) {
        console.log(error.message)
    }
}

const addCoupon = async (req,res) => {
    try {
        res.render('addCoupon')
    } catch (error) {
        console.log(error.message)
    }
}

const couponCheck = async (req,res) => {
    try {
        const data = req.query
        const check = await couponSchema.find({ name: data.name })
        if(data.name.length < 3 || data.name.length > 21) {
            message = 'Name must between 3 to 20'
            res.send({ message })
        } else if(data.percentage < 1 || data.percentage > 91) {
            message = 'percentage must between 1 to 90'
            res.send({ message })
        } else if(check.length > 0) {
            message = 'Coupon name already added'
            res.send({ message })
        } else if(data.expiredAt <= today) {
            message = 'Enter valid date'
            res.send({ message })
        } else if(data.minAmount < 500 || data.minAmount > 1200) {
            message = 'Minimum amount must between 500 t0 1200'
            res.send({ message })
        } else if(data.maxAmount > 3000 || data.maxAmount < 800) {
            message = 'Maximum amount must between 800 to 3000'
            res.send({ message })
        } else {
            res.send({ data, success: true })
        }
    } catch (error) {
        console.log(error.message)
    }
}


const couponSuccess = async (req,res) => {
    try {
        // ------ Convert query json to object -------
        const data = JSON.parse(req.query.data)
        // ---- Pick a random number to coupon code ----
        const code = Math.floor(Math.random() * 9000) + 1000
        data.code = data.name + code
        data.users = []
        await couponSchema.insertMany(data)
        res.redirect('/admin-couponPage')

    } catch (error) {
        console.log(error.message)
    }
}

const editCoupon = async (req,res) => {
    try {
        const coupon = await couponSchema.findOne({ _id: req.query.id })
        const expireDate = coupon.expiredAt.toISOString().slice(0,10)
        res.render('editCoupon', { coupon, expireDate })
    } catch (error) {
        console.log(error.message)
    }
}

const editCouponCheck = async (req,res) => {
    try {
        let data = req.query
        // data.status = 'Valid'
        const check = await couponSchema.find({ name: { $regex: new RegExp('^' + data.name + '$', 'i') }, _id: {$ne: data._id } })
        if(data.name.length < 3 || data.name.length > 21) {
            message = 'Name must between 3 to 20'
            res.send({ message })
        } else if(data.percentage < 1 || data.percentage > 91) {
            message = 'percentage must between 1 to 90'
            res.send({ message })
        } else if(check.length > 0) {
            message = 'Coupon name already added'
            res.send({ message })
        } else if(data.expiredAt < today) {
            message = 'Enter valid date'
            res.send({ message })
        } else if(data.minAmount < 500 || data.minAmount > 1200) {
            message = 'Minimum amount must between 500 t0 1200'
            res.send({ message })
        } else if(data.maxAmount > 3000 || data.maxAmount < 800) {
            message = 'Maximum amount must between 800 to 3000'
            res.send({ message })
        } else {
            res.send({ data, success: true })
        }    
        console.log('lk')
    } catch (error) {
        console.log(error.message)
    }

}

const editCouponSuccess = async (req,res) => {
    try {
        const data = JSON.parse(req.query.data)
        console.log('12qw3ewq',data)
        let a = await couponSchema.findOneAndUpdate({ _id: data._id }, data)
        res.redirect('/admin-couponPage')
    } catch (error) {
        console.log(error.message)
    }
}


module.exports = {
    couponPage,
    couponCheck,
    couponSuccess,
    addCoupon,
    editCoupon,
    editCouponCheck,
    editCouponSuccess
}