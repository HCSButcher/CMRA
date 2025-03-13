const mongoose= require ('mongoose')
 const Schema = mongoose.Schema;
 const userSchema = new Schema ({
    unit: {
        type: String,
        required: false,
    },

    announcements :{
        type: String,
        
    },
   
    date: {
        type: Date,
        default: Date.now
    },
 });

 const Announcement = mongoose.model('announcement', userSchema);
 module.exports = Announcement;