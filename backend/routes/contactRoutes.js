const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Contact = require('../models/Contact');

// POST /api/contacts - Submit contact form
router.post('/', async (req, res) => {
  try {
    // FIX: Catch all fields sent by frontend
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

    // Validation updated to match frontend required fields
    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone, and message are required'
      });
    }

    // Set a default subject for the DB if 'subject' isn't explicitly provided
    const subject = type || 'General Inquiry';

    // Store all data (Mongoose will ignore fields not in schema if strict mode is on, which is safe)
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
      website
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

    const contacts = await Contact.find()
      .sort({ createdAt: -1 });

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

// PUT /api/contacts/:id/mark-read - Mark as read
router.put('/:id/mark-read', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.status(200).json({
      success: true,
      data: contact
    });

  } catch (error) {
    console.error('❌ Mark read error:', error);
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