const User = require('../models/userModel');
const Product = require('../models/productModel')
const Cart = require('../models/cart-Model')
const Order = require('../models/orderModel');
const razorpay  = require("razorpay")
const crypto = require("crypto");
const { log } = require('console');

var instance = new razorpay({
    key_id:process.env.keyId,
    key_secret:process.env.keySecret,
  })

    //---------- PLACE ORDER ------------//
const placeOrder = async(req,res)=>{
    try {
        const userData = await User.findOne({_id: req.session.user_id});
        const address = req.body.address;
        const cartData = await Cart.findOne({userId:req.session.user_id});
        const products = cartData.products;
        const total = parseInt(req.body.Total)
        const paymentMethod = req.body.payment;

        const status = paymentMethod === 'COD' ? 'placed' : 'pending';
        
        const order = new Order({
            deliveryAddress: address,
            userId:req.session.user_id,
            userName:userData.name,
            paymentMethod: paymentMethod,
            products: products,
            totalAmount: total,
            status: status,
            date: new Date(),
        });

        const orderData = await order.save();

        const orderid = order._id

        if(orderData){
            // CASH ON DELIVERY
            if (order.status === 'placed'){
                await Cart.deleteOne({userId:req.session.user_id});
                for(let i=0; i< products.length; i++){
                    const pro = products[i].productid;
                    const count = products[i].count;
                    await Product.findOneAndUpdate({ _id:pro},{$inc: {productStock: -count}});
                }
                res.json({ codsuccess: true, orderid})
            }else{
                //------ WALLET ---------
                if(order.paymentMethod === 'wallet-payment'){
                    console.log('is wallet payment');
                    const wallet = userData.wallet
                    if (wallet >= total){
                        await Cart.deleteOne({ userId: req.session.user_id});
                        for(let i = 0; i<products.length; i++){
                            const pro = products[i].productid;
                            const count = products[i].count;
                            await Product.findByIdAndUpdate({ _id: pro }, { $inc: { quantity: -count } });
                            await User.findOneAndUpdate({_id:req.session.user_id},{$inc:{wallet: -total}})
                            await Order.findOneAndUpdate({_id:order._id},{$set:{status:"placed"}});
                            res.json({ codsuccess: true ,orderid});
                        }
                    }else{
                        console.log('is working still');
                        res.json({walletFailed:true});
                      }
                }else{

                  //------ RAZORPAY ---------

                const orderId  = orderData._id;
                const totalAmount = orderData.totalAmount
                var options = {
                    amount:totalAmount * 100,
                    currency: "INR",
                    receipt:"" + orderId
                };

                instance.orders.create(options, function(err,order){
                    res.json({ order });
                })
            }
        }
       
        }else{
            res.redirect("/")
        }
    } catch (error) {
        console.log(error.message);
    }
}



const verifyPayment = async(req,res)=>{
    try {
        const cartData = await Cart.findOne({userId: req.session.user_id})
        const products = cartData.products
        const details = req.body
        const hmac = crypto.createHmac('sha256', process.env.keySecret);
        hmac.update(details.payment.razorpay_order_id + '|' + details.payment.razorpay_payment_id);
        const hmacValue = hmac.digest('hex');
  
        if(hmacValue === details.payment.razorpay_signature){
            for (let i = 0; i < products.length; i++) {
              const pro = products[i].productid;
              const count = products[i].count;
              await Product.findByIdAndUpdate({ _id: pro }, { $inc: { productStock: -count } });
            }
            await Order.findByIdAndUpdate({_id:details.order.receipt},{$set:{status:"placed"}});
            await Order.findByIdAndUpdate({_id:details.order.receipt},{$set:{paymentId:details.payment.razorpay_payment_id}});
            await Cart.deleteOne({userId:req.session.user_id});
            const orderid = details.order.receipt 
            res.json({ codsuccess: true ,orderid});
        }else{
            await Order.findByIdAndRemove({_id:details.order.receipt});
            res.json({success:false});
        }
    } catch (error) {
        console.log(error.message);
    }
}

    //---------- SHOW ORDER SUCCESS PAGE ------------//
const orderSuccessPage = async(req,res)=>{
    try {
        const session = req.session.user_id
        const user = await User.findById(session)
        const id = req.params.id;
        const orderData = await Order.findOne({_id: id}).populate("products.productid");
        console.log(orderData);
        const orderDate = orderData.date;
        
        res.render('orderSuccessPage',{session,orders:orderData,user:user})

    } catch (error) {
        console.log(error.message);
    }
}


    //---------- SHOW ORDER ON USERPROFILE ------------//
const orderShowProfile = async(req,res)=>{
    try {
        const session = req.session.user_id
        const id = req.session.user_id;
        const userData = await User.findById({_id:id})
        await Order.deleteMany({status:'pending'})
        await User.deleteMany({status:"pending"});
        const orders = await Order.find({userId:id}).populate('products.productid').sort({date:-1})

        if(orders){
            res.render('orderProfileShow',{user: userData,session,orders:orders});
        }
        else{
            res.render('orderProfileShow',{userData:userData,session,orders:[]})
        }
    } catch (error) {
        console.log(error.message);
    }
}


    //---------- SHOW SINGLE ORDER ON USERPROFILE ------------//
const singleOrderProfileShow = async(req,res)=>{
    try {
        const id = req.params.id
        const session = req.session.user_id;
        const userData = await User.findOne({_id:session})
        const orders = await Order.findOne({_id:id}).populate("products.productid");
        res.render('singleOrderProfile',{session,user:userData,orders:orders})
    } catch (error) {
        console.log(error.message);
    }
}



 //---------- CANCEL ORDER IN USERSIDE ------------//
 const cancelOrder = async(req,res)=>{
    try {
        const id = req.body.orderid
        console.log(id);
         const reason = req.body.reason
        const ordersId =req.body.ordersid
        const session = req.session.user_id
        const userData = await User.findById(session)
        const orderData = await Order.findOne({userId:session,"products._id": id})
        console.log(reason);
        const product = orderData.products.find((product)=> product._id.toString()=== id);
        
        const canceledAmount = product.totalPrice
        const productCount = product.count;
        const proId = product.productid; 
        const updatedOrder = await Order.findOneAndUpdate(
            {
                userId: session,
                'products._id': id
            },
            {
                $set: {
                    'products.$.status':"canceled",
                    'products.$.cancelReason': reason
                }
            },
            { new: true}
        ); 

        if(updatedOrder){
            await Product.findByIdAndUpdate({_id: proId}, {$inc: {productStock:productCount}})
            if(orderData.paymentMethod === 'onlinPayment' || orderData.paymentMethod === 'wallet'){
                await User.findByIdAndUpdate({_id:session},{$inc: {wallet:canceledAmount}})
                await Order.findByIdAndUpdate({_id:session},{$inc:{totalAmount:-canceledAmount}});

                res.redirect('/singleOrderShow/' + ordersId)
            }else{
                res.redirect('/singleOrderShow/' + ordersId)
            }
        }else{
               res.redirect('/singleOrderShow/' + ordersId)
        }
    } catch (error) {
        console.log(error.message);
    }
}


 //---------- STATUS CHANGE ------------//
 const changeStatus = async(req,res) =>{
    try {
      const id = req.body.id
      const userId = req.body.userid
      const statusChange = req.body.status
      const updatedOrder = await Order.findOneAndUpdate(
        {
          userId: userId,
          'products._id': id
        },
        {
          $set: {
            'products.$.status': statusChange
          }
        },
        { new: true }
      );
      if(statusChange == "Delivered"){
        const updatedOrder = await Order.findOneAndUpdate(
          {
            userId: userId,
            'products._id': id
          },
          {
            $set: {
              'products.$.deliveryDate': new Date()
            }
          },
          { new: true }
        );
      }
      if(updatedOrder){
        res.json({success:true})
      }
    } catch (error) {
      console.log(error.message);
    }
  }

              //---------- ADMIN SIDE ------------//


 //---------- SHOW ORDER ON ADMINPAGE ------------//
const adminOrderShowProfile = async(req,res)=>{
    try {
        const session = req.session.auser_id
        const id = req.session.user_id
        const adminData = await User.findOne({is_admin:1})
        await Order.deleteMany({status:"pending"});
        const orders = await Order.find().populate('products.productid').sort({date:-1})

        if(orders){
            res.render('orderShow',{admin:adminData,orders:orders,session});
        }
        else{
            res.render('orderShow',{orders:[],admin:adminData,session})
        }
    } catch (error) {
        console.log(error.message);
    }
}


 //---------- SHOW  SINGLE ORDER ON ADMINPAGE ------------//
const adminSingleOrderShow = async(req,res)=>{
    try {
        const session = req.session.auser_id;
        const id = req.params.id
            console.log(id);
        const adminData = await User.findOne({is_admin:1});
        const orderData = await Order.findOne({_id:id}).populate("products.productid");
        res.render('singleOrderShow',{admin:adminData,orders:orderData})
    } catch (error) {
        console.log(error.message);
    }
}


 //---------- RETURN ORDER ------------//
const returnOrder = async(req,res,next) =>{
    try {
      const ordersId = req.body.ordersid;
      const session = req.session.user_id
      const id = req.body.orderid;
      const reason = req.body.reason
      const userData = await Order.findById(session)
      const orderData = await Order.findOne({ userId: session, 'products._id': id})
      const product = orderData.products.find((Product) => Product._id.toString() === id);
      const returnAmount = product.totalPrice
      const proCount = product.count
      const proId = product.productid 
      
      const updatedOrder = await Order.findOneAndUpdate(
        {
          userId: session,
          'products._id': id
        },
        {
          $set: {
            'products.$.status': 'Product Returned',
            'products.$.returnReason': reason
          }
        },
        { new: true }
      );
  
      if(updatedOrder){
  
        await Product.findByIdAndUpdate({_id:proId},{$inc:{StockQuantity:proCount}})
        await User.findByIdAndUpdate({_id:session},{$inc:{wallet:returnAmount}})
        res.redirect("/singleOrderShow/" + ordersId)
      }else{
         res.redirect("/singleOrderShow/" + ordersId)
      }
     
  
    } catch (error) {
      next(error);
    }
  }
  
 

module.exports = {
    placeOrder,
    orderSuccessPage,
    orderShowProfile,
    singleOrderProfileShow,
    adminOrderShowProfile,
    adminSingleOrderShow,
    cancelOrder,
    verifyPayment,
    changeStatus,
    returnOrder,
}

