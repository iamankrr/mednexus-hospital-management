// controllers/userController.js

const User = require('../models/User');
const jwt = require('jsonwebtoken');

// ========== Generate JWT Token ==========
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },                    // Payload (user ID)
    process.env.JWT_SECRET,            // Secret key
    { expiresIn: '30d' }               // Token 30 din tak valid
  );
};

// ========== @desc    Register new user
// ========== @route   POST /api/users/register
// ========== @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { phone }] });
    
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or phone'
      });
    }
    
    // Create user (password automatically encrypt hoga - pre-save middleware se)
    const user = await User.create({
      name,
      email,
      phone,
      password
    });
    
    // Generate token
    const token = generateToken(user._id);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token
      }
    });
    
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
};

    // ========== @desc    Login user
// ========== @route   POST /api/users/login
// ========== @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('📧 Login attempt for:', email);

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user (include password for comparison)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('✅ User found:', user.email);

    // Check if comparePassword method exists
    if (!user.comparePassword) {
      console.log('❌ comparePassword method not found!');
      return res.status(500).json({
        success: false,
        message: 'Authentication error'
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      console.log('❌ Password mismatch for:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('✅ Password matched!');

    // Check JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.log('❌ JWT_SECRET not found in environment!');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    console.log('✅ Token generated');

    // Remove password from response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      isVerified: user.isVerified
    };

    console.log('✅ Login successful for:', email, 'Role:', user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: token,
      data: userResponse
    });

  } catch (error) {
    console.error('❌ Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
 };

// ========== @desc    Get user profile
// ========== @route   GET /api/users/profile
// ========== @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    // req.user already set by auth middleware
    const user = await User.findById(req.user.id)
      .populate('bookings');
    
    res.status(200).json({
      success: true,
      data: user
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

// ========== @desc    Update user profile
// ========== @route   PUT /api/users/profile
// ========== @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    // Password update separately handle karo
    const { password, ...updateData } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};