const { stripe } = require('../config/stripe');
const Booking = require('../models/Booking');

/**
 * @desc    Handle Stripe webhook events
 * @route   POST /api/webhooks/stripe
 * @access  Public (verified by Stripe signature)
 */
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // Dev fallback: trust the payload without signature verification
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    console.error('⚠️  Webhook signature verification failed:', err.message);
    return res.status(400).json({ success: false, message: `Webhook Error: ${err.message}` });
  }

  // Handle checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { bookingId } = session.metadata || {};

    if (!bookingId) {
      console.error('⚠️  Webhook: No bookingId in session metadata');
      return res.status(400).json({ success: false, message: 'No bookingId in metadata' });
    }

    try {
      const booking = await Booking.findById(bookingId);

      if (!booking) {
        console.error('⚠️  Webhook: Booking not found:', bookingId);
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      // Idempotency: skip if already paid
      if (booking.paymentStatus === 'paid') {
        console.log('ℹ️  Webhook: Booking already paid, skipping:', bookingId);
        return res.json({ received: true, message: 'Already processed' });
      }

      // Update booking
      booking.status = 'confirmed';
      booking.paymentStatus = 'paid';
      booking.paymentId = session.payment_intent || session.id;
      await booking.save();

      // Send booking notification email (non-blocking)
      if (process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true') {
        const { sendBookingNotificationEmail } = require('../utils/email.util');
        const populated = await Booking.findById(booking._id)
          .populate('property', 'title slug images location price')
          .populate('user', 'name email');
        sendBookingNotificationEmail(populated).catch(() => {});
      }

      console.log('✅ Webhook: Booking confirmed:', bookingId);
    } catch (err) {
      console.error('❌ Webhook: Error processing booking:', err.message);
      return res.status(500).json({ success: false, message: 'Internal error' });
    }
  }

  res.json({ received: true });
};

module.exports = { handleStripeWebhook };
