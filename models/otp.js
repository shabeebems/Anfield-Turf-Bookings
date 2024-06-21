const mongoose = require('mongoose');

const otpSchema = mongoose.Schema({
    email: {
        type: String,
    },
    otp: {
        type: String,
    },
    createdAt: {  
        type: Date, 
        default: Date.now,
    },
    

});

otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 });
module.exports=mongoose.model('otp',otpSchema)