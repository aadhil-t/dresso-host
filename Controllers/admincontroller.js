const User = require('../models/userModel')
const Order = require('../models/orderModel')
const Product = require("../models/productModel")
const bcrypt = require('bcrypt')


//---------  LOADING LOGIN ---------//
const loadLogin = async(req,res)=>{
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message);
    }
}

//--------- VERIFY LOGIN ---------//
const verifyLogin = async(req,res)=>{
    try {
        const emailAdmin = req.body.email
        console.log(emailAdmin);
        const password = req.body.password
        const userData = await User.findOne({email:emailAdmin})
        if(userData){
            const passwordMatch = await bcrypt.compare(password,userData.password)
            if(passwordMatch){
                console.log(passwordMatch);

                if(userData.is_admin === 0){
                    res.render('login',{message:"Email and Password is Incorrect!!"})
                }
                else{
                   req.session.auser_id = userData._id;
                    res.redirect('/admin/dashboard')
                }
            }
            else{
                res.render('login',{message:"Email and Password is Incorrect"})
            }
        }
        else{
            message="Email and Password is Incorrect"
            res.render('login');
        }
    } catch (error) {
        console.log(error.message);
    }
}

//--------- ADMIN LOGOUT ---------//
const adminLogout = async(req,res)=>{
    try {
        req.session.destroy()

        res.redirect('/admin')
    } catch (error) {
        console.log(error.message);
    }
}

//---------  LOADING HOME ---------//
const loadhome = async(req,res)=>{
    try {
        res.render('/admin/dashboard')
    } catch (error) {
        console.log(error);
    }
}

//---------  LOADING USERLIST ---------//
const loaduserlist = async(req,res)=>{
    try {
        const userData = await User.find({})
        res.render('userlist',{user:userData})
    } catch (error) {
        console.log(error.message);
    }
}

//---------  LOADING DASHBOARD ---------//
const loadDashboard = async (req, res) => {
    try {
      const adminData = await User.findById({ _id: req.session.auser_id });
      const userData = await User.find({ is_admin: 0 });
  
      const aggregationPipeline = [
        // Total Sales Amount
        {
          $facet: {
            totalSales: [
              { $unwind: "$products" },
              { $match: { "products.status": "Delivered" } },
              {
                $group: {
                  _id: null,
                  total: { $sum: "$products.totalPrice" },
                },
              },
              {
                $project: {
                  _id: 0,
                  total: 1,
                },
              },
            ],
            CODTotal: [
              // Total COD
              { $unwind: "$products" },
              { $match: { "products.status": "Delivered", paymentMethod: "COD" } },
              {
                $group: {
                  _id: null,
                  total: { $sum: "$products.totalPrice" },
                },
              },
              {
                $project: {
                  _id: 0,
                  total: 1,
                },
              },
            ],
            onlinePaymentTotal: [
              // Total Online Payment
              { $unwind: "$products" },
              { $match: { "products.status": "Delivered", paymentMethod: { $ne: "COD" } } },
              {
                $group: {
                  _id: null,
                  total: { $sum: "$products.totalPrice" },
                },
              },
              {
                $project: {
                  _id: 0,
                  total: 1,
                },
              },
            ],
          },
        },
      ];
  
      const [results] = await Order.aggregate(aggregationPipeline);
  
      const total = results.totalSales[0]?.total || 0;
      const codTotal = results.CODTotal[0]?.total || 0;
      const onlineTotal = results.onlinePaymentTotal[0]?.total || 0;  
      const totalOrders = await Order.find();
      const totalProducts = await Product.find();
  
      res.render("dashBoard", {
        admin: adminData,
        users: userData,
        total,
        totalOrders,
        totalProducts,
        codTotal,
        onlineTotal,
      });
    } catch (error) {
      console.log(error.message);
    }
  };


//--------- BLOCKING USER  ---------//
const block = async(req,res)=>{
    try {
        console.log(req.query.id);
        const userData = await User.findByIdAndUpdate(req.query.id,{$set:{is_block:true}});
        req.session.user_id = null
        res.redirect('/admin/userlist')
    } catch (error) {
        console.log(error.message);
    }
}


//--------- UNBLOCKING USER  ---------//
const unblock = async(req,res)=>{
    try {
        const userData = await User.findByIdAndUpdate(req.query.id,{$set:{is_block:false}});
        res.redirect('/admin/userlist')
    } catch (error) {
        console.log(error.message);
    }
}


//---------  SALES REPORT  ---------//
const loadSalesReport = async(req,res) =>{
    try {
      const adminData = await User.findById({ _id: req.session.auser_id });
     const order = await Order.aggregate([
    { $unwind: "$products" },
    { $match: { 'products.status': 'Delivered' } },
    { $sort: { date: -1 } },
    {
      $lookup: {
        from: 'products',
        let: { productid: { $toObjectId: '$products.productid' } },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$productid'] } } }
        ],
        as: 'products.productDetails'
      }
    },  
    {
      $addFields: {
        'products.productDetails': { $arrayElemAt: ['$products.productDetails', 0] }
      }
    }
  ]);
      res.render("salesReport", { order ,admin:adminData });
    } catch (error) {
      console.log(error.message);
    }
  }



//---------  SALES SORT  ---------//
const saleSort = async(req,res)=>{
    try {
        const adminData = await User.findById({_id: req.session.auser_id});
        const id = parseInt(req.params.id);
        const from = new Date();
        const to = new Date(from.getTime()- id * 24 * 60 * 60 * 1000);
        console.log(id);
        const order = await Order.aggregate([
            { $unwind: "$products" },
            {$match: {
                'products.status': 'Delivered',
                $and: [
                  { 'products.deliveryDate': { $gt: to } },
                  { 'products.deliveryDate': { $lt: from } }
                ]
              }},
            { $sort: { date: -1 } },
            {
              $lookup: {
                from: 'products',
                let: { productid: { $toObjectId: '$products.productid' } },
                pipeline: [
                  { $match: { $expr: { $eq: ['$_id', '$$productid'] } } }
                ],
                as: 'products.productDetails'
              }
            },  
            {
              $addFields: {
                'products.productDetails': { $arrayElemAt: ['$products.productDetails', 0] }
              }
            }
          ]);
        res.render('salesReport', {order, adminData  })
    } catch (error) {
        console.log(error.message);
    }
}



const rangeSort = async(req,res) =>{
  try {
    const adminData = await User.findById({ _id: req.session.auser_id });
    const from = req.body.from;
    const to = req.body.to;
   
    const order = await Order.aggregate([
      { $unwind: "$products" },
      {$match: {
        'products.status': 'Delivered',
        $and: [
        { 'products.deliveryDate': { $gt: new Date(from)} },
        { 'products.deliveryDate': { $lt: new Date(to) } }
        ]
      }},
      { $sort: { date: -1 } },
      {
        $lookup: {
        from: 'products',
        let: { productid: { $toObjectId: '$products.productid' } },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$productid'] } } }
        ],
        as: 'products.productDetails'
        }
      },  
      {
        $addFields: {
        'products.productDetails': { $arrayElemAt: ['$products.productDetails', 0] }
        }
      }
      ]);

    res.render("salesReport", { order ,admin:adminData });
   
  } catch (error) {
    console.log(error.message);
  }
}


module.exports ={
    loadhome,
    loaduserlist,
    loadLogin,
    adminLogout,
    verifyLogin,
    loadDashboard,
    block,
    unblock,
    loadSalesReport,
    saleSort,
    rangeSort,
}