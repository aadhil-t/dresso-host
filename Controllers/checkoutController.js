const Cart = require("../models/cart-Model")
const User = require("../models/userModel")
const Address = require('../models/addressModel')
const Coupen = require('../models/couponModel')

const loadCheckout = async(req,res)=>{
    try {
        const session = req.session.user_id;
        const user = await User.findById(req.session.user_id)
        const userData = await User.findOne({ id: req.session.user_id });
        const coupenData = await Coupen.find();
        const addressData = await Address.findOne({userid: req.session.user_id})
        const cartData = await Cart.findOne({ userId: req.session.user_id }).populate("products.productid");
        
      if(req.session.user_id){
        if(cartData){
          if(cartData.products.length > 0){
            const total = await Cart.aggregate([
              {$match: { userId: req.session.user_id}},
              {$unwind:"$products"},
              {$group: { _id:null,
              total: {$sum: {$multiply: ["$products.productPrice", "$products.count"]}}
            }
          }
        ]);

        const Total = total.length > 0 ? total[0].total : 0; 
        
        
        res.render("userCheckout",{session,Total,userData,user,address:addressData,coupons:coupenData})        
          }
        }
      } 
        // const total =   
        // res.render("userCheckout",{session,userData,user,address:addressData,cartdata})
    } catch (error) {
        console.log(error.message);
    }
}



module.exports ={
    loadCheckout,
}