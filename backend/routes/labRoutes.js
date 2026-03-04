const express = require('express');
const router = express.Router();
const Laboratory = require('../models/Laboratory');
const User = require('../models/User'); // ⬅️ Imported User model at top for ownership check
const { protect } = require('../middleware/authMiddleware');

// GET /api/labs - Get all labs with location-based sorting
router.get('/', async (req, res) => {
  try {
    // 🔥 FIX: Removed default maxDistance=50 parameter
    const { latitude, longitude, city, type, state, pincode, lat, lng, maxDistance } = req.query;
    console.log('📍 Lab request params:', { latitude, longitude, city, type, maxDistance });

    // Support both naming conventions (lat/lng vs latitude/longitude)
    const userLat = latitude || lat ? parseFloat(latitude || lat) : null;
    const userLng = longitude || lng ? parseFloat(longitude || lng) : null;
    
    let query = { isActive: true }; // ✅ Only active labs
    
    // Apply filters
    if (city && city !== 'All Cities') {
      query['address.city'] = new RegExp(city, 'i');
    }
    if (type && type !== 'all' && type !== 'All Types') {
      query.type = type;
    }
    if (state) {
      query['address.state'] = new RegExp(state, 'i');
    }
    if (pincode) {
      query['address.pincode'] = pincode;
    }

    // Fetch all labs
    let labs = await Laboratory.find(query)
      .populate('owner', 'name email phone')
      .select('-__v')
      .lean(); // ✅ Faster queries by returning plain JS objects

    // Calculate distance if user location provided
    if (userLat && userLng) {
      console.log('📍 User location:', { userLat, userLng });

      labs = labs.map(lab => {
        if (lab.location && lab.location.coordinates) {
          const [labLng, labLat] = lab.location.coordinates;
          
          // Haversine formula
          const R = 6371; // Earth's radius in km
          const dLat = (labLat - userLat) * Math.PI / 180;
          const dLon = (labLng - userLng) * Math.PI / 180;
          const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(userLat * Math.PI / 180) * Math.cos(labLat * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = R * c;

          return {
            ...lab,
            distance: Math.round(distance * 10) / 10 // Round to 1 decimal
          };
        }
        return lab;
      });

      // 🔥 FIX: Only filter by distance IF maxDistance was explicitly provided in the query
      if (maxDistance) {
        const maxDistanceKm = parseFloat(maxDistance);
        labs = labs.filter(l => !l.distance || l.distance <= maxDistanceKm);
      }

      // Sort by distance (nearest first)
      labs.sort((a, b) => {
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
      });

      console.log(`✅ Calculated distances for ${labs.length} labs`);
    } else {
      console.log('⚠️ No user location - showing all labs');
    }

    res.status(200).json({
      success: true,
      count: labs.length,
      data: labs
    });
  } catch (error) {
    console.error('❌ Get labs error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// GET /api/labs/:id - Get single lab
router.get('/:id', async (req, res) => {
  try {
    const lab = await Laboratory.findById(req.params.id)
      .populate('owner', 'name email phone');

    if (!lab) {
      return res.status(404).json({
        success: false,
        message: 'Laboratory not found'
      });
    }

    res.status(200).json({
      success: true,
      data: lab
    });
  } catch (error) {
    console.error('Get lab error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// POST /api/labs - Create lab (Admin only)
router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin only' 
      });
    }

    const lab = await Laboratory.create(req.body);
    console.log('✅ Laboratory created:', lab.name);

    res.status(201).json({
      success: true,
      data: lab
    });
  } catch (error) {
    console.error('Create lab error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: messages.join(', ') 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// PUT /api/labs/:id - Update lab
router.put('/:id', protect, async (req, res) => {
  try {
    console.log('📝 Update request for lab:', req.params.id);

    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    if (req.user.role === 'owner') {
      const user = await User.findById(req.user.id);
      if (user.ownerProfile?.facilityId?.toString() !== req.params.id) {
        return res.status(403).json({ 
          success: false, 
          message: 'Not your facility' 
        });
      }
    }

    const lab = await Laboratory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!lab) {
      return res.status(404).json({
        success: false,
        message: 'Laboratory not found'
      });
    }

    console.log('✅ Laboratory updated successfully');

    res.status(200).json({
      success: true,
      message: 'Laboratory updated successfully',
      data: lab
    });
  } catch (error) {
    console.error('Update lab error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// DELETE /api/labs/:id - Delete lab (Admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin only' 
      });
    }

    const lab = await Laboratory.findByIdAndDelete(req.params.id);

    if (!lab) {
      return res.status(404).json({
        success: false,
        message: 'Laboratory not found'
      });
    }

    console.log('✅ Laboratory deleted');

    res.status(200).json({
      success: true,
      message: 'Laboratory deleted'
    });
  } catch (error) {
    console.error('Delete lab error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;