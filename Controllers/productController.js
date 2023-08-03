const User = require('../models/userModel')
const category = require('../models/categoryModel')
const product = require('../models/productModel')
const path = require('path')
const fs = require('fs')


//---------  LOADING PRODUCT ---------//  
const loadProduct = async(req,res)=>{
    try {
        const productData = await product.find({is_delete:false})
        res.render('productList',{product:productData})  
    } catch (error) {
        console.log(error.message);
    }
}

//--------- LOAD ADD PRODUCT   ---------//
const loadAddproduct = async(req,res)=>{
    try {
        const categoryData = await category.find({is_delete:false})
        res.render('addProduct',{category:categoryData})
    } catch (error) {
        console.log(error.message);
    }
}


//--------- LOAD ADD PRODUCT   ---------//
const insertProduct = async(req,res)=>{
    try {
        const images = [];
        if (req.files && req.files.length > 0) {
          for (let i = 0; i < req.files.length; i++) {
            images.push(req.files[i].filename);
          }
        }
        
        const Product = new product({
            productName: req.body.productName.trim(),
            productBrand: req.body.brand.trim(),
            category: req.body.category,
            productStock: req.body.stock.trim(),
            productImage: images,
            productPrice: req.body.price.trim(),
            productDescription: req.body.discription.trim(),
        });

        const productData = await Product.save();

        if(productData){
            res.redirect('/admin/productList')
        }
        else{
            res.redirect("/admin/productList")
        }
    } catch (error) {
        console.log(error.message);
    }
}


//---------DELETE PRODUCT   ---------//
const deleteproduct = async(req,res)=>{
    try {
        const deleteProduct = await product.updateOne(
         { _id:req.query.id},
         {$set:{is_delete:true}});
         console.log(deleteProduct);
        res.redirect('/admin/productList')
    } catch (error) {
        console.log(error.message);
    }
}


//--------- SHOW EDIT PRODUCT   ---------//
const loadEditProduct = async (req,res)=>{
    try {
        const id =req.params.id;
        const productData = await product.findById(id);    
       const categoryData = await category.find({is_delete:false});
        res.render('editProduct',{
            category:categoryData,
            products:productData
        });
    } catch (error) {
        console.log(error.message);
    }
}


//--------- UPDATE EDIT PRODUCT   ---------//
const updateProduct = async (req,res) =>{
   
    if( req.body.productName.trim() === "" ||
    req.body.productBrand === "" ||
    req.body.productPrice === "" ||
    req.body.category === "" ||
    req.body.productStock === "" ||
    req.body.discription === "" 
    
    ){

            const id = req.params.id;
            const productData = await product.find({_id: id})
            const categoryData = category.find();
            const adminData = await User.find({_id:req.session.auser_id});
    
            res.render("editProduct",{
                admin:adminData,
                products:productData,
                message:"All field required",
            });
        }else{
        try {
            // const arraying =[];
            // for(file of req.file){ 
            //     arraying.push(file.filename);
            // }
            const id = req.params.id;
            console.log(id);
           const c= await product.updateOne(
                {_id:id},
                {$set:{
                    productName:req.body.productName,
                    categoryName: req.body.categoryName,
                    productStock: req.body.stock,
                    productPrice: req.body.price,
                    discription: req.body.description,
                    productBrand: req.body.brand
                }
            }
         );
         console.log(c);
            res.redirect('/admin/productList')
        } catch (error) {
            console.log(error.message);
        }
    }
};  


//---------  DELETE IMAGE   ---------//
const deleteimage = async(req,res)=>{
    try {
        const image = req.params.imageid
        const productid = req.params.productid 
        fs.unlink(path.join(__dirname, "../public/adminAssets/adminImage", image), () => {});
        const productimg = await product.updateOne({_id:productid},{$pull: {productImage:image}})
        res.redirect(`/admin/editproduct/${productid}`)
    } catch (error) {
        console.log(error.message);
    }
}

  


//---------  UPDATE IMAGE SECTION  ---------//

const updateImage = async (req, res) => {
    try {
      const id = req.params.id;
      const productData = await product.findById(id);
      const imgLength = productData.productImage.length;
    
      const images = req.files.map(file => file.filename);
      if (imgLength + images.length <= 10) {
        await product.findByIdAndUpdate(id, { $addToSet: { productImage: { $each: images } } });
      }
    
      res.redirect(`/admin/editproduct/${id}`);
    } catch (error) {
      console.log(error.message);
    }
  };
  

module.exports ={
    loadProduct,
    loadAddproduct,
    insertProduct,
    loadEditProduct,
    updateProduct,
    deleteproduct,
    deleteimage,
    updateImage
}