const Accommodation = require('../models/Accommodation');
const asyncHandler = require('../utils/asyncHandler');

// Helper: merge URL-string images (from the form's existingImages JSON field)
// with any physically uploaded files (req.files from Multer).
// The admin dashboard sends existing image URLs as a JSON string in
// req.body.existingImages; the upload middleware (if wired) populates req.files.
function buildImages(req) {
  let images = [];

  // URL-based images sent from the admin form as a JSON-encoded array
  if (req.body.existingImages) {
    try {
      const parsed = JSON.parse(req.body.existingImages);
      if (Array.isArray(parsed)) images = parsed;
    } catch (_) {
      // not JSON — treat as a single URL string
      if (req.body.existingImages) images = [req.body.existingImages];
    }
  }

  // Physically uploaded files added by Multer (optional upload middleware)
  if (req.files && req.files.length > 0) {
    const uploadedUrls = req.files.map((f) => `/uploads/${f.filename}`);
    images = [...images, ...uploadedUrls];
  }

  return images;
}

// @desc    Create a new accommodation listing
// @route   POST /api/accommodations
// @access  Private (host)
const createAccommodation = asyncHandler(async (req, res) => {
  const images = buildImages(req);

  const accommodation = await Accommodation.create({
    ...req.body,
    ...(images.length > 0 && { images }), // only override if images were provided
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
  // Populate host with username + createdAt so the frontend can display
  // "Hosted by X" and a "Joined <month year>" line on the host card
  const accommodation = await Accommodation.findById(req.params.id)
    .populate('host', 'username createdAt');

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

  // Rebuild images array (URL-based from form + any new file uploads)
  const images = buildImages(req);
  Object.assign(accommodation, req.body);
  if (images.length > 0) accommodation.images = images;

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
