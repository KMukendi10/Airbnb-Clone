/**
 * seed.js – Populates the database with realistic sample data
 * matching the Airbnb Clone project brief.
 *
 * Run with:  npm run seed
 *
 * WARNING: this wipes ALL existing users, accommodations and reservations first.
 */

const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');
const Accommodation = require('../models/Accommodation');
const Reservation = require('../models/Reservation');

dotenv.config();

// ── Sample users ────────────────────────────────────────────
const USERS = [
  { username: 'JohnDoe',   password: 'password123', role: 'user' },
  { username: 'JaneDoe',   password: 'password321', role: 'host' },
  { username: 'AliceSmith',password: 'password123', role: 'user' },
];

// ── Accommodation factory (host id injected at runtime) ─────
const makeAccommodations = (hostId) => [
  {
    title: 'Modern Luxury Apartment – New York City',
    type: 'Entire apartment',
    location: 'New York',
    description:
      'Stay in the heart of Manhattan in this bright, modern apartment with floor-to-ceiling windows and stunning city views. Walking distance to Central Park, Times Square and the best restaurants in the city.',
    bedrooms: 2,
    bathrooms: 2,
    guests: 4,
    price: 3200,
    amenities: ['Wifi', 'Kitchen', 'Free parking', 'Air conditioning', 'TV', 'Washer', 'Gym'],
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
      'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800&q=80',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    ],
    weeklyDiscount: 10,
    cleaningFee: 500,
    serviceFee: 480,
    occupancyTaxes: 300,
    enhancedCleaning: true,
    selfCheckIn: true,
    rating: 4.8,
    reviews: 320,
    specificRatings: {
      cleanliness: 4.9,
      communication: 4.8,
      checkIn: 5.0,
      accuracy: 4.7,
      location: 5.0,
      value: 4.6,
    },
    host: hostId,
  },
  {
    title: 'Stylish Studio near Sandton City',
    type: 'Entire studio',
    location: 'Johannesburg',
    description:
      'A cozy, well-located studio in the heart of Sandton – walking distance to Sandton City Mall and Nelson Mandela Square. Perfect for business travellers and couples exploring Joburg.',
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    price: 1800,
    amenities: ['Wifi', 'Kitchen', 'Pool', 'Gym', 'TV', 'Air conditioning'],
    images: [
      'https://images.unsplash.com/photo-1577948000111-9c970dfe3743?w=800&q=80',
      'https://images.unsplash.com/photo-1549517045-bc93de075e53?w=800&q=80',
      'https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=800&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    ],
    weeklyDiscount: 7,
    cleaningFee: 300,
    serviceFee: 250,
    occupancyTaxes: 150,
    enhancedCleaning: false,
    selfCheckIn: true,
    rating: 4.5,
    reviews: 87,
    specificRatings: {
      cleanliness: 4.6,
      communication: 4.7,
      checkIn: 4.8,
      accuracy: 4.5,
      location: 4.9,
      value: 4.4,
    },
    host: hostId,
  },
  {
    title: 'Beachfront Cottage – Clifton',
    type: 'Entire house',
    location: 'Cape Town',
    description:
      'Wake up to the sound of the ocean in this charming cottage steps from Clifton 4th Beach. Stunning views of the Atlantic, a fully equipped kitchen and a private sundeck.',
    bedrooms: 2,
    bathrooms: 1,
    guests: 4,
    price: 3500,
    amenities: ['Wifi', 'Kitchen', 'Beach access', 'Free parking', 'Air conditioning', 'TV'],
    images: [
      'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80',
      'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800&q=80',
      'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    ],
    weeklyDiscount: 12,
    cleaningFee: 600,
    serviceFee: 520,
    occupancyTaxes: 350,
    enhancedCleaning: true,
    selfCheckIn: false,
    rating: 4.9,
    reviews: 214,
    specificRatings: {
      cleanliness: 5.0,
      communication: 4.9,
      checkIn: 4.8,
      accuracy: 4.9,
      location: 5.0,
      value: 4.7,
    },
    host: hostId,
  },
  {
    title: 'Vineyard Guest House – Stellenbosch',
    type: 'Private room',
    location: 'Stellenbosch',
    description:
      'Escape to the Cape Winelands in this beautiful private room set on a working wine estate. Enjoy daily wine tastings, farm-to-table breakfasts and cycling trails through the vineyards.',
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    price: 1200,
    amenities: ['Wifi', 'Breakfast included', 'Free parking', 'Heating', 'Garden'],
    images: [
      'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=800&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    ],
    weeklyDiscount: 15,
    cleaningFee: 200,
    serviceFee: 150,
    occupancyTaxes: 100,
    enhancedCleaning: false,
    selfCheckIn: false,
    rating: 4.7,
    reviews: 62,
    specificRatings: {
      cleanliness: 4.8,
      communication: 5.0,
      checkIn: 4.9,
      accuracy: 4.7,
      location: 4.8,
      value: 4.9,
    },
    host: hostId,
  },
];

// ── Runner ─────────────────────────────────────────────────
const run = async () => {
  await connectDB();

  console.log('⚠  Clearing existing data…');
  await Promise.all([
    User.deleteMany(),
    Accommodation.deleteMany(),
    Reservation.deleteMany(),
  ]);

  console.log('👤 Creating users…');
  // Use .create() (not insertMany) so the pre-save password hashing hook runs on each user
  const createdUsers = await User.create(USERS);
  const host = createdUsers.find((u) => u.role === 'host');

  console.log('🏠 Creating accommodations…');
  const accommodations = await Accommodation.create(makeAccommodations(host._id));

  console.log('\n✅ Seed complete!');
  console.log(`   ${createdUsers.length} users created`);
  console.log(`   ${accommodations.length} accommodations created`);
  console.log('\n   Host login:  username="JaneDoe"  password="password321"');
  console.log('   Guest login: username="JohnDoe"  password="password123"');
  process.exit(0);
};

run().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
