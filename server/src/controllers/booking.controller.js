const Booking = require('../models/Booking');
const Property = require('../models/Property');
const { checkAvailability } = require('../utils/availability.util');
const { stripe, isStripeEnabled } = require('../config/stripe');

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

    // Simulate payment: generate a fake payment ID
    booking.paymentStatus = 'paid';
    booking.status = 'confirmed';
    booking.paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate('property', 'title slug images location price')
      .populate('user', 'name email');

    // Send booking notification email (non-blocking)
    if (process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true') {
      const { sendBookingNotificationEmail } = require('../utils/email.util');
      sendBookingNotificationEmail(populated).catch(() => {});
    }

    res.json({
      success: true,
      message: 'Payment successful! Booking confirmed.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create Stripe Checkout Session for a booking
 * @route   POST /api/bookings/create-checkout-session
 * @access  Private
 */
const createCheckoutSession = async (req, res, next) => {
  try {
    if (!isStripeEnabled()) {
      return res.status(503).json({
        success: false,
        message: 'Stripe is not configured. Use simulated payment instead.',
      });
    }

    const { property: propertyId, checkIn, checkOut, guests, specialRequests } = req.body;

    // Fetch property from DB; never trust frontend pricing
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = Math.abs(checkOutDate - checkInDate);
    const numberOfNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (numberOfNights < 1) {
      return res.status(400).json({ success: false, message: 'Minimum stay is 1 night' });
    }

    // Check availability (bookings + blocked dates)
    const { available, conflicts } = await checkAvailability(propertyId, checkInDate, checkOutDate);
    if (!available) {
      return res.status(400).json({
        success: false,
        message: 'Property is not available for the selected dates',
        conflicts,
      });
    }

    // Server-calculated pricing
    const nightlyRate = property.price.perNight;
    const cleaningFee = property.price.cleaningFee || 0;
    const serviceFee = property.price.serviceFee || 0;
    const totalPrice = nightlyRate * numberOfNights + cleaningFee + serviceFee;

    // Create pending booking first
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
      status: 'pending',
      paymentStatus: 'pending',
    });

    // Build line items
    const lineItems = [
      {
        price_data: {
          currency: 'aed',
          product_data: {
            name: property.title,
            description: `${numberOfNights} night${numberOfNights > 1 ? 's' : ''} · ${property.location.city}`,
            images:
              property.images?.length > 0
                ? [property.images[0].url].filter((u) => u.startsWith('http'))
                : [],
          },
          unit_amount: Math.round(nightlyRate * 100), // Stripe uses cents
        },
        quantity: numberOfNights,
      },
    ];

    if (cleaningFee > 0) {
      lineItems.push({
        price_data: {
          currency: 'aed',
          product_data: { name: 'Cleaning Fee' },
          unit_amount: Math.round(cleaningFee * 100),
        },
        quantity: 1,
      });
    }

    if (serviceFee > 0) {
      lineItems.push({
        price_data: {
          currency: 'aed',
          product_data: { name: 'Service Fee' },
          unit_amount: Math.round(serviceFee * 100),
        },
        quantity: 1,
      });
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      metadata: {
        bookingId: booking._id.toString(),
        propertyId: propertyId.toString(),
        userId: req.user.id.toString(),
        checkIn: checkInDate.toISOString(),
        checkOut: checkOutDate.toISOString(),
      },
      success_url: `${clientUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/booking/cancel?booking_id=${booking._id}`,
    });

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
        bookingId: booking._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify Stripe checkout session and confirm booking
 * @route   POST /api/bookings/verify-checkout
 * @access  Private
 */
const verifyCheckoutSession = async (req, res, next) => {
  try {
    const { sessionId } = req.body;

    if (!isStripeEnabled()) {
      return res.status(503).json({ success: false, message: 'Stripe is not configured' });
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const { bookingId } = session.metadata || {};

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'No booking linked to this session' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Already confirmed (idempotent)
    if (booking.paymentStatus === 'paid') {
      const populated = await Booking.findById(booking._id)
        .populate('property', 'title slug images location price')
        .populate('user', 'name email');
      return res.json({ success: true, message: 'Booking already confirmed', data: populated });
    }

    // Check if Stripe session was actually paid
    if (session.payment_status === 'paid') {
      booking.status = 'confirmed';
      booking.paymentStatus = 'paid';
      booking.paymentId = session.payment_intent || session.id;
      await booking.save();

      const populated = await Booking.findById(booking._id)
        .populate('property', 'title slug images location price')
        .populate('user', 'name email');

      // Send booking notification email (non-blocking)
      if (process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true') {
        const { sendBookingNotificationEmail } = require('../utils/email.util');
        sendBookingNotificationEmail(populated).catch(() => {});
      }

      return res.json({ success: true, message: 'Booking confirmed', data: populated });
    }

    res.json({
      success: false,
      message: 'Payment not completed yet',
      data: { paymentStatus: session.payment_status },
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
  createCheckoutSession,
  verifyCheckoutSession,
};
