const express = require('express');
const {
  createAccommodation,
  getAccommodations,
  getAccommodationById,
  updateAccommodation,
  deleteAccommodation,
} = require('../controllers/accommodationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(getAccommodations) // public - Home/Location pages and ?host= filter for admin
  .post(protect, authorize('host'), createAccommodation);

router
  .route('/:id')
  .get(getAccommodationById) // public - Location Details page + admin prefill
  .put(protect, authorize('host'), updateAccommodation)
  .delete(protect, authorize('host'), deleteAccommodation);

module.exports = router;
