const express = require('express');
const router = express.Router();
const Hospital = require('../models/Hospital'); // ⬅️ Import Model
const User = require('../models/User');         // ⬅️ Import User model for ownership check
const { protect } = require('../middleware/authMiddleware');

const {
  getHospitalById,
  searchHospitals,
  getNearbyHospitals,
  deleteHospital
} = require('../controllers/hospitalController');

// GET /api/hospitals - Get all hospitals with location-based sorting
router.get('/', async (req, res) => {
  try {
    // Note: To match your implementation, we use the base route `/`
    // which matches `/api/hospitals` when mounted in server.js
    const { latitude, longitude, city, maxDistance = 50000, type, state, pincode, lat, lng } = req.query;

    const userLat = latitude || lat ? parseFloat(latitude || lat) : null;
    const userLng = longitude || lng ? parseFloat(longitude || lng) : null;

    let query = { isActive: true }; // ✅ Only active hospitals
    let hospitals;

    // Apply filters
    if (type && type !== 'all') query.type = type;
    if (city && city !== 'All Cities') query['address.city'] = new RegExp(city, 'i');
    if (state) query['address.state'] = new RegExp(state, 'i');
    if (pincode) query['address.pincode'] = pincode;

    // Location-based search with manual distance calculation
    if (userLat && userLng) {
      hospitals = await Hospital.find(query)
        .populate('owner', 'name email phone')
        .select('-__v')
        .lean();

      // Calculate distance for each hospital
      hospitals = hospitals.map(hospital => {
        if (hospital.location && hospital.location.coordinates) {
          const [hospLng, hospLat] = hospital.location.coordinates;
          
          // Haversine formula
          const R = 6371; // Earth's radius in km
          const dLat = (hospLat - userLat) * Math.PI / 180;
          const dLon = (hospLng - userLng) * Math.PI / 180;
          const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(userLat * Math.PI / 180) * Math.cos(hospLat * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = R * c;

          return {
            ...hospital,
            distance: distance
          };
        }
        return hospital;
      });

      // Filter by max distance (maxDistance is in meters, converting to km)
      hospitals = hospitals.filter(h => 
        !h.distance || h.distance <= maxDistance / 1000
      );

      // Sort by distance
      hospitals.sort((a, b) => (a.distance || 999) - (b.distance || 999));

    } else {
      hospitals = await Hospital.find(query)
        .populate('owner', 'name email phone')
        .select('-__v')
        .limit(100)
        .lean();
    }

    console.log(`✅ Found ${hospitals.length} hospitals`);

    res.status(200).json({
      success: true,
      count: hospitals.length,
      data: hospitals
    });

  } catch (error) {
    console.error('❌ Get hospitals error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

router.get('/search', searchHospitals);
router.get('/nearby', getNearbyHospitals);
router.get('/:id', getHospitalById);

// POST /api/hospitals - Create hospital
router.post('/', protect, async (req, res) => {
  try {
    console.log('📝 Create hospital request');
    console.log('👤 User role:', req.user.role);
    console.log('📦 Body:', req.body);
    
    // Only admin can create
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only admin can add hospitals' 
      });
    }

    // Validation - only name and type required
    if (!req.body.name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Hospital name is required' 
      });
    }

    if (!req.body.type) {
      return res.status(400).json({ 
        success: false, 
        message: 'Hospital type is required' 
      });
    }

    // Create hospital
    const hospital = await Hospital.create(req.body);
    console.log('✅ Hospital created:', hospital.name);

    res.status(201).json({
      success: true,
      message: 'Hospital created successfully',
      data: hospital
    });

  } catch (error) {
    console.error('❌ Create hospital error:', error);
    
    // Mongoose validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: messages.join(', ') 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create hospital'
    });
  }
});

// PUT - Update Hospital
router.put('/:id', protect, async (req, res) => {
  try {
    console.log('📝 Update request for hospital:', req.params.id);
    console.log('📦 Body:', req.body); 

    // Check permission
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // If owner, verify ownership
    if (req.user.role === 'owner') {
      const user = await User.findById(req.user.id);
      if (user.ownerProfile?.facilityId?.toString() !== req.params.id) {
        return res.status(403).json({ success: false, message: 'Not your facility' });
      }
    }

    // Update hospital
    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      req.body,
      { 
        new: true, 
        runValidators: true 
      }
    );

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    console.log('✅ Hospital updated successfully');

    res.status(200).json({ 
      success: true, 
      message: 'Hospital updated successfully',
      data: hospital 
    });

  } catch (error) {
    console.error('❌ Update error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

router.delete('/:id', protect, deleteHospital);

// ============================================
// PRICE LIST / SERVICES ROUTES
// ============================================

// ===== GET services (public) =====
router.get('/:id/services', async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id).select('services name');
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });

    // Group by category
    const grouped = {};
    hospital.services.forEach(service => {
      const cat = service.category || 'General';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(service);
    });

    res.status(200).json({
      success: true,
      count: hospital.services.length,
      data: hospital.services,
      grouped
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== ADD service (admin/owner) =====
router.post('/:id/services', protect, async (req, res) => {
  try {
    // Check permission
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { name, category, price, duration, description, isAvailable } = req.body;

    if (!name || !price) {
      return res.status(400).json({ success: false, message: 'Name and price are required' });
    }

    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });

    // Owner can only edit own hospital
    if (req.user.role === 'owner') {
      const user = await User.findById(req.user.id);
      if (user.ownerProfile?.facilityId?.toString() !== req.params.id) {
        return res.status(403).json({ success: false, message: 'Not your facility' });
      }
    }

    hospital.services.push({
      name, category: category || 'General',
      price: parseFloat(price),
      duration, description,
      isAvailable: isAvailable !== undefined ? isAvailable : true
    });

    await hospital.save();

    res.status(201).json({
      success: true,
      message: 'Service added successfully',
      data: hospital.services
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== UPDATE service (admin/owner) =====
router.put('/:id/services/:serviceId', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });

    const service = hospital.services.id(req.params.serviceId);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

    // Update fields
    const { name, category, price, duration, description, isAvailable } = req.body;
    if (name)        service.name        = name;
    if (category)    service.category    = category;
    if (price)       service.price       = parseFloat(price);
    if (duration)    service.duration    = duration;
    if (description) service.description = description;
    if (isAvailable !== undefined) service.isAvailable = isAvailable;

    await hospital.save();

    res.status(200).json({
      success: true,
      message: 'Service updated',
      data: service
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== DELETE service (admin/owner) =====
router.delete('/:id/services/:serviceId', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });

    hospital.services.pull(req.params.serviceId);
    await hospital.save();

    res.status(200).json({
      success: true,
      message: 'Service deleted',
      data: hospital.services
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;