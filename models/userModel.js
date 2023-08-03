const mongoose = require('mongoose')
const { boolean } = require('webidl-conversions')

const userSchema = new mongoose.Schema({
     name:{
        type:String,
        required:true,
     },
     email:{
        type:String,
        required:true,
     },
     contact:{
        type:Number,
        required:true,
     },
     password:{
        type:String,
        required:true,
     },
     is_admin:{
        type:Number,
        default:0,
     },
     is_block:{
        type:Boolean,
        default:false,
     },
     is_verified:{
        type:Boolean,
        default:false,
     },
     wallet:{
      type:Number,
      default:0,
   },
})
const User = mongoose.model('User',userSchema);
module.exports = User;