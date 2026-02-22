const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  getAllBookings
} = require('../controllers/bookingController');

router.post('/', createBooking);
router.get('/my-bookings', getMyBookings);
router.get('/:id', getBookingById);
router.put('/:id', updateBooking);
router.delete('/:id', cancelBooking);

module.exports = router;