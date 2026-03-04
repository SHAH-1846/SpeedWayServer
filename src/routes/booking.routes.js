const router = require('express').Router();
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
  simulatePayment,
  createCheckoutSession,
} = require('../controllers/booking.controller');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createBookingSchema,
  updateBookingStatusSchema,
} = require('../validations/booking.validation');

// User routes
router.post('/', protect, validate(createBookingSchema), createBooking);
router.post('/create-checkout-session', protect, createCheckoutSession);
router.get('/', protect, getMyBookings);
router.put('/:id/pay', protect, simulatePayment);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllBookings);
router.put('/:id/status', protect, authorize('admin'), validate(updateBookingStatusSchema), updateBookingStatus);

module.exports = router;
