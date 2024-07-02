const mongoose = require('mongoose');

const slotSchema = mongoose.Schema({
  
        turfId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'turves'
        },
        extraSlots: [{
            date: {
                type: String
            },
            timeSlots: {
                type: Array
            }
        }]

})
module.exports = mongoose.model('extraSlot', slotSchema)
