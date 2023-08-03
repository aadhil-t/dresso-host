const User = require('../models/userModel')
const bcrypt =require('bcrypt')
const upperCase = require('upper-case')
const Category=require('../models/categoryModel')

//---------  LOADING CATAGORY ---------//
const loadCategory = async(req,res)=>{
    try {
        const categoryData = await Category.find({is_delete:false})
        //console.log(Category);
        res.render('categoryList',{category:categoryData})
    } catch (error) {
        console.log(error.message);
    }
}


//--------- ADDING CATEGORY  ---------//
const insertCategory = async(req,res)=>{
    try {
        const name = upperCase.upperCase(req.body.name)
        if(name.trim().length == 0){
            message = "category can't be blank"
            res.redirect("/admin/categoryList")
            return;
        }
        
        const existingCategory = await Category.findOne({categoryName:name});
        const reupdate = await Category.updateOne(
            {categoryName: name},
            {$set: { is_delete:false }}
        );
        console.log(existingCategory);
        if (existingCategory) {
            message = "category already exists";
            res.redirect("/admin/categoryList");
            return;
          }

        //------- ADDING NEW CATEGORY --------//
        const category = new Category({
            categoryName:name,
            is_delete:false
        })
        const categoryData = await category.save();

        if(categoryData){
            message:"category is added"
            res.redirect("/admin/categoryList")
        }
        else{
            message:"Something went wrong!!"
            res.redirect('/admin/categoryList')
        }
    } catch (error) {
        console.log(error.message);
    }
}

     //------- DELETING CATEGORY --------//
const deleteCategory = async(req,res)=>{
    try {
       
        const categoryData = await Category.updateOne(
            { _id: req.query.id},
            {$set: {is_delete:true}}

        )
        res.redirect('/admin/categoryList')
    } catch (error) {
        console.log(error.message);
    }
};

  //------- EDIT CATEGORY --------//
const updateCategory = async(req,res)=>{
    try {
        
        const name = upperCase.upperCase(req.body.name)
        if(name.trim().length == 0){
            message = "category can't be blank"
            res.redirect("/admin/categoryList")
            return;
        }
        
        const existingCategory = await Category.findOne({categoryName:name});
        const reupdate = await Category.updateOne(
            {categoryName: name},
            {$set: { is_delete:false }}
        );
        if (existingCategory) {
            message = "category already exists";
            res.redirect("/admin/categoryList");
            return;
          }

      const catName = req.body.name
      const catId = req.body.id
      const updateCat = await Category.findOneAndUpdate({_id:catId},{$set:{categoryName:catName}})
      
      if(updateCat){
        res.redirect('/admin/categoryList')
      }else{
        res.redirect('/admin/categoryList')
      }
    } catch (error) {
        console.log(error.message);
    }
}
module.exports ={
    loadCategory,
    insertCategory,
    deleteCategory,
    updateCategory
}