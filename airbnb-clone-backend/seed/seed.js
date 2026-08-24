// Populates the database with sample users and accommodations matching
// the structures given in the project brief. Run with: npm run seed
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');
const Accommodation = require('../models/Accommodation');
const Reservation = require('../models/Reservation');

dotenv.config();

const users = [
  { username: 'John Doe', password: 'password123', role: 'user' },
  { username: 'Jane Doe', password: 'password321', role: 'host' },
];

const run = async () => {
  await connectDB();

  console.log('Clearing existing data...');
  await Promise.all([User.deleteMany(), Accommodation.deleteMany(), Reservation.deleteMany()]);

  console.log('Creating users...');
  // .create() (not insertMany) so the pre-save password hashing hook runs
  const createdUsers = await User.create(users);
  const host = createdUsers.find((u) => u.role === 'host');

  console.log('Creating accommodations...');
  const accommodations = await Accommodation.create([
    {
      title: 'Modern Apartment in New York',
      type: 'Entire apartment',
      location: 'New York',
      description: 'Stay in the heart of New York City in this bright, modern apartment.',
      bedrooms: 2,
      bathrooms: 2,
      guests: 4,
      price: 320,
      amenities: ['wifi', 'kitchen', 'free parking'],
      images: [
        '/images/new-york-lady-of-liberty.jpg',
        '/images/new-york-lady-of-liberty.jpg',
        '/images/new-york-lady-of-liberty.jpg',
        '/images/new-york-lady-of-liberty.jpg',
        '/images/new-york-lady-of-liberty.jpg',
      ],
      weeklyDiscount: 10,
      cleaningFee: 50,
      serviceFee: 50,
      occupancyTaxes: 30,
      enhancedCleaning: true,
      selfCheckIn: true,
      rating: 4.5,
      reviews: 320,
      specificRatings: {
        cleanliness: 4.8,
        communication: 4.7,
        checkIn: 4.9,
        accuracy: 4.6,
        location: 4.9,
        value: 4.5,
      },
      host: host._id,
    },
    {
      title: 'Cozy Studio near Sandton',
      type: 'Entire studio',
      location: 'Johannesburg',
      description: 'A cozy, well-located studio close to Sandton City.',
      bedrooms: 1,
      bathrooms: 1,
      guests: 2,
      price: 180,
      amenities: ['wifi', 'kitchen', 'pool'],
      images: ['/images/joburg-city-hotel.jpg'],
      weeklyDiscount: 5,
      cleaningFee: 30,
      serviceFee: 25,
      occupancyTaxes: 15,
      rating: 4.2,
      reviews: 87,
      host: host._id,
    },
  ]);

  console.log(`Seeded ${createdUsers.length} users and ${accommodations.length} accommodations.`);
  console.log('Login with username "Jane Doe" / password "password321" for the host account.');
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
