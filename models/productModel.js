const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({

    productName:{
        type:String,
        require:true,
    },
    
    productBrand:{
        type:String,
        require:true,
    },

    category:{
        type:String,
        require:true,
    },
    
    productStock:{
        type:Number,
        require:true,
    },

    productImage:{
        type:Array,
        require:true
    },
    
    productPrice:{
        type:Number,
        require:true,
    },
     offerName : {
        type : String,

     },
     offerPrcentage : {
        type : Number,
        default:0
     },
     offPrice : {
        type : Number,
         
     },

    productDescription:{
        type:String,
        require:true
    },

    is_delete:{
        type:Boolean,
        default:false,
    }
})

module.exports= mongoose.model('product',productSchema)