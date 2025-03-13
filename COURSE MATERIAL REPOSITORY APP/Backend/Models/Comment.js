const mongoose= require ('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema ({
    unit:{
        type: String,
    },
    comments: {
        type: String
    }
})

const Comment = mongoose.model('comment', userSchema);
module.exports = Comment;