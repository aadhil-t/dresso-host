const errorHandler = async(err,req,res,next)=>{
    console.log(err);
    res.render('error')
}



module.exports = errorHandler