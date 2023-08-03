const User = require('../models/userModel')
const nodeMailer = require('nodemailer')
const bcrypt = require('bcrypt')
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const Banner = require('../models/bannerModel')
const session = require('express-session')
const wishlist = require('../models/wishlistModel')

// const config = require()
let email
let otp
let name


//--------- LOADING HOME ---------//
const loadhome = async(req,res)=>{
    try{
        const session = req.session.user_id
        const userData = await User.findById(req.session.user_id)
        const banner = await Banner.find()
      res.render('home',{user:userData,session,banners:banner})
    }
    catch(error){
        console.log(error);
    }
}

//--------- LOADING LOGIN ---------//
const loadLogin=async(req,res)=>{
    try {
        res.render('login')
    } catch (error) {
        console.log(error);
    }
}

// --------- USER LOGOUT ---------//
const userLogout = async(req,res)=>{
    try {
        req.session.destroy()
        res.redirect("/")
    } catch (error) {
        console.log(error.message);
    }
}


//--------- VERIFY LOGIN ---------//
const verifylogin = async(req,res)=>{
    try {
        const emailUser = req.body.Email
        const password = req.body.Password
        const userData = await User.findOne({email:emailUser}) 
        const passwordMatch = await bcrypt.compare(password,userData.password)
        if(passwordMatch){
            req.session.user_id = userData._id
            res.redirect('/')
        }
        else{
            res.render('login',{session,message:"Email is wrong !!"})
        }
    } catch (error) {
        console.log(error.message);
    }

    
}

//--------- LOADING REGISTER ---------//
const loadRegister = async(req,res)=>{
    try {
        const session = req.session.user_id
        res.render('registration',{session})
    } catch (error) {
        console.log(error);
    }
}

//--------- SECURE PASSWORD ---------//
const securePassword = async(password)=>{
    try {
        const passwordHash = await bcrypt.hash(password,10)
        return passwordHash
    } catch (error) {
        console.log(error.message);
    }
}

//--------- INSERT USER ---------//
const insertuser = async(req,res)=>{
    try {
        
        // ----- password security-----//
        const spassword = await securePassword(req.body.password);

        const user = new User({
          name: req.body.name,
          email: req.body.email,
          contact: req.body.contact,
          password: spassword,
          is_admin:0,
    });
      
        const userData = await user.save();
        email = userData.email
        name = userData.name
        if(userData){
            randomnumber = Math.floor(Math.random() * 9000) + 1000;
            otp = randomnumber;
             sendverifyMail(name, req.body.email, randomnumber);
             res.redirect("/verification");
           
        }
        else{
            res.render('registration',{message:'your registration has been failed '})
        }

     } catch(error){
            console.log(error.message);
        }
    }
        
    

    //--------- SEND VERIFY MAIL  ---------//
    const sendverifyMail = async(name,email,otp)=>{
        try {
            const transporter = nodeMailer.createTransport({
                service: "gmail",
                auth: {
                  user:process.env.Mymail,
                  pass:process.env.googlepass,
                },
              });
              const mailOptions = {
                from:process.env.Mymail,
                to: email,
                subject: "verification Email",
                html: `<p>Hi ${name}, please click <a href="http://localhost:3001/otp">here</a> to verify and enter your verification email.This${otp}</p> `,
              };
              console.log(otp);
              const info = await transporter.sendMail(mailOptions);
            
        } catch (error) {
            console.log(error.message);
        }
    }


    //--------- VERIFY EMAIL ---------//
    const verifyEmail = async (req, res,next) => {
        const otp2 = req.body.otp;
        console.log(otp2 + email + otp);
        try {
          if (otp2 == otp) {
            const userData = await User.findOneAndUpdate(
              { email: email },
              { $set: { is_verified: true } }
            );
            console.log(userData);
            if (userData) {
             req.session.user_id =userData._id 
              res.redirect("/");
            } else {
              res.render("verification",{ message: "please check the otp again" });
            }
          } else {
            res.render("verification", { message: "please check the otp again" });
          }
        } catch (error) {
          next(error)
        }
      };
      

       
         //--------- FORGET PASSWORD ---------//
    const forgotPassword = async (req,res,next) =>{
        try {
          res.render("forgotPassword")
        } catch (error) {
          next(error);
        }
      }

      

          //--------- FORGET VERIFY MAIL ---------//
let otpv;
let emailv;
const forgotVerifyMail = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email: email });
    const name = userData.name;
    if (userData) {
      randomnumber = Math.floor(Math.random() * 9000) + 1000;
      otpv = randomnumber;
      emailv = email; 
      sendverifyMail(name, email, randomnumber);
      res.render("forgotPassword", { message: "please check your email" });
    }
  } catch (error) {
    console.log(error.message);
  }
};


    //================== VERIFY OTP ===================

const verifyForgotMail = async (req, res) => {
    try {
      const otp = req.body.otp;
      if (otp == otpv) {
        res.render("resubmitPassword");
      } else {
        res.render("forgotPassword", { message: "otp is incorrect" });
      }
    } catch (error) {
      console.log(error.message);
    }
  };


      //================== VERIFY OTP ===================
      const reSendMail = async(req,res)=>{
        try {
          const userData = await User.find({email:email})
          const name = userData.name
            const randomnumber= Math.floor(Math.random() * 9000) + 1000;
          sendverifyMail(name,email,randomnumber)
          res.redirect('/verify')
        } catch (error) {
          console.log(error.message);
        }
      }


     //======================== RESUBMIT PASSWORD ===================

const resubmitPassword = async (req, res,next) => {
    try {
      if (req.body.password != req.body.password2) {
        res.render("resubmitPassword", {
          message: "Password Not Matching",
        });
        return;
      }
      
      const spassword = await securePassword(req.body.password);
  
      const changePassword = await User.findOneAndUpdate(
        { email: emailv },
        { $set: { password: spassword } }
      );
  
      if (changePassword) {
        res.render("resubmitPassword", {
          message: "Password successfully changed",
        });
      } else {
        res.render("resubmitPassword", {
          message: "Please try again!!",
        });
      }
    } catch (error) {
      next(error);
    }
  };

  
  //--------- VERIFICATION LOAD ---------//
   const verificationLoad = async(req,res)=>{
    try {
        const session = req.session.user_id
        res.render('verification',{session})
    } catch (error) {
        console.log(error.message);
    }
   }


     //--------- LOAD SHOP ---------//
   const loadShop = async(req,res,next)=>{
    try {
        const productdata = await Product.find({is_delete:false})
        const categorydata = await Category.find({})
        const session = req.session.user_id
        const userData = await User.findById(session)
        const page = parseInt(req.query.page) || 1;
        const limit =2;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const productCount = productdata.length;
        const totalPages = Math.ceil(productCount / limit);
        const paginatedProducts = productdata.slice(startIndex, endIndex);
        console.log(page);
    
        res.render("shopPage", {
          userData: userData,
          categoryData: categorydata,
          user:userData,
          session,
          productData: paginatedProducts,
          currentPage: page,
          totalPages: totalPages,
        });
    } catch (error) {
       next(error)
    }
   }


  //--------- VIEW SINGLE PRODUCT ---------//
  const SingleProduct = async(req,res,next)=>{
    try {
        const id = req.params.id
        const productData = await Product.findById(id)
        const session = req.session.user_id
        const userData = await User.findById(session)
        const Wishlist = await wishlist.find({
            userid: session,
            "products.productid":id
        });
        console.log(Wishlist);


        let checkWishlist = -1;

        if(Wishlist.length > 0){
            checkWishlist = Wishlist[0].products.findIndex(
                (wish)=> wish.productid == id
            );
        }
        console.log(checkWishlist);
        res.render('singleProduct',{
            session,
            user:userData,
            product:productData,
            wishlist:checkWishlist,
        })
    } catch (error) {
        console.log(error.message);
    }
  }


    //--------- VIEW USER PROFILE  ---------//
  const userProfile = async(req,res)=>{
    try {
        const session = req.session.user_id;
        const userData = await User.findById({ _id: req.session.user_id,session});
        res.render("userProfile", { user:userData, session });
    } catch (error) {
        console.log(error.message);
    }
  }


  const filterCategory = async(req,res,next)=>{
    try {
      const id = req.params.id
      console.log(id);
    const session = req.session.user_id
    const catData = await Category.find({is_delete:false })
    const userData = await User.findById(session)
    const productData = await Product.find({category:id,is_delete: false }).populate('category')
    
    const page = parseInt(req.query.page) || 1;
    const limit = 2;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const productCount = productData.length;
    const totalPages = Math.ceil(productCount / limit);
    const paginatedProducts = productData.slice(startIndex, endIndex);
    
    if (catData.length > 0) {
      console.log(catData);
      console.log(productData);
      res.render("shopPage",{session,user:userData, productData: paginatedProducts,
        currentPage: page,
        totalPages: totalPages,
        categoryData:catData,})
    } else {
      res.render("shopPage",{session,user:userData,productData:[],categoryData:catData})

    }
  } catch (error) {
    next(error);
  }
}


module.exports = {
    loadhome,
    loadLogin,
    userLogout,
    loadRegister,
    insertuser,
    verifylogin,
    verificationLoad,
    verifyEmail,
    loadShop,
    SingleProduct,
    userProfile,
    forgotPassword,
    forgotVerifyMail,
    verifyForgotMail,
    resubmitPassword,
    filterCategory,
}   