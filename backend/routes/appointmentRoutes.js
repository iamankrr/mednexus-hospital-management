const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Laboratory = require('../models/Laboratory');

// ===== CREATE APPOINTMENT =====
router.post('/', protect, async (req, res) => {
  try {
    const {
      facilityType,
      facilityId,
      patientName,
      patientAge,
      patientGender,
      phone,
      email,
      appointmentDate,
      appointmentTime,
      reason,
      notes
    } = req.body;

    console.log('📅 New appointment request:', patientName);

    // Validation
    if (!facilityType || !facilityId || !patientName || !patientAge || 
        !patientGender || !phone || !appointmentDate || !appointmentTime || !reason) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Check facility exists
    const Model = facilityType.toLowerCase() === 'hospital' ? Hospital : Laboratory;
    const facility = await Model.findById(facilityId);

    if (!facility) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found'
      });
    }

    // ✅ CHECK: Must have owner
    if (!facility.owner) {
      return res.status(403).json({
        success: false,
        message: 'This facility does not accept online appointments'
      });
    }

    // ✅ CHECK: Appointments must be enabled
    if (!facility.appointmentsEnabled) {
      return res.status(403).json({
        success: false,
        message: 'Appointments are currently disabled for this facility'
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      user: req.user.id,
      facilityType,
      facility: facilityId,
      patientName,
      patientAge,
      patientGender,
      phone,
      email,
      appointmentDate,
      appointmentTime,
      reason,
      notes,
      createdBy: req.user.role
    });

    console.log('✅ Appointment created:', appointment._id);

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: appointment
    });

  } catch (error) {
    console.error('❌ Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ===== GET USER APPOINTMENTS =====
router.get('/my-appointments', protect, async (req, res) => {
  try {
    console.log('📋 Fetching appointments for user:', req.user.email);

    // FIXED: Let Mongoose handle the dynamic population using refPath automatically
    const appointments = await Appointment.find({ user: req.user.id })
      .populate('facility', 'name address phone images themeColor') // Fetches the required facility details seamlessly
      .sort({ appointmentDate: -1, createdAt: -1 });

    console.log('✅ Found appointments:', appointments.length);

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });

  } catch (error) {
    console.error('❌ Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ===== GET FACILITY APPOINTMENTS (Owner/Admin) =====
router.get('/facility/:facilityId', protect, async (req, res) => {
  try {
    // Only owner or admin
    if (req.user.role !== 'owner' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // If owner, verify ownership
    if (req.user.role === 'owner') {
      if (req.user.ownerProfile?.facilityId?.toString() !== req.params.facilityId) {
        return res.status(403).json({
          success: false,
          message: 'Not your facility'
        });
      }
    }

    const appointments = await Appointment.find({ facility: req.params.facilityId })
      .populate('user', 'name email phone')
      .sort({ appointmentDate: -1 });

    console.log('✅ Facility appointments:', appointments.length);

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });

  } catch (error) {
    console.error('❌ Get facility appointments error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ===== UPDATE APPOINTMENT (User can edit own) =====
router.put('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check permission
    if (req.user.role === 'user' && appointment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own appointments'
      });
    }

    // Admin/Owner can edit any appointment
    // FIXED: Added 'cancellationReason' to the allowed update fields
    const allowedFields = ['patientName', 'patientAge', 'patientGender', 'phone', 
                          'email', 'appointmentDate', 'appointmentTime', 'reason', 
                          'notes', 'status', 'cancellationReason'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        appointment[field] = req.body[field];
      }
    });

    await appointment.save();

    console.log('✅ Appointment updated:', appointment._id);

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: appointment
    });

  } catch (error) {
    console.error('❌ Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ===== DELETE APPOINTMENT (User can delete own) =====
router.delete('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check permission
    if (req.user.role === 'user' && appointment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own appointments'
      });
    }

    await appointment.deleteOne();

    console.log('✅ Appointment deleted:', req.params.id);

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete appointment error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ===== GET ALL APPOINTMENTS (Admin only) =====
router.get('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin only'
      });
    }

    const appointments = await Appointment.find()
      .populate('user', 'name email phone')
      .populate('facility', 'name address')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });

  } catch (error) {
    console.error('❌ Get all appointments error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;