const express = require('express');
const router = express.Router();
const Laboratory = require('../models/Laboratory');
const { protect } = require('../middleware/authMiddleware');

// GET /api/labs - Get all labs with location-based sorting
router.get('/', async (req, res) => {
  try {
    const { type, city, state, pincode, lat, lng } = req.query;
    
    let query = { isActive: true };
    
    // Apply filters
    if (type && type !== 'all') query.type = type;
    if (city) query['address.city'] = new RegExp(city, 'i');
    if (state) query['address.state'] = new RegExp(state, 'i');
    if (pincode) query['address.pincode'] = pincode;

    let labs = await Laboratory.find(query)
      .populate('owner', 'name email phone'); // Changed to match hospital details

    // Sort by distance if lat/lng provided
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      
      console.log('📍 User location received (labs):', userLat, userLng);

      labs = labs.map(lab => {
        // Fallback for coordinates to prevent crashes if missing
        const coords = lab.location?.coordinates || [0, 0];
        const [labLng, labLat] = coords;
        
        // Haversine formula for distance
        const R = 6371; // Earth radius in km
        const dLat = (labLat - userLat) * Math.PI / 180;
        const dLng = (labLng - userLng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(userLat * Math.PI / 180) * Math.cos(labLat * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;

        return {
          ...lab.toObject(),
          distance: parseFloat(distance.toFixed(2))
        };
      }).sort((a, b) => a.distance - b.distance);
      
      console.log('📍 Sorted labs by distance');
      console.log('🎯 Nearest lab:', labs[0]?.name, '-', labs[0]?.distance, 'km');
    } else {
      // Default sort if no location is provided
      labs.sort((a, b) => b.createdAt - a.createdAt);
    }

    res.status(200).json({
      success: true,
      count: labs.length,
      data: labs
    });
  } catch (error) {
    console.error('Get labs error:', error);
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

    res.status(201).json({
      success: true,
      data: lab
    });
  } catch (error) {
    console.error('Create lab error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// PUT /api/labs/:id - Update lab
router.put('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    if (req.user.role === 'owner') {
      const User = require('../models/User');
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

    res.status(200).json({
      success: true,
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