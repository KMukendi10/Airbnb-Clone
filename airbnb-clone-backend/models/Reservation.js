const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    accommodation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Accommodation',
      required: true,
    },
    // Denormalized so GET /api/reservations/host doesn't need a join/lookup
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    checkIn: { type: Date, required: [true, 'Check-in date is required'] },
    checkOut: { type: Date, required: [true, 'Check-out date is required'] },
    guests: { type: Number, required: true, min: 1 },

    // Snapshot of the cost breakdown at time of booking so historical
    // reservations don't change if the listing's price changes later.
    nightlyPrice: { type: Number, required: true },
    totalNights: { type: Number, required: true },
    weeklyDiscount: { type: Number, default: 0 },
    cleaningFee: { type: Number, default: 0 },
    serviceFee: { type: Number, default: 0 },
    occupancyTaxes: { type: Number, default: 0 },
    totalCost: { type: Number, required: true },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'confirmed',
    },
  },
  { timestamps: true }
);

// Guard against nonsensical date ranges at the schema level.
reservationSchema.pre('validate', function checkDates(next) {
  if (this.checkIn && this.checkOut && this.checkOut <= this.checkIn) {
    return next(new Error('checkOut must be after checkIn'));
  }
  next();
});

module.exports = mongoose.model('Reservation', reservationSchema);
