const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
  
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'users'
    },
    turfs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'turf'
    }]
})

module.exports = mongoose.model('wishlist',orderSchema)
