const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
  
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'users'
    },
    turfDetails : [{
        slotBookDate : {
            type:String,
            required: true
        },
        turfId: {
            type: String
        },
        name:{
            type:String
        },
        court:{
            type:String
        },
        startingTime:{
            type:String
        },
        endingTime:{
            type:String
        },
        cash:{
            type:Number
        },
        location:{
            type:String
        },
        city:{
            type:String
        },
        paymentMethod : {
            type:String,
            required: true
        },
        offer : {
            type:Number,
        },
        couponDiscount: {
            type:Number,
        },
        couponCode: {
            type:String
        },
        status : {
            type:String,
            enum : ['Success', 'Canceled', 'Failed'],
            required: true
        },
        orderedDate : {
            type:String,
        }
    }]
})

module.exports = mongoose.model('order',orderSchema)
