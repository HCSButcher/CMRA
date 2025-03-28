const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema ({
stage: {
    type: String,
},
regDate: {
    type: Date,
    },
    email: {
        type: String,
        required: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],        
        lowercase: true,
    },

schoolUnits: [{
    school: String,
    units: Number,
}],
});

const CourseRegistration = mongoose.model('courseRegistration', userSchema);
module.exports = CourseRegistration;