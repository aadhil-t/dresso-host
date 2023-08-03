const Cart = require("../models/cart-Model")
const User = require("../models/userModel")
const Product = require("../models/productModel");
const { trusted } = require("mongoose");
let message;


const loadCart = async (req, res) => {
    try {
      let id = req.session.user_id
      const session = req.session.user_id;
      const userData = await User.findById(req.session.user_id);
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
        
        const products = cartData.products;

        res.render("cartPage", { user: userData,Total:Total,session, products:products});   
        
          }else{
        res.render("cartPage", { user: userData,session, products:[]});   

          }
        }else{
          res.render("cartPage", { user: userData,session, products:[]});   
  
            }
      } 
      
    } catch (error) {
      console.log(error.message);
    }
  };
  

const addtoCart = async (req,res,next) => {
    try {
      const userId = req.session.user_id;
      const userData = await User.findOne({ _id: userId });
      const productId = req.body.id;
      console.log(productId);
      const productData = await Product.findOne({ _id: productId });
      const productStock = productData.productStock;
 
      const cartData = await Cart.findOneAndUpdate(
        { userId: userId },
        { 
          $setOnInsert: {   
            userId: userId,
            username: userData.name,
            products: [],
          },
        },
        { upsert: true, new: true }
      );
  
      const updatedProduct = cartData.products.find((product) => product.productid === productId);
      const updatedQuantity = updatedProduct ? updatedProduct.count : 0;
      console.log(productStock+'==='+updatedQuantity);
      if(updatedQuantity + 1 > productStock){
        return res.json({
          success: false,
          message: "Quantity limit reached !!"
        })
      }
  
      const cartProduct = cartData.products.find((product)=> product.productid === productId)
      
      let newPrice;

         if(productData.offPrice > 0){
          newPrice = productData.offPrice
          }else{
            newPrice = productData.productPrice
          }

      if(cartProduct){
      await Cart.updateOne(
        { userId: userId, "products.productid": productId},
        {
          $inc:{
            "products.$.count":1,
            "products.$.totalPrice":  newPrice
          }
        }
      );
    }else{
      cartData.products.push({
        productid: productId,
        productPrice: newPrice,
        totalPrice: newPrice
      });
      await cartData.save();
    }
  
      res.json({ success: true });
    } catch (error) {
      next(error)
    }
  };
  
  
  const changeProductCount = async (req, res,) => {
    try {
      const userData = req.session.user_id;
      const proId = req.body.product;
      let count = req.body.count;
      console.log(userData+'=='+proId);
      count = parseInt(count);
      const cartData = await Cart.findOne({ userId: userData });
      const product = cartData.products.find((product) => product.productid=== proId);
      const productData = await Product.findOne({ _id: proId });
  
      const productQuantity = productData.productStock;
  
      const updatedCartData = await Cart.findOne({ userId: userData });
      const updatedProduct = updatedCartData.products.find((product) => product.productid === proId);
      const updatedQuantity = updatedProduct?.count; // Use optional chaining here
  
      if (count > 0) {
        // Quantity is being increased
        if (updatedQuantity && updatedQuantity + count > productQuantity) { // Add null check for updatedQuantity
          res.json({ success: false, message: 'Quantity limit reached!' });
          return;
        }
      } else if (count < 0) {
        // Quantity is being decreased
        if (!updatedQuantity || updatedQuantity <= 1 || Math.abs(count) > updatedQuantity) { // Add null check for updatedQuantity
          await Cart.updateOne(
            { userId: userData },
            { $pull: { products: { productid: proId } } }
          );
          res.json({ success: true });
          return;
        }
      }
  
      const cartdata = await Cart.updateOne(
        { userId: userData, "products.productid": proId },
        { $inc: { "products.$.count": count } }
      );
  
      const updateCartData = await Cart.findOne({ userId: userData });
      const updateProduct = updateCartData.products.find((product) => product.productid === proId);
      const updateQuantity = updateProduct?.count; // Use optional chaining here
      const price = updateQuantity * productData.productPrice;
  
      await Cart.updateOne(
        { userId: userData, "products.productid": proId },
        { $set: { "products.$.totalPrice": price } } 
      );
  
      res.json({ success: true });
  
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };


  const deleteCart = async(req,res)=>{
    try {
      const session = req.session.user_id
      const proId = req.body.product
      const cartData = await Cart.findOne({userId:session});
      console.log(session);

      if (cartData.products.length === 1) {
        await Cart.deleteOne({userId:session})
        
   } else {
    const found = await Cart.updateOne({userId:session},{$pull:{products:{productid:proId}}})

   }
      res.json({success: true});
    } catch (error) {
      console.log(error.message);
    }
  }

module.exports ={
    loadCart,
    addtoCart,
    changeProductCount,
    deleteCart,

}