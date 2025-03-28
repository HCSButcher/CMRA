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
      email: {
        type: String,
        required: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],        
        lowercase: true,
    },
   
    date: {
        type: Date,
        default: Date.now
    },
 });

 const Announcement = mongoose.model('announcement', userSchema);
 module.exports = Announcement;