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
  { username: 'JohnDoe',   email: 'john@example.com',  password: 'password123', role: 'user' },
  { username: 'JaneDoe',   email: 'jane@example.com',  password: 'password321', role: 'host' },
  { username: 'AliceSmith',email: 'alice@example.com', password: 'password123', role: 'user' },
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
    freeCancellation: true,
    instantBook: true,
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
    freeCancellation: true,
    instantBook: false,
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
    freeCancellation: false,
    instantBook: true,
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
    freeCancellation: false,
    instantBook: false,
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
  ...[
    ['Mountain View Cabin in Hout Bay', 'Entire cabin', 'Cape Town', 2, 1, 4, 2400, 4.8, 143, 'A peaceful timber cabin tucked beneath the Twelve Apostles, with a fireplace and mountain views.', 'photo-1449158743715-0a90ebb6d2d8'],
    ['Designer Loft in Maboneng', 'Entire loft', 'Johannesburg', 1, 1, 2, 1350, 4.6, 91, 'A sun-filled industrial loft in vibrant Maboneng, surrounded by galleries, cafes and markets.', 'photo-1522708323590-d24dbb6b0267'],
    ['Garden Cottage in Parkhurst', 'Entire guest suite', 'Johannesburg', 1, 1, 2, 1100, 4.7, 76, 'A quiet garden cottage near Parkhurst restaurants with a private patio and work area.', 'photo-1600585154340-be6161a56a0c'],
    ['Sea Point Apartment with Ocean Views', 'Entire apartment', 'Cape Town', 2, 2, 4, 2800, 4.9, 188, 'Enjoy sunrise ocean views from this polished Sea Point apartment near the promenade.', 'photo-1499793983690-e29da59ef1c2'],
    ['Bushveld Safari Lodge Retreat', 'Entire villa', 'Hoedspruit', 3, 3, 6, 4200, 4.9, 121, 'A private safari lodge on the edge of the bushveld with a plunge pool and wildlife visits.', 'photo-1516426122078-c23e76319801'],
    ['Cosy Clarens Stone Cottage', 'Entire cottage', 'Clarens', 2, 1, 4, 1750, 4.7, 109, 'A characterful stone cottage near the village square, ideal for hiking and slow mornings by the fire.', 'photo-1510798831971-661eb04b3739'],
    ['Waterfront Penthouse in Durban', 'Entire apartment', 'Durban', 3, 2, 6, 3100, 4.8, 156, 'A spacious beachfront penthouse overlooking Durban Golden Mile with a generous balcony.', 'photo-1600607687920-4e2a09cf159d'],
    ['Bohemian Flat in Melville', 'Entire apartment', 'Johannesburg', 1, 1, 2, 950, 4.5, 64, 'An artful and affordable flat in leafy Melville with a sunny balcony.', 'photo-1505693416388-ac5ce068fe85'],
    ['Franschhoek Vineyard Villa', 'Entire villa', 'Franschhoek', 4, 3, 8, 5200, 5.0, 97, 'A refined Winelands villa with vineyard views, a pool and generous entertaining spaces.', 'photo-1601918774946-25832a4be0d6'],
    ['Modern Umhlanga Beach Apartment', 'Entire apartment', 'Umhlanga', 2, 2, 4, 2600, 4.8, 132, 'A bright apartment near Umhlanga beach, lighthouse and lively village centre.', 'photo-1600566753086-00f18fb6b3ea'],
    ['Forest Hideaway in Knysna', 'Entire house', 'Knysna', 3, 2, 6, 2900, 4.9, 115, 'Unwind among indigenous trees in this serene Knysna home near lagoon cruises and forest trails.', 'photo-1518780664697-55e3ad937233'],
    ['City Bowl Heritage Townhouse', 'Entire townhouse', 'Cape Town', 3, 2, 5, 3300, 4.7, 84, 'A restored City Bowl townhouse with Table Mountain views and cafes just outside the door.', 'photo-1600047509807-ba8f99d2cdde'],
    ['Drakensberg Eco Cabin', 'Entire cabin', 'Underberg', 2, 1, 4, 1900, 4.8, 72, 'Disconnect in a low-impact cabin surrounded by Drakensberg scenery, trails and open skies.', 'photo-1542718610-a1d656d1884c'],
    ['Trendy Studio in Pretoria East', 'Entire studio', 'Pretoria', 1, 1, 2, 900, 4.5, 58, 'A compact, stylish studio near business hubs and restaurants for comfortable stays.', 'photo-1536376072261-38c75010e6c9'],
    ['Ballito Family Beach House', 'Entire house', 'Ballito', 4, 3, 8, 4600, 4.9, 147, 'A relaxed family beach house with pool, sea views and easy beach access.', 'photo-1494526585095-c41746248156'],
    ['Historic Karoo Farm Stay', 'Farm stay', 'Prince Albert', 2, 1, 4, 1500, 4.7, 69, 'Slow down on a working Karoo farm with wide-open views, stargazing and country hospitality.', 'photo-1500534623283-312aade485b7'],
  ].map(([title, type, location, bedrooms, bathrooms, guests, price, rating, reviews, description, photo], index) => ({
    title, type, location, bedrooms, bathrooms, guests, price, rating, reviews, description,
    amenities: ['Wifi', 'Kitchen', 'Free parking', 'Workspace', 'TV', 'Air conditioning'],
    images: [`https://images.unsplash.com/${photo}?w=800&q=80`],
    weeklyDiscount: index % 3 === 0 ? 10 : 5,
    cleaningFee: Math.round(price * 0.15), serviceFee: Math.round(price * 0.12), occupancyTaxes: Math.round(price * 0.08),
    enhancedCleaning: index % 2 === 0, selfCheckIn: index % 3 !== 0,
    freeCancellation: index % 2 === 0, instantBook: index % 3 === 0,
    specificRatings: {
      cleanliness: Math.min(5, rating + 0.1), communication: rating, checkIn: rating,
      accuracy: rating, location: Math.min(5, rating + 0.1), value: rating,
    },
    host: hostId,
  })),
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
  console.log('\n   Host login:  email="jane@example.com"  password="password321"');
  console.log('   Guest login: email="john@example.com"  password="password123"');
  process.exit(0);
};

run().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
