const Accommodation = require('../models/Accommodation');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create a new accommodation listing
// @route   POST /api/accommodations
// @access  Private (host)
const createAccommodation = asyncHandler(async (req, res) => {
  const accommodation = await Accommodation.create({
    ...req.body,
    host: req.user._id, // always trust the authenticated user, never the client
  });

  res.status(201).json(accommodation);
});

// @desc    Get all accommodations, optionally filtered by location and host
// @route   GET /api/accommodations?location=New York&host=<id>
// @access  Public
const getAccommodations = asyncHandler(async (req, res) => {
  const filter = {};

  // Location Page filter: case-insensitive partial match
  if (req.query.location) {
    filter.location = { $regex: req.query.location, $options: 'i' };
  }

  // Admin "My Listings" view: scope to the logged-in host
  if (req.query.host) {
    filter.host = req.query.host;
  }

  const accommodations = await Accommodation.find(filter).sort({ createdAt: -1 });
  res.json(accommodations);
});

// @desc    Get a single accommodation by id (used to pre-fill Update Listing form)
// @route   GET /api/accommodations/:id
// @access  Public
const getAccommodationById = asyncHandler(async (req, res) => {
  const accommodation = await Accommodation.findById(req.params.id);

  if (!accommodation) {
    res.status(404);
    throw new Error('Accommodation not found');
  }

  res.json(accommodation);
});

// @desc    Update an accommodation listing
// @route   PUT /api/accommodations/:id
// @access  Private (host who owns the listing)
const updateAccommodation = asyncHandler(async (req, res) => {
  const accommodation = await Accommodation.findById(req.params.id);

  if (!accommodation) {
    res.status(404);
    throw new Error('Accommodation not found');
  }

  if (accommodation.host.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this listing');
  }

  Object.assign(accommodation, req.body);
  const updated = await accommodation.save();

  res.json(updated);
});

// @desc    Delete an accommodation listing
// @route   DELETE /api/accommodations/:id
// @access  Private (host who owns the listing)
const deleteAccommodation = asyncHandler(async (req, res) => {
  const accommodation = await Accommodation.findById(req.params.id);

  if (!accommodation) {
    res.status(404);
    throw new Error('Accommodation not found');
  }

  if (accommodation.host.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this listing');
  }

  await accommodation.deleteOne();
  res.json({ message: 'Accommodation removed', id: req.params.id });
});

module.exports = {
  createAccommodation,
  getAccommodations,
  getAccommodationById,
  updateAccommodation,
  deleteAccommodation,
};
