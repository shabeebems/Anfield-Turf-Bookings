const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({

    code: { 
        type:String,
        trim:true,
        required: true
    },
    name: {
        type:String,
        trim:true,
        required: true
    },
    description: {
        type:String,
        required: true
    },
    percentage: {
        type:Number,
        required: true
    },
    minAmount: {
        type:Number,
        required: true
    },
    maxAmount: {
        type:Number,
        required: true
    },
    expiredAt: {
        type:Date,
        required: true
    },
    status: {
        type:String,
        enum : ['Valid', 'Expired'],
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }]
})

module.exports=mongoose.model('coupon',couponSchema)