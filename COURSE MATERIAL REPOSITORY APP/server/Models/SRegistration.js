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
     email: {
        type: String,
        required: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],        
        lowercase: true,
    },

    units: {
        type: [{ type:String}]
    },
})

const SRegistration = mongoose.model('sRegistration', userSchema)
module.exports = SRegistration;