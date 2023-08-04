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
        const categoryDatas = await Category.find({is_delete:false})
        
        if(name.trim().length == 0){
            res.render('categoryList',{category:categoryDatas,message:"invalid category"})
            return;
        }
        
        const existingCategory = await Category.findOne({categoryName:name});
       
        console.log(existingCategory);
        if (existingCategory) {
            res.render('categoryList',{category:categoryDatas,message:"category allready existing"})
            return;
          }

          const reupdate = await Category.updateOne(
            {categoryName: name},
            {$set: { is_delete:false }}
        );

        //------- ADDING NEW CATEGORY --------//
        const category = new Category({
            categoryName:name,
            is_delete:false
        })
        const categoryData = await category.save();

        if(categoryData){
            
            res.redirect("/admin/categoryList")
        }
        else{
           
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

        const categoryDatas = await Category.find({is_delete:false})
        const name = upperCase.upperCase(req.body.name)
        if(name.trim().length == 0){
            res.render('categoryList',{category:categoryDatas,message:"category can't be blank"})
            return;
        }
        
        const existingCategory = await Category.findOne({categoryName:name});
        const reupdate = await Category.updateOne(
            {categoryName: name},
            {$set: { is_delete:false }}
        );
        if (existingCategory) {
            res.render('categoryList',{category:categoryDatas,message:"category already exist"})
          }

      const catName = req.body.name
      const catId = req.body.id
      const updateCat = await Category.findOneAndUpdate({_id:catId},{$set:{categoryName:catName}})
      
      if(updateCat){
        res.redirect('/admin/categoryList')
      }else{
        res.render('categoryList',{category:categoryDatas,message:"something wrong"})
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