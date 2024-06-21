const mongoose = require('mongoose')

const sSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
    },
    username:{
        type:String,
    },
    address:{
        type:String
    },
    password:{
        type:String,
    },
    is_admin:{
        type:Number,
    },
    block:{
        type:Number,
        require:true
    }
})

module.exports = mongoose.model('users',sSchema)