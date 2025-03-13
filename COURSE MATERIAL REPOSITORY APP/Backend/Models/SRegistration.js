const mongoose = require ('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    stage: {
        type: String,
    }, 
    sDate: {
        type : Date,
    },
    unitsTaken: {
        type: Number,
    },

    units: {
        type: [{ type:String}]
    },
})

const SRegistration = mongoose.model('sRegistration', userSchema)
module.exports = SRegistration;