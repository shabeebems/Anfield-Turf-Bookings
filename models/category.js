const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
  
        name: {
            type:String,
            required: true
        },
        block: {
            type:Boolean,
            required: true
        },
        childTurfs: []

})
module.exports = mongoose.model('category',categorySchema)
