const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
  
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'users'
    },
    cancelledOrders: [{
        cancelledDate:{
            type: String
        },
        name:{
            type: String
        },
        amount:{
            type: String
        }
    }],
    amount: {
        type:Number
    }

})

module.exports = mongoose.model('wallet',orderSchema)
