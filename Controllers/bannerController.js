const User = require('../models/userModel');
const Banner = require('../models/bannerModel');


            //--------- ADMIN  SIDE--------//
      // ------------ LOAD BANNER  ------------//
const loadBanner = async(req,res)=>{
    try {
        const adminData = await User.find({ is_admin:1})
        const banners = await Banner.find()
        res.render('bannerPage',{admin:adminData,banners})
    } catch (error) {
        console.log(error.message);
    }
}


      // ------------ ADD BANNER  ------------//
const addBanner = async(req,res)=>{
    try {
        const heading = req.body.heading
        let image = ''
        if(req.file){
            image = req.file.filename
        }
        const banner = new Banner({
            heading:heading,
            image:image
        })
        banner.save()
        res.redirect('/admin/bannerLoad')
    } catch (error) {
        console.log(error.message);
    }
}


      // ------------ EDIT BANNER  ------------//
const editBanner = async(req,res)=>{
    try {
        const id = req.body.id
        const heading = req.body.heading
        let image = req.body.image

        const adminData = await User.find({ is_admin:1})
        const banners = await Banner.find()

        if(heading.trim() == ''){    
        res.render('bannerPage',{admin:adminData,banners,message:'invalid banner text'})
        return
        }

        const allowedExtensions = /\.(jpg|jpeg|png|gif|webp)$/i;
        if (!allowedExtensions.test(image)) {
            res.render('bannerPage',{admin:adminData,banners,message:'invalid type image'})
            return
        }
    
        if(req.file){
          image = req.file.filename
        }

        await Banner.findByIdAndUpdate({_id:id},{
            $set:{
                heading:heading,
                image:image
            }
        })
        res.redirect('/admin/bannerLoad')
    } catch (error) {
        console.log(error.message);
    }
}


      // ------------ EDIT BANNER  ------------//
const deleteBanner = async(req,res)=>{
    try {
        const id = req.body.id
        const deletebanner = await Banner.findByIdAndDelete(id);
        if(deletebanner){
            res.redirect('/admin/bannerLoad')
        }else{
            res.redirect('/admin/bannerLoad')
        }
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    loadBanner,
    addBanner,
    editBanner,
    deleteBanner,
}