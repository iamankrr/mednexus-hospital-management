// routes/adminRoutes.js - Admin Routes

const express = require('express');
const router = express.Router();
const Hospital = require('../models/Hospital');
const Laboratory = require('../models/Laboratory');
const User = require('../models/User');
const Review = require('../models/Review');
const Contact = require('../models/Contact');
const FacilitySubmission = require('../models/FacilitySubmission');

// ✅ FIXED: Imported 'admin' instead of 'adminOnly'
const { protect, admin } = require('../middleware/authMiddleware');
const { searchPlaces, getPlaceDetails } = require('../services/googlePlaces');

// ========== @desc    Get all hospitals for admin (Missing Route added)
// ========== @route   GET /api/admin/hospitals
// ========== @access  Private/Admin
router.get('/hospitals', protect, admin, async (req, res) => {
  try {
    const hospitals = await Hospital.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: hospitals.length,
      data: hospitals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ========== @desc    Get all labs for admin (Missing Route added)
// ========== @route   GET /api/admin/labs
// ========== @access  Private/Admin
router.get('/labs', protect, admin, async (req, res) => {
  try {
    const labs = await Laboratory.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: labs.length,
      data: labs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ========== @desc    Get admin stats
// ========== @route   GET /api/admin/stats
// ========== @access  Private/Admin
router.get('/stats', protect, admin, async (req, res) => {
  try {
    const totalHospitals = await Hospital.countDocuments();
    const totalLabs = await Laboratory.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalReviews = await Review.countDocuments();
    const pendingApprovals = await Hospital.countDocuments({ isApproved: false }) + 
                             await Laboratory.countDocuments({ isApproved: false });

    res.status(200).json({
      success: true,
      data: {
        totalHospitals,
        totalLabs,
        totalUsers,
        totalReviews,
        pendingApprovals
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching stats',
      error: error.message
    });
  }
});

// ========== @desc    Approve/Reject Hospital (UPDATED FIX)
// ========== @route   PUT /api/admin/hospitals/:id/approve
// ========== @access  Private/Admin
router.put('/hospitals/:id/approve', protect, admin, async (req, res) => {
  try {
    // Determine if we are approving (true) or rejecting/revoking (false)
    const { isApproved } = req.body; 

    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      { 
        isApproved: isApproved, // Map to existing frontend field
        isVerified: isApproved, // ✅ Mark as verified based on payload
        isActive: isApproved    // ✅ Make it active/visible based on payload
      },
      { new: true }
    );
    
    if (!hospital) {
      return res.status(404).json({ 
        success: false, 
        message: 'Hospital not found' 
      });
    }

    console.log(`✅ Hospital ${isApproved ? 'approved' : 'rejected'}:`, hospital.name);
    
    res.status(200).json({
      success: true,
      message: `Hospital ${isApproved ? 'approved and activated' : 'rejected and deactivated'}`,
      data: hospital
    });
  } catch (error) {
    console.error('❌ Approve error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ========== @desc    Approve/Reject Laboratory (UPDATED FIX)
// ========== @route   PUT /api/admin/labs/:id/approve
// ========== @access  Private/Admin
router.put('/labs/:id/approve', protect, admin, async (req, res) => {
  try {
     // Determine if we are approving (true) or rejecting/revoking (false)
    const { isApproved } = req.body;

    const lab = await Laboratory.findByIdAndUpdate(
      req.params.id,
      { 
        isApproved: isApproved, // Map to existing frontend field
        isVerified: isApproved, // ✅ Mark as verified
        isActive: isApproved    // ✅ Make it active/visible
      },
      { new: true }
    );
    
    if (!lab) {
      return res.status(404).json({ 
        success: false, 
        message: 'Laboratory not found' 
      });
    }

    console.log(`✅ Laboratory ${isApproved ? 'approved' : 'rejected'}:`, lab.name);
    
    res.status(200).json({
      success: true,
      message: `Laboratory ${isApproved ? 'approved and activated' : 'rejected and deactivated'}`,
      data: lab
    });
  } catch (error) {
    console.error('❌ Approve error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ========== @desc    Activate/Deactivate User
// ========== @route   PUT /api/admin/users/:id/status
// ========== @access  Private/Admin
router.put('/users/:id/status', protect, admin, async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify admin users'
      });
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user status',
      error: error.message
    });
  }
});

// ========== @desc    Delete User
// ========== @route   DELETE /api/admin/users/:id
// ========== @access  Private/Admin
router.delete('/users/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }

    await user.deleteOne();

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
});

// ========== @desc    Approve/Reject Review
// ========== @route   PUT /api/admin/reviews/:id/approve
// ========== @access  Private/Admin
router.put('/reviews/:id/approve', protect, admin, async (req, res) => {
  try {
    const { isApproved } = req.body;
    
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.isApproved = isApproved;
    await review.save();

    res.status(200).json({
      success: true,
      message: `Review ${isApproved ? 'approved' : 'rejected'} successfully`,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating review approval status',
      error: error.message
    });
  }
});

// ========== @desc    Delete Review
// ========== @route   DELETE /api/admin/reviews/:id
// ========== @access  Private/Admin
router.delete('/reviews/:id', protect, admin, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting review',
      error: error.message
    });
  }
});

// ========== @desc    Update Contact Request Status
// ========== @route   PUT /api/admin/contacts/:id/status
// ========== @access  Private/Admin
router.put('/contacts/:id/status', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;
    
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact request not found'
      });
    }

    contact.status = status;
    await contact.save();

    res.status(200).json({
      success: true,
      message: 'Contact status updated successfully',
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating contact status',
      error: error.message
    });
  }
});

// ========== @desc    Delete Contact Request
// ========== @route   DELETE /api/admin/contacts/:id
// ========== @access  Private/Admin
router.delete('/contacts/:id', protect, admin, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact request not found'
      });
    }

    await contact.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Contact request deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting contact request',
      error: error.message
    });
  }
});

// ========== @desc    Fetch Google rating for single place
// ========== @route   POST /api/admin/fetch-google-rating
// ========== @access  Private/Admin
router.post('/fetch-google-rating', protect, admin, async (req, res) => {
  try {
    const { placeId } = req.body;

    if (!placeId) {
      return res.status(400).json({
        success: false,
        message: 'Place ID is required'
      });
    }

    const result = await getPlaceDetails(placeId);

    if (result.success !== false) {
      res.status(200).json({
        success: true,
        data: result
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching Google rating',
      error: error.message
    });
  }
});

// ========== @desc    Update Google ratings for all hospitals/labs
// ========== @route   POST /api/admin/update-google-ratings
// ========== @access  Private/Admin
router.post('/update-google-ratings', protect, admin, async (req, res) => {
  try {
    const googlePlaces = require('../services/googlePlaces');
    
    const result = await googlePlaces.updateAllGoogleRatings();
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
        count: result.count
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating Google ratings',
      error: error.message
    });
  }
});

// ========== @desc    Manually trigger scheduled update
// ========== @route   POST /api/admin/trigger-update
// ========== @access  Private/Admin
router.post('/trigger-update', protect, admin, async (req, res) => {
  try {
    const { updateGoogleRatings } = require('../services/scheduler');
    
    res.status(200).json({
      success: true,
      message: 'Update triggered! Running in background...'
    });

    // Run in background
    updateGoogleRatings();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error triggering update',
      error: error.message
    });
  }
});

// ==========================================
//          OWNER MANAGEMENT ROUTES 
// ==========================================

// GET /api/admin/owners - Get all owners
router.get('/owners', protect, admin, async (req, res) => {
  try {
    const owners = await User.find({
      $or: [
        { role: 'owner' },
        { 'ownerProfile.facilityId': { $exists: true } }
      ]
    }).select('-password').sort({ createdAt: -1 });

    const ownersWithDetails = await Promise.all(
      owners.map(async (owner) => {
        const ownerObj = owner.toObject();
        
        if (owner.ownerProfile?.facilityId) {
          try {
            const Model = owner.ownerProfile.facilityType === 'hospital' ? Hospital : Laboratory;
            const facility = await Model.findById(owner.ownerProfile.facilityId);
            ownerObj.facilityDetails = facility ? {
              _id: facility._id,
              name: facility.name,
              address: facility.address
            } : null;
          } catch (err) {
            console.error('Facility fetch error:', err);
          }
        }
        
        return ownerObj;
      })
    );

    console.log('✅ Fetched owners:', ownersWithDetails.length);
    
    res.status(200).json({
      success: true,
      count: ownersWithDetails.length,
      data: ownersWithDetails
    });
  } catch (error) {
    console.error('❌ Get owners error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ===== GET OWNER DETAILS (Admin) =====
router.get('/owners/:id', protect, admin, async (req, res) => {
  try {
    const owner = await User.findById(req.params.id).select('-password');

    if (!owner || (!owner.ownerProfile?.facilityId && owner.role !== 'owner')) {
      return res.status(404).json({
        success: false,
        message: 'Owner not found'
      });
    }

    const ownerObj = owner.toObject();

    if (owner.ownerProfile?.facilityId) {
      const Model = owner.ownerProfile.facilityType === 'hospital' ? Hospital : Laboratory;
      const facility = await Model.findById(owner.ownerProfile.facilityId)
        .select('name type category address phone email');
      
      ownerObj.facilityDetails = facility;
    }

    res.status(200).json({
      success: true,
      data: ownerObj
    });

  } catch (error) {
    console.error('❌ Get owner error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ===== APPROVE OWNER =====
router.put('/owners/:id/approve', protect, admin, async (req, res) => {
  try {
    const owner = await User.findById(req.params.id);
    
    if (!owner || owner.role !== 'owner') {
      return res.status(404).json({
        success: false,
        message: 'Owner not found'
      });
    }

    // Approve owner
    owner.isActive = true;
    owner.ownerProfile.isVerified = true;
    await owner.save();

    // Link owner to facility
    const Model = owner.ownerProfile.facilityType === 'hospital' ? Hospital : Laboratory;
    await Model.findByIdAndUpdate(owner.ownerProfile.facilityId, {
      owner: owner._id,
      appointmentsEnabled: true
    });

    console.log('✅ Owner approved:', owner.email);

    res.status(200).json({
      success: true,
      message: 'Owner approved successfully',
      data: owner
    });
  } catch (error) {
    console.error('❌ Approve owner error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// PUT /api/admin/owners/:id/reject - Reject owner
router.put('/owners/:id/reject', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Remove owner link from facility first before deleting profile
    if (user.ownerProfile?.facilityId) {
      const Model = user.ownerProfile.facilityType === 'hospital' ? Hospital : Laboratory;
      await Model.findByIdAndUpdate(user.ownerProfile.facilityId, { owner: null });
    }

    // Remove owner profile and revert to user
    user.role = 'user';
    user.ownerProfile = undefined;
    await user.save();

    console.log('❌ Owner rejected:', user.email);
    
    res.status(200).json({
      success: true,
      message: 'Owner application rejected',
      data: user
    });
  } catch (error) {
    console.error('❌ Reject owner error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ==========================================
//        NEW ROUTES: REMOVE & CHANGE OWNER
// ==========================================

// ===== REMOVE OWNER FROM FACILITY =====
router.put('/owners/:id/remove-facility', protect, admin, async (req, res) => {
  try {
    const owner = await User.findById(req.params.id);
    if (!owner || owner.role !== 'owner') {
      return res.status(404).json({ 
        success: false, 
        message: 'Owner not found' 
      });
    }

    const facilityType = owner.ownerProfile.facilityType;
    const facilityId = owner.ownerProfile.facilityId;

    if (!facilityId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Owner does not have a linked facility' 
      });
    }

    // Remove owner from facility
    const Model = facilityType === 'hospital' ? Hospital : Laboratory;
    await Model.findByIdAndUpdate(facilityId, {
      owner: null,
      appointmentsEnabled: false
    });

    // Clear owner profile
    owner.ownerProfile.facilityId = null;
    owner.isActive = false;
    await owner.save();

    console.log(`✅ Owner ${owner.email} removed from facility ${facilityId}`);

    res.status(200).json({
      success: true,
      message: 'Owner removed from facility'
    });
  } catch (error) {
    console.error('❌ Remove owner error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ===== CHANGE OWNER =====
router.put('/facilities/:type/:id/change-owner', protect, admin, async (req, res) => {
  try {
    const { newOwnerEmail } = req.body;
    const { type, id } = req.params;

    if (!newOwnerEmail) {
      return res.status(400).json({ 
        success: false, 
        message: 'New owner email is required' 
      });
    }

    // Find new owner
    const newOwner = await User.findOne({ email: newOwnerEmail, role: 'owner' });
    if (!newOwner) {
      return res.status(404).json({ 
        success: false, 
        message: 'Owner not found with this email' 
      });
    }

    if (newOwner.ownerProfile?.facilityId) {
      return res.status(400).json({ 
        success: false, 
        message: 'This owner already has a facility' 
      });
    }

    // Find facility
    const Model = type === 'hospital' ? Hospital : Laboratory;
    const facility = await Model.findById(id);
    if (!facility) {
      return res.status(404).json({ 
        success: false, 
        message: 'Facility not found' 
      });
    }

    // Remove old owner
    if (facility.owner) {
      await User.findByIdAndUpdate(facility.owner, {
        'ownerProfile.facilityId': null,
        isActive: false
      });
      console.log(`Removed old owner ${facility.owner} from facility ${id}`);
    }

    // Assign new owner
    facility.owner = newOwner._id;
    facility.appointmentsEnabled = true;
    await facility.save();

    newOwner.ownerProfile.facilityId = facility._id;
    newOwner.ownerProfile.facilityType = type;
    newOwner.isActive = true;
    await newOwner.save();

    console.log(`✅ Changed owner for facility ${id} to ${newOwnerEmail}`);

    res.status(200).json({
      success: true,
      message: 'Owner changed successfully'
    });
  } catch (error) {
    console.error('❌ Change owner error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ==========================================
//        TOGGLE APPOINTMENTS ROUTES
// ==========================================

// ===== TOGGLE APPOINTMENTS FOR HOSPITAL =====
router.put('/hospitals/:id/toggle-appointments', protect, admin, async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    
    if (!hospital) {
      return res.status(404).json({ 
        success: false, 
        message: 'Hospital not found' 
      });
    }
    
    if (!hospital.owner) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot enable appointments - no owner assigned' 
      });
    }

    // Toggle
    hospital.appointmentsEnabled = !hospital.appointmentsEnabled;
    await hospital.save();
    
    console.log('✅ Appointments', hospital.appointmentsEnabled ? 'enabled' : 'disabled', 'for:', hospital.name);
    
    res.status(200).json({
      success: true,
      message: `Appointments ${hospital.appointmentsEnabled ? 'enabled' : 'disabled'}`,
      data: hospital
    });
  } catch (error) {
    console.error('❌ Toggle appointments error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ===== TOGGLE APPOINTMENTS FOR LAB =====
router.put('/labs/:id/toggle-appointments', protect, admin, async (req, res) => {
  try {
    const lab = await Laboratory.findById(req.params.id);
    
    if (!lab) {
      return res.status(404).json({ 
        success: false, 
        message: 'Laboratory not found' 
      });
    }
    
    if (!lab.owner) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot enable appointments - no owner assigned' 
      });
    }

    // Toggle
    lab.appointmentsEnabled = !lab.appointmentsEnabled;
    await lab.save();
    
    console.log('✅ Appointments', lab.appointmentsEnabled ? 'enabled' : 'disabled', 'for:', lab.name);
    
    res.status(200).json({
      success: true,
      message: `Appointments ${lab.appointmentsEnabled ? 'enabled' : 'disabled'}`,
      data: lab
    });
  } catch (error) {
    console.error('❌ Toggle appointments error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ===== SEARCH GOOGLE PLACES =====
router.post('/search-places', protect, admin, async (req, res) => {
  try {
    const { query, type, location } = req.body;

    if (!query) {
      return res.status(400).json({ 
        success: false, 
        message: 'Search query required' 
      });
    }

    console.log('🔍 Admin searching places:', query);
    if (location) {
      console.log('📍 With location:', location);
    }

    const places = await searchPlaces(query, type, location);

    res.status(200).json({
      success: true,
      count: places.length,
      data: places
    });

  } catch (error) {
    console.error('❌ Search places error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ===== FETCH PLACE DETAILS =====
router.post('/fetch-place-details', protect, admin, async (req, res) => {
  try {
    const { placeId } = req.body;

    if (!placeId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Place ID required' 
      });
    }

    console.log('📍 Fetching place details:', placeId);

    const placeDetails = await getPlaceDetails(placeId);

    res.status(200).json({
      success: true,
      data: placeDetails
    });

  } catch (error) {
    console.error('❌ Fetch place details error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ===== GET ALL SUBMISSIONS (Admin) =====
router.get('/submissions', protect, admin, async (req, res) => {
  try {
    const { status } = req.query;
    
    const query = status ? { status } : {};

    const submissions = await FacilitySubmission.find(query)
      .populate('submittedBy', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });

  } catch (error) {
    console.error('❌ Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ===== APPROVE SUBMISSION & CREATE FACILITY (Admin) =====
router.post('/submissions/:id/approve', protect, admin, async (req, res) => {
  try {
    const submission = await FacilitySubmission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    if (submission.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Submission already reviewed'
      });
    }

    // Get complete facility data from request body (admin fills)
    const facilityData = req.body.facilityData;

    if (!facilityData) {
      return res.status(400).json({
        success: false,
        message: 'Facility data required'
      });
    }

    // Create the actual facility
    const Model = submission.facilityType === 'hospital' 
      ? require('../models/Hospital')
      : require('../models/Laboratory');

    const facility = await Model.create({
      ...facilityData,
      name: submission.name,
      address: submission.address,
      phone: submission.phone || facilityData.phone,
      email: submission.email || facilityData.email,
      isActive: true
    });

    // Update submission
    submission.status = 'approved';
    submission.reviewedBy = req.user.id;
    submission.reviewedAt = new Date();
    submission.approvedFacilityId = facility._id;

    await submission.save();

    console.log('✅ Submission approved and facility created:', facility.name);

    res.status(200).json({
      success: true,
      message: 'Facility approved and created',
      data: {
        submission,
        facility
      }
    });

  } catch (error) {
    console.error('❌ Approve submission error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ===== REJECT SUBMISSION (Admin) =====
router.post('/submissions/:id/reject', protect, admin, async (req, res) => {
  try {
    const { reason } = req.body;

    const submission = await FacilitySubmission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    if (submission.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Submission already reviewed'
      });
    }

    submission.status = 'rejected';
    submission.rejectionReason = reason || 'Does not meet requirements';
    submission.reviewedBy = req.user.id;
    submission.reviewedAt = new Date();

    await submission.save();

    console.log('❌ Submission rejected:', submission.name);

    res.status(200).json({
      success: true,
      message: 'Submission rejected',
      data: submission
    });

  } catch (error) {
    console.error('❌ Reject submission error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ===== CREATE HOSPITAL WITH OWNER (Admin) =====
router.post('/create-hospital-with-owner', protect, admin, async (req, res) => {
  try {
    const { hospitalData, createOwner, ownerData } = req.body;

    console.log('🏥 Creating hospital with owner option:', createOwner);

    // Validation
    if (!hospitalData.name || !hospitalData.type) {
      return res.status(400).json({
        success: false,
        message: 'Hospital name and type are required'
      });
    }

    // Create hospital first
    const hospital = await Hospital.create(hospitalData);
    console.log('✅ Hospital created:', hospital.name);

    let owner = null;

    // Create owner if requested
    if (createOwner && ownerData) {
      // Validate owner data
      if (!ownerData.name || !ownerData.email || !ownerData.password || !ownerData.phone) {
        // Delete hospital if owner creation will fail
        await Hospital.findByIdAndDelete(hospital._id);
        return res.status(400).json({
          success: false,
          message: 'All owner fields are required'
        });
      }

      // Check if email already exists
      const existingUser = await User.findOne({ email: ownerData.email });
      if (existingUser) {
        await Hospital.findByIdAndDelete(hospital._id);
        return res.status(400).json({
          success: false,
          message: 'Email already registered. Please use a different email.'
        });
      }

      // Create owner user
      owner = await User.create({
        name: ownerData.name,
        email: ownerData.email,
        password: ownerData.password, // Will be hashed by pre-save hook
        phone: ownerData.phone,
        role: 'owner',
        isActive: true,
        ownerProfile: {
          facilityType: 'hospital',
          facilityId: hospital._id,
          isVerified: true // Auto-verified since admin created
        }
      });

      // Link owner to hospital
      hospital.owner = owner._id;
      await hospital.save();
      
      console.log('✅ Owner created and linked:', owner.email);
    }

    res.status(201).json({
      success: true,
      message: createOwner 
        ? 'Hospital and owner created successfully' 
        : 'Hospital created successfully',
      data: {
        hospital,
        owner: owner ? {
          _id: owner._id,
          name: owner.name,
          email: owner.email,
          phone: owner.phone
        } : null
      }
    });

  } catch (error) {
    console.error('❌ Create hospital with owner error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ===== CREATE LAB WITH OWNER (Admin) =====
router.post('/create-lab-with-owner', protect, admin, async (req, res) => {
  try {
    // frontend bhej raha hai labData (AddLab.jsx check karein)
    const { labData, createOwner, ownerData } = req.body;

    console.log('🔬 Creating lab with owner option:', createOwner);

    // Validation
    if (!labData.name) {
      return res.status(400).json({
        success: false,
        message: 'Lab name is required'
      });
    }

    // Create lab first
    const lab = await Laboratory.create(labData);
    console.log('✅ Lab created:', lab.name);

    let owner = null;

    // Create owner if requested
    if (createOwner && ownerData) {
      // Validate owner data
      if (!ownerData.name || !ownerData.email || !ownerData.password || !ownerData.phone) {
        await Laboratory.findByIdAndDelete(lab._id);
        return res.status(400).json({
          success: false,
          message: 'All owner fields are required'
        });
      }

      // Check if email already exists
      const existingUser = await User.findOne({ email: ownerData.email });
      if (existingUser) {
        await Laboratory.findByIdAndDelete(lab._id);
        return res.status(400).json({
          success: false,
          message: 'Email already registered. Please use a different email.'
        });
      }

      // Create owner user
      owner = await User.create({
        name: ownerData.name,
        email: ownerData.email,
        password: ownerData.password,
        phone: ownerData.phone,
        role: 'owner',
        isActive: true,
        ownerProfile: {
          facilityType: 'laboratory',
          facilityId: lab._id,
          isVerified: true
        }
      });

      // Link owner to lab
      lab.owner = owner._id;
      await lab.save();
      
      console.log('✅ Owner created and linked:', owner.email);
    }

    res.status(201).json({
      success: true,
      message: createOwner 
        ? 'Laboratory and owner created successfully' 
        : 'Laboratory created successfully',
      data: {
        lab,
        owner: owner ? {
          _id: owner._id,
          name: owner.name,
          email: owner.email,
          phone: owner.phone
        } : null
      }
    });

  } catch (error) {
    console.error('❌ Create lab with owner error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ===== ASSIGN OWNER TO EXISTING FACILITY (Admin) =====
router.post('/assign-owner', protect, admin, async (req, res) => {
  try {
    const { facilityId, facilityType, ownerData } = req.body;

    console.log('👤 Assigning owner to facility:', facilityId);

    // Validation
    if (!facilityId || !facilityType || !ownerData) {
      return res.status(400).json({
        success: false,
        message: 'Facility ID, type, and owner data are required'
      });
    }

    if (!ownerData.name || !ownerData.email || !ownerData.password || !ownerData.phone) {
      return res.status(400).json({
        success: false,
        message: 'All owner fields are required'
      });
    }

    // Get facility
    const Model = facilityType === 'hospital' ? Hospital : Laboratory;
    const facility = await Model.findById(facilityId);

    if (!facility) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found'
      });
    }

    // Check if facility already has owner
    if (facility.owner) {
      return res.status(400).json({
        success: false,
        message: 'This facility already has an owner assigned'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: ownerData.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please use a different email.'
      });
    }

    // Create owner user
    const owner = await User.create({
      name: ownerData.name,
      email: ownerData.email,
      password: ownerData.password,
      phone: ownerData.phone,
      role: 'owner',
      isActive: true,
      ownerProfile: {
        facilityType,
        facilityId: facility._id,
        isVerified: true // Auto-verified since admin assigned
      }
    });

    // Link owner to facility
    facility.owner = owner._id;
    await facility.save();

    console.log('✅ Owner assigned successfully:', owner.email);

    res.status(200).json({
      success: true,
      message: 'Owner assigned successfully',
      data: {
        owner: {
          _id: owner._id,
          name: owner.name,
          email: owner.email,
          phone: owner.phone
        },
        facility: {
          _id: facility._id,
          name: facility.name
        }
      }
    });

  } catch (error) {
    console.error('❌ Assign owner error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ===== REMOVE OWNER FROM FACILITY (Old logic kept for backward compatibility if used) =====
router.post('/remove-owner', protect, admin, async (req, res) => {
  try {
    const { facilityId, facilityType } = req.body;

    const Model = facilityType === 'hospital' ? Hospital : Laboratory;
    const facility = await Model.findById(facilityId);

    if (!facility || !facility.owner) {
      return res.status(404).json({
        success: false,
        message: 'Facility or owner not found'
      });
    }

    // Remove owner from user
    await User.findByIdAndUpdate(facility.owner, {
      $unset: { ownerProfile: 1 },
      role: 'user'
    });

    // Remove owner from facility
    facility.owner = null;
    facility.appointmentsEnabled = false;
    await facility.save();

    console.log('✅ Owner removed from facility');

    res.status(200).json({
      success: true,
      message: 'Owner removed successfully'
    });

  } catch (error) {
    console.error('❌ Remove owner error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;