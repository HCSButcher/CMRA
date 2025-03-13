const mongoose = require ('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema ({
    stage: {
        type: String,
    },
    units: {
        type: [{ type:String}]
    },

    school: {
        type: String,
    },

    courseName: {
        type : [{type: String}],
    },

})

const UnitStage = mongoose.model('unitStage', userSchema);
module.exports = UnitStage