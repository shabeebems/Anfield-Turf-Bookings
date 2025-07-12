const mongoose = require('mongoose');

const turfSchema = mongoose.Schema({
    name: {
        type: String
    },
    location: {
        type: String
    },
    city: {
        type: String
    },
    court:{
        type:String
    },
    image: {
        type: Array
    },
    block:{
        type:Boolean
    },
    time:[{
        startingTime:{
            type:String
        },
        endingTime:{
            type:String
        },
        cash:{
            type:String
        },
        enable:{
            type:Boolean
        }
    }]
    
});

turfSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 });
module.exports=mongoose.model('turf',turfSchema)

