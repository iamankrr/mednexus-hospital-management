// config/cloudinary.js - Cloudinary Configuration

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Hospital Images Storage
const hospitalStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'hospital-finder/hospitals',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 600, crop: 'fill', quality: 'auto' }
    ]
  }
});

// Lab Images Storage
const labStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'hospital-finder/labs',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 600, crop: 'fill', quality: 'auto' }
    ]
  }
});

// Profile Images Storage
const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'hospital-finder/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 200, height: 200, crop: 'fill', quality: 'auto' }
    ]
  }
});

// File filter - only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Upload handlers
const uploadHospitalImage = multer({
  storage: hospitalStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

const uploadLabImage = multer({
  storage: labStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadProfileImage = multer({
  storage: profileStorage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

module.exports = {
  cloudinary,
  uploadHospitalImage,
  uploadLabImage,
  uploadProfileImage
};