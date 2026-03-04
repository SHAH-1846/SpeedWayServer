const Booking = require('../models/Booking');
const Property = require('../models/Property');
const { checkAvailability } = require('../utils/availability.util');

/**
 * @desc    Create booking
 * @route   POST /api/bookings
 * @access  Private
 */
const createBooking = async (req, res, next) => {
  try {
    const { property: propertyId, checkIn, checkOut, guests, specialRequests } = req.body;

    // Find property
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Calculate pricing
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = Math.abs(checkOutDate - checkInDate);
    const numberOfNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (numberOfNights < 1) {
      return res.status(400).json({
        success: false,
        message: 'Minimum stay is 1 night',
      });
    }

    const nightlyRate = property.price.perNight;
    const cleaningFee = property.price.cleaningFee || 0;
    const serviceFee = property.price.serviceFee || 0;
    const totalPrice = nightlyRate * numberOfNights + cleaningFee + serviceFee;

    // Check for overlapping bookings AND blocked dates
    const { available, conflicts } = await checkAvailability(propertyId, checkInDate, checkOutDate);

    if (!available) {
      return res.status(400).json({
        success: false,
        message: 'Property is not available for the selected dates',
        conflicts,
      });
    }

    const booking = await Booking.create({
      property: propertyId,
      user: req.user.id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      nightlyRate,
      numberOfNights,
      cleaningFee,
      serviceFee,
      totalPrice,
      specialRequests,
    });

    const populated = await Booking.findById(booking._id)
      .populate('property', 'title slug images location price')
      .populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user's bookings
 * @route   GET /api/bookings
 * @access  Private
 */
const getMyBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { user: req.user.id };
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Booking.countDocuments(query);

    const bookings = await Booking.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .populate('property', 'title slug images location price');

    res.json({
      success: true,
      data: bookings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all bookings (admin)
 * @route   GET /api/bookings/admin/all
 * @access  Private/Admin
 */
const getAllBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, paymentStatus } = req.query;
    const query = {};
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Booking.countDocuments(query);

    const bookings = await Booking.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .populate('property', 'title slug images location price')
      .populate('user', 'name email phone');

    res.json({
      success: true,
      data: bookings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update booking status (admin)
 * @route   PUT /api/bookings/:id/status
 * @access  Private/Admin
 */
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status, paymentStatus } = req.body;
    const update = {};
    if (status) update.status = status;
    if (paymentStatus) update.paymentStatus = paymentStatus;

    const booking = await Booking.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    })
      .populate('property', 'title slug images location price')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({
      success: true,
      message: 'Booking status updated',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Simulate payment for a booking
 * @route   PUT /api/bookings/:id/pay
 * @access  Private
 */
const simulatePayment = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Booking is already paid' });
    }

    // Simulate payment — generate a fake payment ID
    booking.paymentStatus = 'paid';
    booking.status = 'confirmed';
    booking.paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate('property', 'title slug images location price')
      .populate('user', 'name email');

    res.json({
      success: true,
      message: 'Payment successful! Booking confirmed.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
  simulatePayment,
};
