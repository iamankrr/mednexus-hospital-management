// controllers/adminController.js - Admin Dashboard Controllers

const Hospital = require('../models/Hospital');
const Laboratory = require('../models/Laboratory');
const User = require('../models/User');
const Review = require('../models/Review');
const Contact = require('../models/Contact');

// ========== @desc    Get admin dashboard stats
// ========== @route   GET /api/admin/stats
// ========== @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalHospitals,
      totalLabs,
      totalUsers,
      totalReviews,
      pendingContacts,
      pendingReviews,
      activeUsers,
      approvedHospitals
    ] = await Promise.all([
      Hospital.countDocuments(),
      Laboratory.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Review.countDocuments(),
      Contact.countDocuments({ status: 'pending' }),
      Review.countDocuments({ isApproved: false }),
      User.countDocuments({ isActive: true }),
      Hospital.countDocuments({ isApproved: true })
    ]);

    // Recent activities
    const recentHospitals = await Hospital.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name address.city createdAt isApproved');

    const recentReviews = await Review.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name')
      .populate('hospital', 'name')
      .populate('laboratory', 'name');

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalHospitals,
          totalLabs,
          totalUsers,
          totalReviews,
          pendingContacts,
          pendingReviews,
          activeUsers,
          approvedHospitals
        },
        recentActivity: {
          hospitals: recentHospitals,
          reviews: recentReviews
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
};

// ========== @desc    Get all users
// ========== @route   GET /api/admin/users
// ========== @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const { role, status, search } = req.query;

    let filter = {};
    
    if (role) filter.role = role;
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;
    
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// ========== @desc    Update user role/status
// ========== @route   PUT /api/admin/users/:id
// ========== @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const { role, isActive, isVerified } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, isActive, isVerified },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// ========== @desc    Delete user
// ========== @route   DELETE /api/admin/users/:id
// ========== @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// ========== @desc    Get all contact requests
// ========== @route   GET /api/admin/contacts
// ========== @access  Private/Admin
exports.getAllContacts = async (req, res) => {
  try {
    const { status, type } = req.query;

    let filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const contacts = await Contact.find(filter)
      .populate('respondedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching contacts',
      error: error.message
    });
  }
};

// ========== @desc    Update contact request
// ========== @route   PUT /api/admin/contacts/:id
// ========== @access  Private/Admin
exports.updateContactRequest = async (req, res) => {
  try {
    const { status, adminNotes, priority } = req.body;

    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact request not found'
      });
    }

    if (status === 'resolved') {
      await contact.markAsResolved(req.user.id, adminNotes);
    } else if (status === 'rejected') {
      await contact.markAsRejected(req.user.id, adminNotes);
    } else {
      contact.status = status || contact.status;
      contact.priority = priority || contact.priority;
      contact.adminNotes = adminNotes || contact.adminNotes;
      await contact.save();
    }

    res.status(200).json({
      success: true,
      message: 'Contact request updated successfully',
      data: contact
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating contact request',
      error: error.message
    });
  }
};

// ========== @desc    Approve/Reject Hospital
// ========== @route   PUT /api/admin/hospitals/:id/approve
// ========== @access  Private/Admin
exports.approveHospital = async (req, res) => {
  try {
    const { isApproved } = req.body;

    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true }
    );

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Hospital ${isApproved ? 'approved' : 'rejected'} successfully`,
      data: hospital
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating hospital',
      error: error.message
    });
  }
};

// ========== @desc    Approve/Reject Laboratory
// ========== @route   PUT /api/admin/labs/:id/approve
// ========== @access  Private/Admin
exports.approveLaboratory = async (req, res) => {
  try {
    const { isApproved } = req.body;

    const lab = await Laboratory.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true }
    );

    if (!lab) {
      return res.status(404).json({
        success: false,
        message: 'Laboratory not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Laboratory ${isApproved ? 'approved' : 'rejected'} successfully`,
      data: lab
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating laboratory',
      error: error.message
    });
  }
};