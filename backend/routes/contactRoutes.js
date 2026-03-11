const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Contact = require('../models/Contact');

// POST /api/contacts - Submit contact form
router.post('/', async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone,
      type, 
      message,
      organizationType,
      organizationName,
      address,
      website
    } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone, and message are required'
      });
    }

    const subject = type || 'General Inquiry';

    const contact = await Contact.create({
      name,
      email,
      phone,
      subject,
      type,
      message,
      organizationType,
      organizationName,
      address,
      website,
      status: 'pending' // Default status
    });

    console.log('✅ Contact form submitted:', contact._id);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully. We will get back to you soon!',
      data: contact
    });

  } catch (error) {
    console.error('❌ Contact form error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/contacts - Get all contacts (Admin only)
router.get('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // ✅ FIX: Added status filtering logic for Admin Dashboard
    const { status } = req.query;
    let filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const contacts = await Contact.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts
    });

  } catch (error) {
    console.error('❌ Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ✅ FIX: NEW ROUTE - Update Contact Status (Pending -> In Progress -> Resolved)
router.put('/:id/status', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { status } = req.body;

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status: status },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Contact marked as ${status}`,
      data: contact
    });

  } catch (error) {
    console.error('❌ Update status error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE /api/contacts/:id - Delete contact
router.delete('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact deleted'
    });

  } catch (error) {
    console.error('❌ Delete contact error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;