const User = require("../models/userModel")
const Product = require('../models/productModel')
const Address = require('../models/addressModel');



  //------------- LOADING ADDRESS PAGE ------------//
const loadUserAddress = async(req,res)=>{
    try {
        const session = req.session.user_id;
        const userData = await User.findById({_id: session});
         res.render('addUserAddress',{user:userData, session})
    } catch (error) {
        console.log(error.message);
    }
}

  //------------- LOADING USERADDRESS PAGE ------------//
const loadprofileAddress = async(req,res)=>{
    try {
        const session = req.session.user_id;
        const userData = await User.findById({_id: session});
        const addressDetails = await Address.findOne({userid: req.session.user_id})

        if(addressDetails){
            res.render('addUserAddress',{user:userData, session ,address:addressDetails})
        }else{
            res.render('addUserAddress',{user:userData, session,address:[]})

        }
    } catch (error) {
        console.log(error.message);
    }
}


  //------------- INSERTING USER ADDRESS ------------//
const inserUserAddress = async(req,res)=>{
    try {
        const addressDetails = await Address.findOne({userid: req.session.user_id})
        if(addressDetails){
            console.log(req.body.pincode,req.body.landmark);

            const updateOne = await Address.updateOne({userid:req.session.user_id},{$push: {addresses:{
                userName:req.body.username,
                mobile:req.body.mobile,
                alternativeMob:req.body.alternativeMob,
                housename:req.body.housename,
                city:req.body.city,
                state:req.body.state,
                pincode:req.body.pincode,
                landmark:req.body.landmark
            }}});
            if(updateOne){
                res.redirect('/checkoutPage')
            }else{
                res.redirect('/')
            }
        }else{
            const address = new Address({
                userid:req.session.user_id,
                addresses:[{
                    userName:req.body.username,
                mobile:req.body.mobile,
                alternativeMob:req.body.alternativeMob,
                housename:req.body.housename,
                city:req.body.city,
                state:req.body.state,
                pincode:req.body.pincode,
                landmark:req.body.landmark
                }]
            })
            const addressData = await address.save();
            if(addressData){
                res.redirect('/checkoutPage')
            }else{
                res.redirect('/checkoutPage')
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}



 //------------- INSERTING USER  PROFILE ADDRESS ------------//
 const inserprofileAddress = async(req,res)=>{
    try {
        const addressDetails = await Address.findOne({userid: req.session.user_id})
        console.log(addressDetails+'==');
        if(addressDetails){
            console.log(req.body.pincode,req.body.landmark);

            const updateOne = await Address.updateOne({userid:req.session.user_id},{$push: {addresses:{
                userName:req.body.username,
                mobile:req.body.mobile,
                alternativeMob:req.body.alternativeMob,
                housename:req.body.housename,
                city:req.body.city,
                state:req.body.state,
                pincode:req.body.pincode,
                landmark:req.body.landmark
            }}});
            if(updateOne){
                res.redirect('/profileAddress')
            }else{
                res.redirect('/profileAddress')
            }
        }else{
            const address = new Address({
                userid:req.session.user_id,
                addresses:[{
                    userName:req.body.username,
                mobile:req.body.mobile,
                alternativeMob:req.body.alternativeMob,
                housename:req.body.housename,
                city:req.body.city,
                state:req.body.state,
                pincode:req.body.pincode,
                landmark:req.body.landmark
                }]
            })
            const addressData = await address.save();
            if(addressData){
                res.redirect('/profileAddress')
            }else{
                res.redirect('/profileAddress')
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}


  //------------- ADDING USER ADDRESS ------------//
const addUserAddress = async(req,res)=>{
    try {
        const session = await User.findById(req.session.user_id)
        const addressData = await Address.findOne({})
        res.render('addUserAddress',{session,user:req.session.user_id})
    } catch (error) {
        console.log(error.message);
    }
}   


  //------------- EDITING USER ADDRESS ------------//
const editUserAddress = async(req,res)=>{
    try {
        const session = await User.findById(req.session.user_id)
        const addressData = await Address.findOne({userid:req.session.user_id},{addresses:{$elemMatch:{_id:req.query.id}}})
        const address = addressData.addresses
        res.render('editUserAddress',{session,user:session,address:address[0]});
    } catch (error) {
        console.log(error.message);
    }
}
  //------------- EDITING USER PROFILE ADDRESS ------------//
const editProfileAddress = async(req,res)=>{
    try {
        const session = await User.findById(req.session.user_id)
        const addressData = await Address.findOne({userid:req.session.user_id},{addresses:{$elemMatch:{_id:req.query.id}}})
        const address = addressData.addresses
        console.log(address);
        res.render('editprofileAddress',{session,user:session,address:address[0]});
    } catch (error) {
        console.log(error.message);
    }
}


  //------------- UPDATE USER ADDRESS ------------//
const updatedAddress = async(req,res)=>{
    try {
        const session = req.session.user_id
        const id = req.query.id;
        const address = await Address.updateOne({userid:session},{$pull: {addresses: {_id:id}}});
        const pushAddress = await Address.updateOne({userid:session},
            {$push: 
            {addresses: {
                userName:req.body.username,
                mobile:req.body.mobile,
                alternativeMob:req.body.alternativeMob,
                housename:req.body.housename,
                city:req.body.city,
                state:req.body.state,
                pincode:req.body.pincode,
                landmark:req.body.landmark

            }}
        });
        res.redirect('/checkoutPage')
    } catch (error) {
        console.log(error.message);
    }
}
  //------------- UPDATE USER PROFILE ADDRESS ------------//
const updatedprofileAddress = async(req,res)=>{
    try {
        const session = req.session.user_id
        const id = req.query.id;
        const address = await Address.updateOne({userid:session},{$pull: {addresses: {_id:id}}});
        const pushAddress = await Address.updateOne({userid:session},
            {$push: 
            {addresses: {
                userName:req.body.username,
                mobile:req.body.mobile,
                alternativeMob:req.body.alternativeMob,
                housename:req.body.housename,
                city:req.body.city,
                state:req.body.state,
                pincode:req.body.pincode,
                landmark:req.body.landmark

            }}
        });
        res.redirect('/profileAddress')
    } catch (error) {
        console.log(error.message);
    }
}


  //------------- DELETE USER ADDRESS  ------------//
const deleteAddress = async(req,res)=>{
    try {
        const session = req.session.user_id;
        const addressId = req.body.address;
        const addressData = await Address.findOne({userid:session})
        if(addressData.addresses.length === 1){
            await Address.deleteOne({userid:session});
        }else{
            await Address.updateOne(
                {userid: session},{$pull: {addresses:{_id:addressId}}}
                );
        }
        res.status(200).json({ message: "Address deleted successfully" });
    } catch (error) {
        console.log(error.message);
    }
}


  //------------- SHOW ADDRESS USER PROFILE ------------//
  const showAddress = async(req,res)=>{
    try {
        const session = req.session.user_id;
        const userData = await User.findOne({_id:req.session.user_id});
        const addressData = await Address.findOne({userid: req.session.user_id});
        if(session){
            if(addressData){
                const address = addressData.addresses
                console.log(address.length);
                res.render('profileAddress',{session,user:userData,address:address})
            }else{
                res.render('profileAddress',{session,user:userData,address:[]})

            }
        }
    } catch (error) {
        console.log(error.message);
    }
  }

module.exports ={
    inserUserAddress,
    loadUserAddress,
    addUserAddress,
    editUserAddress,
    updatedAddress, 
    deleteAddress,
    showAddress,
    inserprofileAddress,
    loadprofileAddress,
    updatedprofileAddress,
    editProfileAddress,
}
