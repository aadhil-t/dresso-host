
const {ObjectId} = require('mongodb')
const mongoose = require("mongoose")

const addressSchema = mongoose.Schema({

    userid:{
        type:ObjectId,
        required:true,
    },

    addresses:[{
        userName:{
            type:String,
            required:true,
        },

        mobile:{
            type:Number,
            required:true,
        },

        alternativeMob:{
            type:Number,
            required:true,
        },

        housename:{
            type:String,
            required:true,
        },

        city:{
            type:String,
            required:true,
        },

        state:{
            type:String,
            required:true,
        },

        pincode:{
            type:Number,
            required:true,
        },

        landmark:{
            type:String,
            required:true,
        },
    }]  
});



module.exports = mongoose.model("address",addressSchema)