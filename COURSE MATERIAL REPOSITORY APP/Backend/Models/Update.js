const mongoose= require ('mongoose')
const Schema =  mongoose.Schema;

const userSchema = new Schema ({
       
  unit:{
    type: String,
  },

   unitName: {
    type:String
   },

  
})

const Update = mongoose.model('update', userSchema);
module.exports = Update

