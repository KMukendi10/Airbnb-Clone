const express = require('express');
const {
  createAccommodation,
  getAccommodations,
  getAccommodationById,
  updateAccommodation,
  deleteAccommodation,
} = require('../controllers/accommodationController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// upload.array('images', 10) handles up to 10 file uploads under the field
// name 'images'. If no files are sent (URL-only flow from the admin dashboard),
// the middleware simply passes through — existingImages in req.body is used instead.
router
  .route('/')
  .get(getAccommodations) // public - Home/Location pages and ?host= filter for admin
  .post(protect, authorize('host'), upload.array('images', 10), createAccommodation);

router
  .route('/:id')
  .get(getAccommodationById) // public - Location Details page + admin prefill
  .put(protect, authorize('host'), upload.array('images', 10), updateAccommodation)
  .delete(protect, authorize('host'), deleteAccommodation);

module.exports = router;
