const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { cloudinary, uploadHospitalImage, uploadLabImage } = require('../config/cloudinary');

// Upload single image for hospital
router.post('/image', protect, uploadHospitalImage.single('image'), async (req, res) => {
  try {
    console.log('📤 Upload request from user:', req.user?.email);
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    console.log('✅ Image uploaded to Cloudinary:', req.file.path);

    res.status(200).json({
      success: true,
      url: req.file.path,
      public_id: req.file.filename
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Upload failed' 
    });
  }
});

// Upload multiple images for hospital
router.post('/images', protect, uploadHospitalImage.array('images', 10), async (req, res) => {
  try {
    console.log('📤 Multiple images upload from:', req.user?.email);
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const urls = req.files.map(file => ({
      url: file.path,
      public_id: file.filename
    }));

    console.log(`✅ ${urls.length} images uploaded to Cloudinary`);

    res.status(200).json({
      success: true,
      count: urls.length,
      data: urls
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Upload failed' 
    });
  }
});

// ✅ UPDATED: Upload lab image with logs
router.post('/lab/image', protect, uploadLabImage.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    console.log('✅ Lab image uploaded:', req.file.path);

    res.status(200).json({
      success: true,
      url: req.file.path,
      public_id: req.file.filename
    });
  } catch (error) {
    console.error('❌ Lab upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Upload failed' 
    });
  }
});

// Delete image from Cloudinary
router.delete('/image/:public_id', protect, async (req, res) => {
  try {
    const publicId = req.params.public_id.replace(/_/g, '/');
    
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      res.status(200).json({ success: true, message: 'Image deleted' });
    } else {
      res.status(400).json({ success: false, message: 'Failed to delete image' });
    }
  } catch (error) {
    console.error('❌ Delete error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Delete failed' 
    });
  }
});

module.exports = router;