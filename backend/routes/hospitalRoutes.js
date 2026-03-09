const express = require('express');
const router = express.Router();
const Hospital = require('../models/Hospital'); 
const User = require('../models/User');         
const { protect } = require('../middleware/authMiddleware');
const googlePlaces = require('../services/googlePlaces'); // ✅ ADDED: Import Google Places service

const {
  getHospitalById,
  searchHospitals,
  getNearbyHospitals,
  deleteHospital
} = require('../controllers/hospitalController');

// ============================================
// CACHE VARIABLES
// ============================================
let hospitalsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ============================================
// ROUTES
// ============================================

// GET /api/hospitals - Get all hospitals with location-based sorting
router.get('/', async (req, res) => {
  try {
    const { latitude, longitude, city, type, maxDistance } = req.query;
    console.log('📍 Request params:', { latitude, longitude, city, type, maxDistance });
    
    const isDefaultQuery = !latitude && 
                           (!city || city === 'All Cities') && 
                           (!type || type === 'All Types' || type === 'all');

    if (isDefaultQuery && hospitalsCache && cacheTimestamp) {
      const cacheAge = Date.now() - cacheTimestamp;
      if (cacheAge < CACHE_DURATION) {
        console.log('✅ Returning cached hospitals');
        return res.status(200).json({
          success: true,
          count: hospitalsCache.length,
          data: hospitalsCache,
          cached: true
        });
      }
    }

    let query = { isActive: true };
    
    if (city && city !== 'All Cities') {
      query['address.city'] = city;
    }
    
    if (type && type !== 'All Types' && type !== 'all') {
      query.type = type;
    }
    
    let hospitals = await Hospital.find(query)
      .populate('owner', 'name email phone')
      .select('-__v -createdAt -updatedAt') 
      .lean()
      .limit(50); 
      
    if (latitude && longitude) {
      const userLat = parseFloat(latitude);
      const userLng = parseFloat(longitude);
      
      hospitals = hospitals.map(hospital => {
        if (hospital.location && hospital.location.coordinates) {
          const [hospLng, hospLat] = hospital.location.coordinates;
          
          const R = 6371; 
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
            distance: Math.round(distance * 10) / 10 
          };
        }
        return hospital;
      });
      
      if (maxDistance) {
        const maxDistanceKm = parseFloat(maxDistance);
        hospitals = hospitals.filter(h => 
          !h.distance || h.distance <= maxDistanceKm
        );
      }
      
      hospitals.sort((a, b) => {
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
      });
      
    } 
    
    if (isDefaultQuery) {
      hospitalsCache = hospitals;
      cacheTimestamp = Date.now();
    }
    
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
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admin can add hospitals' });
    }

    if (!req.body.name || !req.body.type) {
      return res.status(400).json({ success: false, message: 'Hospital name and type are required' });
    }

    const hospital = await Hospital.create(req.body);
    hospitalsCache = null;

    res.status(201).json({
      success: true,
      message: 'Hospital created successfully',
      data: hospital
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message || 'Failed to create hospital' });
  }
});

// PUT - Update Hospital (🔥 FIX: Added Instant Google Rating Sync)
router.put('/:id', protect, async (req, res) => {
  try {
    console.log('📝 Update request for hospital:', req.params.id);

    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (req.user.role === 'owner') {
      const user = await User.findById(req.user.id);
      if (user.ownerProfile?.facilityId?.toString() !== req.params.id) {
        return res.status(403).json({ success: false, message: 'Not your facility' });
      }
    }

    // Capture the incoming data
    let updateData = { ...req.body };

    // ✅ NEW LOGIC: Instantly fetch and update Google Ratings if a new Place ID is provided
    if (updateData.googlePlaceId && updateData.googlePlaceId.trim() !== '') {
      try {
        console.log(`🔍 Fetching fresh Google ratings for Place ID: ${updateData.googlePlaceId}`);
        const placeData = await googlePlaces.getPlaceDetails(updateData.googlePlaceId);
        
        if (placeData) {
          updateData.googleRating = placeData.googleRating || 0;
          updateData.googleReviewCount = placeData.googleReviewCount || 0;
          console.log(`✅ Fresh Rating applied: ${updateData.googleRating} (${updateData.googleReviewCount} reviews)`);
        }
      } catch (googleError) {
        console.error(`⚠️ Failed to fetch fresh Google Data. Saving provided ID anyway. Error: ${googleError.message}`);
        // We do not stop the save process if Google fetch fails, we just don't update ratings yet.
      }
    }

    // Update hospital
    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    hospitalsCache = null;

    res.status(200).json({ 
      success: true, 
      message: 'Hospital updated successfully',
      data: hospital 
    });

  } catch (error) {
    console.error('❌ Update error:', error);
    res.status(500).json({ success: false, message: error.message });
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
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { name, category, price, duration, description, isAvailable } = req.body;

    if (!name || !price) {
      return res.status(400).json({ success: false, message: 'Name and price are required' });
    }

    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });

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

    res.status(201).json({ success: true, message: 'Service added successfully', data: hospital.services });
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

    const { name, category, price, duration, description, isAvailable } = req.body;
    if (name)        service.name        = name;
    if (category)    service.category    = category;
    if (price)       service.price       = parseFloat(price);
    if (duration)    service.duration    = duration;
    if (description) service.description = description;
    if (isAvailable !== undefined) service.isAvailable = isAvailable;

    await hospital.save();

    res.status(200).json({ success: true, message: 'Service updated', data: service });
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

    res.status(200).json({ success: true, message: 'Service deleted', data: hospital.services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;