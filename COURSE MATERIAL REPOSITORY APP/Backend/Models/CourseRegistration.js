const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema ({
stage: {
    type: String,
},
regDate: {
    type: Date,
},
schoolUnits: [{
    school: String,
    units: Number,
}],
});

const CourseRegistration = mongoose.model('courseRegistration', userSchema);
module.exports = CourseRegistration;