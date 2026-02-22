const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Models & Middleware
const User = require('../models/User');
const Hospital = require('../models/Hospital');     // ✅ Imported Hospital Model
const Laboratory = require('../models/Laboratory'); // ✅ Imported Laboratory Model
const { protect } = require('../middleware/authMiddleware');

// ==========================================
//                 LOGIN
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 Login attempt:', email);

    // 1. Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // 2. Find user with password field (Yahan +password zaroori hai hash match ke liye)
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // 3. Match password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    
    if (!isPasswordMatch) {
      console.log('❌ Password mismatch for:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // 4. ✅ NEW: Check if user is active / Owner approval check
    if (!user.isActive) {
      if (user.role === 'owner') {
        console.log('⏳ Owner login attempt but pending approval:', email);
        return res.status(403).json({
          success: false,
          message: 'Approval pending. Please wait for admin confirmation.',
          isPending: true
        });
      }
      console.log('❌ Deactivated account login attempt:', email);
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    console.log('✅ Login successful:', email, 'Role:', user.role);

    // 5. Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // 6. Send response without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      ownerProfile: user.ownerProfile
    };

    res.status(200).json({
      success: true,
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// ==========================================
//               REGISTER
// ==========================================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log('📝 Registration attempt:', email);

    // 1. Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // 2. Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user', // Default role
      isActive: true
    });

    console.log('✅ User registered:', email);

    // 5. Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // 6. Response without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    };

    res.status(201).json({
      success: true,
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// ==========================================
//        REGISTER AS OWNER (NEW)
// ==========================================
router.post('/register-owner', async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      phone, 
      facilityType, 
      facilityId,
      personalDetails,
      internalInfo
    } = req.body;

    console.log('📝 Owner Registration attempt:', email);

    // Check if facility already has owner
    const Model = facilityType === 'hospital' ? Hospital : Laboratory;
    const facility = await Model.findById(facilityId);
    
    if (!facility) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found'
      });
    }

    if (facility.owner) {
      return res.status(400).json({
        success: false,
        message: 'This facility already has an owner'
      });
    }

    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // ✅ Hash password before saving (Ensures consistency with standard register)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create owner (pending approval)
    const owner = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'owner', // Still 'owner' but marked inactive/unverified until admin approval
      isActive: false, // Not active until admin approves
      ownerProfile: {
        facilityType,
        facilityId,
        isVerified: false,
        personalDetails,
        internalInfo
      }
    });

    console.log('✅ Owner Registration submitted:', owner.email);

    res.status(201).json({
      success: true,
      message: 'Registration submitted successfully. Awaiting admin approval.',
      data: {
        _id: owner._id,
        name: owner.name,
        email: owner.email
      }
    });
  } catch (error) {
    console.error('❌ Owner Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==========================================
//   GET FACILITIES WITHOUT OWNER (NEW)
// ==========================================
router.get('/facilities-without-owner/:type', async (req, res) => {
  try {
    const { type } = req.params;
    
    // Ensure correct Model is selected
    if (type !== 'hospital' && type !== 'laboratory') {
      return res.status(400).json({
        success: false,
        message: 'Invalid facility type'
      });
    }

    const Model = type === 'hospital' ? Hospital : Laboratory;
    
    // Find active facilities with no owner assigned
    const facilities = await Model.find({ 
      owner: null,
      isActive: true
    }).select('name address type');

    res.status(200).json({
      success: true,
      data: facilities
    });
  } catch (error) {
    console.error('❌ Fetch facilities without owner error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==========================================
//            GET CURRENT USER (/me)
// ==========================================
// ✅ UPDATED WITH PROPER LOGS
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
        
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ Get current user:', user.email, 'Role:', user.role);
    
    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==========================================
//            GET / UPDATE PROFILE
// ==========================================

// Get user profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update user profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;
    
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==========================================
//            CHANGE PASSWORD
// ==========================================
router.put('/change-password', protect, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Old password is incorrect'
      });
    }

    // Hash and update new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    console.log('✅ Password changed successfully for:', user.email);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;