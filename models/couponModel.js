const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
    user:{
        type:Array,
        ref:'user'
    },
    couponName:{
        type:String,
        required:true,
    },
    couponCode:{
        type:Number,
        required:true,
    },
    discountPercentage:{
        type:Number,
        required:true,
    },
    criteria:{
        type:Number,
        require:true,
    },
    startDate:{
        type:Date,
        required:true,
    },
    expiryDate:{
        type:Date,
        required:true,
    },

})
const couponModel = mongoose.model("coupon",couponSchema);
module.exports = couponModel