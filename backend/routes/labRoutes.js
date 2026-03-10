const express = require('express');
const router = express.Router();
const Laboratory = require('../models/Laboratory');
const User = require('../models/User'); 
const { protect } = require('../middleware/authMiddleware');
const googlePlaces = require('../services/googlePlaces');

// GET /api/labs - Get all labs with location-based sorting
router.get('/', async (req, res) => {
  try {
    const { latitude, longitude, city, type, state, pincode, lat, lng, maxDistance } = req.query;
    console.log('📍 Lab request params:', { latitude, longitude, city, type, maxDistance });

    const userLat = latitude || lat ? parseFloat(latitude || lat) : null;
    const userLng = longitude || lng ? parseFloat(longitude || lng) : null;
    
    let query = { isActive: true }; 
    
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

    let labs = await Laboratory.find(query)
      .populate('owner', 'name email phone')
      .select('-__v')
      .lean(); 

    if (userLat && userLng) {
      console.log('📍 User location:', { userLat, userLng });

      labs = labs.map(lab => {
        if (lab.location && lab.location.coordinates) {
          const [labLng, labLat] = lab.location.coordinates;
          
          const R = 6371; 
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
            distance: Math.round(distance * 10) / 10 
          };
        }
        return lab;
      });

      if (maxDistance) {
        const maxDistanceKm = parseFloat(maxDistance);
        labs = labs.filter(l => !l.distance || l.distance <= maxDistanceKm);
      }

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

    const { name, phone, googlePlaceId, address } = req.body;

    if (googlePlaceId && googlePlaceId.trim() !== '') {
      const existingById = await Laboratory.findOne({ googlePlaceId });
      if (existingById) {
        return res.status(400).json({ success: false, message: 'A laboratory with this Google Place ID already exists!' });
      }
    }

    if (phone || (name && address?.city)) {
      const existingByNameOrPhone = await Laboratory.findOne({
        $or: [
          { phone: phone },
          { 
            name: { $regex: new RegExp(`^${name}$`, 'i') }, 
            'address.city': address?.city 
          }
        ]
      });

      if (existingByNameOrPhone) {
        return res.status(400).json({ success: false, message: 'This laboratory already exists (Matching Name & City, or Phone number found).' });
      }
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

    let updateData = { ...req.body };
    if (updateData.googlePlaceId && updateData.googlePlaceId.trim() !== '') {
      try {
        console.log(`🔍 Fetching fresh Google ratings for Lab Place ID: ${updateData.googlePlaceId}`);
        const placeData = await googlePlaces.getPlaceDetails(updateData.googlePlaceId);
        
        if (placeData) {
          updateData.googleRating = placeData.googleRating || 0;
          updateData.googleReviewCount = placeData.googleReviewCount || 0;
          console.log(`✅ Fresh Rating applied to Lab: ${updateData.googleRating} (${updateData.googleReviewCount} reviews)`);
        }
      } catch (googleError) {
        console.error(`⚠️ Failed to fetch fresh Google Data. Saving provided ID anyway. Error: ${googleError.message}`);
      }
    }

    const lab = await Laboratory.findByIdAndUpdate(
      req.params.id,
      updateData, 
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

// ============================================
// ✅ NEW: LAB SERVICES MANAGEMENT ROUTES
// ============================================

// GET services for a lab
router.get('/:id/services', async (req, res) => {
  try {
    const lab = await Laboratory.findById(req.params.id).select('services name');
    if (!lab) return res.status(404).json({ success: false, message: 'Laboratory not found' });

    const grouped = {};
    lab.services.forEach(service => {
      const cat = service.category || 'General';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(service);
    });

    res.status(200).json({
      success: true,
      count: lab.services.length,
      data: lab.services,
      grouped
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ADD service
router.post('/:id/services', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { name, category, price, duration, description, isAvailable } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Service name is required' });
    }

    const lab = await Laboratory.findById(req.params.id);
    if (!lab) return res.status(404).json({ success: false, message: 'Laboratory not found' });

    if (req.user.role === 'owner') {
      const user = await User.findById(req.user.id);
      if (user.ownerProfile?.facilityId?.toString() !== req.params.id) {
        return res.status(403).json({ success: false, message: 'Not your facility' });
      }
    }

    if (!lab.services) {
      lab.services = [];
    }

    lab.services.push({
      name, 
      category: category || 'Diagnosis',
      price: price ? parseFloat(price) : null,
      duration, 
      description,
      isAvailable: isAvailable !== undefined ? isAvailable : true
    });

    await lab.save();

    res.status(201).json({
      success: true,
      message: 'Service added successfully',
      data: lab.services
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// UPDATE service
router.put('/:id/services/:serviceId', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const lab = await Laboratory.findById(req.params.id);
    if (!lab) return res.status(404).json({ success: false, message: 'Laboratory not found' });

    const service = lab.services.id(req.params.serviceId);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

    const { name, category, price, duration, description, isAvailable } = req.body;
    if (name) service.name = name;
    if (category) service.category = category;
    if (price !== undefined) service.price = price ? parseFloat(price) : null;
    if (duration !== undefined) service.duration = duration;
    if (description !== undefined) service.description = description;
    if (isAvailable !== undefined) service.isAvailable = isAvailable;

    await lab.save();

    res.status(200).json({
      success: true,
      message: 'Service updated',
      data: service
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE service
router.delete('/:id/services/:serviceId', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const lab = await Laboratory.findById(req.params.id);
    if (!lab) return res.status(404).json({ success: false, message: 'Laboratory not found' });

    lab.services.pull(req.params.serviceId);
    await lab.save();

    res.status(200).json({
      success: true,
      message: 'Service deleted',
      data: lab.services
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;