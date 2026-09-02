const mongoose = require('mongoose');

const specificRatingsSchema = new mongoose.Schema(
  {
    cleanliness: { type: Number, min: 0, max: 5, default: 0 },
    communication: { type: Number, min: 0, max: 5, default: 0 },
    checkIn: { type: Number, min: 0, max: 5, default: 0 },
    accuracy: { type: Number, min: 0, max: 5, default: 0 },
    location: { type: Number, min: 0, max: 5, default: 0 },
    value: { type: Number, min: 0, max: 5, default: 0 },
  },
  { _id: false }
);

const accommodationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Accommodation type is required'], // e.g. "Entire apartment"
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      index: true, // frequently filtered on by the Location page
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    bedrooms: { type: Number, required: true, min: 0 },
    bathrooms: { type: Number, required: true, min: 0 },
    guests: { type: Number, required: true, min: 1 },
    price: { type: Number, required: [true, 'Price per night is required'], min: 0 },

    amenities: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'At least one image is required',
      },
    },

    // Cost calculator fields
    weeklyDiscount: { type: Number, default: 0 },
    cleaningFee: { type: Number, default: 0 },
    serviceFee: { type: Number, default: 0 },
    occupancyTaxes: { type: Number, default: 0 },

    enhancedCleaning: { type: Boolean, default: false },
    selfCheckIn: { type: Boolean, default: false },

    // Booking policy flags — power the "Free cancellation" / "Instant Book"
    // filter pills on the Location (search results) page.
    freeCancellation: { type: Boolean, default: false },
    instantBook: { type: Boolean, default: false },

    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviews: { type: Number, default: 0 },
    specificRatings: { type: specificRatingsSchema, default: () => ({}) },

    // Owner of the listing - used to scope "My Listings" in the admin dashboard
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Accommodation', accommodationSchema);
