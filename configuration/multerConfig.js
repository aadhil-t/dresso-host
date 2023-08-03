// Import necessary modules
const multer = require('multer');
const path = require('path');

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/adminAssets/adminImage'));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + '-' + file.originalname;
    cb(null, name);
  },
});

const imageFilter = function (req, file, cb) {
  if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/)) {
    req.fileValidationerror = 'Only image files are allowed!';
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

    const upload = multer({storage:storage,fileFilter:imageFilter})

    module.exports={
        upload,
    }