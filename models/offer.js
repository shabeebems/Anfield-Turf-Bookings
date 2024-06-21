const mongoose = require('mongoose')

const offerSchema = new mongoose.Schema({
    
    name: {
        type:String,
        trim:true,
        required: true
    },
    percentage: {
        type:String,
        required: true
    },
    type: {
        type:String,
        required: true
    },
    typeId: {
        type:String,
        required: true
    },
    typeName: {
        type:String,
        required: true
    },
    expiredAt: {
        type:Date,
        required: true
    },
    status: {
        type:String,
        enum : ['Valid', 'Expired'],
    }

})

module.exports = mongoose.model('offer', offerSchema)