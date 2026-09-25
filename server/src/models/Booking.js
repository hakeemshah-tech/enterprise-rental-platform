const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'Property is required'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    checkIn: {
      type: Date,
      required: [true, 'Check-in date is required'],
    },
    checkOut: {
      type: Date,
      required: [true, 'Check-out date is required'],
    },
    guests: {
      adults: { type: Number, required: true, min: 1 },
      children: { type: Number, default: 0, min: 0 },
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: 0,
    },
    nightlyRate: { type: Number, required: true },
    numberOfNights: { type: Number, required: true },
    cleaningFee: { type: Number, default: 0 },
    serviceFee: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'failed'],
      default: 'pending',
    },
    paymentId: {
      type: String,
      default: '',
    },
    specialRequests: {
      type: String,
      default: '',
      maxlength: [500, 'Special requests cannot exceed 500 characters'],
    },
  },
  { timestamps: true }
);

// Ensure checkout is after checkin
bookingSchema.pre('validate', function (next) {
  if (this.checkOut <= this.checkIn) {
    this.invalidate('checkOut', 'Check-out date must be after check-in date');
  }
  next();
});

bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ property: 1, checkIn: 1, checkOut: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
