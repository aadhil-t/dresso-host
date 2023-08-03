const mongoose = require('mongoose')
const { model, models } = require('mongoose')

const categorySchema = mongoose.Schema({
    categoryName:{
        type:String,
        require:true,
    },
    is_delete:{
        type:Boolean,
        require:false
    }
})

module.exports= mongoose.model('category',categorySchema)