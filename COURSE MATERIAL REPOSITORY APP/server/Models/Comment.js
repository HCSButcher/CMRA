const mongoose= require ('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema ({
    unit:{
        type: String,
    },
    comments: {
        type: String
    },
     email: {
        type: String,
        required: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],        
        lowercase: true,
    },
})

const Comment = mongoose.model('comment', userSchema);
module.exports = Comment;