const express = require('express');
const router = express.Router();
const Hospital = require('../models/Hospital'); 
const User = require('../models/User');         
const { protect } = require('../middleware/authMiddleware');
const googlePlaces = require('../services/googlePlaces'); 

const {
  getHospitalById,
  searchHospitals,
  getNearbyHospitals,
  deleteHospital
} = require('../controllers/hospitalController');

// ============================================
// ROUTES
// ============================================

// GET /api/hospitals - Get all hospitals
router.get('/', async (req, res) => {
  try {
    const { latitude, longitude, city, type, maxDistance } = req.query;
    
    // 🔥 THE MASTER FIX: Removed 'isActive: true' which was hiding everything. 
    // Now it fetches hospitals properly. (You can change to { isApproved: true } later if you want only approved ones).
    let query = {}; 
    
    if (city && city !== 'All Cities') query['address.city'] = city;
    if (type && type !== 'All Types' && type !== 'all') query.type = type;
    
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
          
          return { ...hospital, distance: Math.round(distance * 10) / 10 };
        }
        return hospital;
      });
      
      if (maxDistance) {
        const maxDistanceKm = parseFloat(maxDistance);
        hospitals = hospitals.filter(h => !h.distance || h.distance <= maxDistanceKm);
      }
      
      hospitals.sort((a, b) => {
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
      });
    }
    
    res.status(200).json({ success: true, count: hospitals.length, data: hospitals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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

    if (!req.body.name) return res.status(400).json({ success: false, message: 'Hospital name is required' });
    if (!req.body.type) return res.status(400).json({ success: false, message: 'Hospital type is required' });

    const { name, phone, googlePlaceId, address } = req.body;

    if (googlePlaceId && googlePlaceId.trim() !== '') {
      const existingById = await Hospital.findOne({ googlePlaceId });
      if (existingById) return res.status(400).json({ success: false, message: 'Google Place ID already exists!' });
    }

    if (phone || (name && address?.city)) {
      const existingByNameOrPhone = await Hospital.findOne({
        $or: [
          { phone: phone },
          { name: { $regex: new RegExp(`^${name}$`, 'i') }, 'address.city': address?.city }
        ]
      });
      if (existingByNameOrPhone) return res.status(400).json({ success: false, message: 'Hospital already exists.' });
    }

    const hospital = await Hospital.create(req.body);
    res.status(201).json({ success: true, message: 'Hospital created', data: hospital });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message || 'Failed to create hospital' });
  }
});

// PUT - Update Hospital
router.put('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (req.user.role === 'owner') {
      const user = await User.findById(req.user.id);
      if (!user || !user.ownerProfile || !user.ownerProfile.facilityId) {
        return res.status(403).json({ success: false, message: 'Facility not assigned properly.' });
      }
      if (user.ownerProfile.facilityId.toString() !== req.params.id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied. Not your facility.' });
      }
    }

    let updateData = { ...req.body };
    if (updateData.googlePlaceId && updateData.googlePlaceId.trim() !== '') {
      try {
        const placeData = await googlePlaces.getPlaceDetails(updateData.googlePlaceId);
        if (placeData) {
          updateData.googleRating = placeData.googleRating || 0;
          updateData.googleReviewCount = placeData.googleReviewCount || 0;
        }
      } catch (googleError) {
        console.error('Failed to fetch fresh Google Data.');
      }
    }

    const hospital = await Hospital.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });

    res.status(200).json({ success: true, message: 'Hospital updated', data: hospital });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE
router.delete('/:id', protect, deleteHospital);

// ============================================
// PRICE LIST / SERVICES ROUTES
// ============================================

router.get('/:id/services', async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id).select('services name');
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });

    const grouped = {};
    if (hospital.services) {
      hospital.services.forEach(service => {
        const cat = service.category || 'General';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(service);
      });
    }

    res.status(200).json({
      success: true,
      count: hospital.services ? hospital.services.length : 0,
      data: hospital.services || [],
      grouped
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/:id/services', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (req.user.role === 'owner') {
      const user = await User.findById(req.user.id);
      if (!user || !user.ownerProfile || !user.ownerProfile.facilityId) {
        return res.status(403).json({ success: false, message: 'Facility not assigned.' });
      }
      if (user.ownerProfile.facilityId.toString() !== req.params.id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied. Not your facility.' });
      }
    }

    const { name, category, price, duration, description, isAvailable } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Service name is required' });

    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });

    if (!hospital.services) hospital.services = [];

    hospital.services.push({
      name, 
      category: category || 'General',
      price: (price !== undefined && price !== null && price !== '') ? Number(price) : null,
      duration, 
      description,
      isAvailable: isAvailable !== undefined ? isAvailable : true
    });

    await hospital.save();

    res.status(201).json({ success: true, message: 'Service added successfully', data: hospital.services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id/services/:serviceId', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (req.user.role === 'owner') {
      const user = await User.findById(req.user.id);
      if (!user || !user.ownerProfile || !user.ownerProfile.facilityId) {
        return res.status(403).json({ success: false, message: 'Facility not assigned.' });
      }
      if (user.ownerProfile.facilityId.toString() !== req.params.id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied. Not your facility.' });
      }
    }

    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });

    const service = hospital.services.id(req.params.serviceId);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

    const { name, category, price, duration, description, isAvailable } = req.body;
    
    if (name) service.name = name;
    if (category) service.category = category;
    if (price !== undefined) service.price = (price !== null && price !== '') ? Number(price) : null;
    if (duration !== undefined) service.duration = duration;
    if (description !== undefined) service.description = description;
    if (isAvailable !== undefined) service.isAvailable = isAvailable;

    await hospital.save();

    res.status(200).json({ success: true, message: 'Service updated', data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id/services/:serviceId', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (req.user.role === 'owner') {
      const user = await User.findById(req.user.id);
      if (!user || !user.ownerProfile || !user.ownerProfile.facilityId) {
        return res.status(403).json({ success: false, message: 'Facility not assigned.' });
      }
      if (user.ownerProfile.facilityId.toString() !== req.params.id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied. Not your facility.' });
      }
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