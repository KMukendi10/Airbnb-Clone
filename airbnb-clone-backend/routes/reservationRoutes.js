const express = require('express');
const {
  createReservation,
  getReservationsByHost,
  getReservationsByUser,
  deleteReservation,
} = require('../controllers/reservationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Specific string routes must be declared before the /:id param route below
router.get('/host', protect, getReservationsByHost);
router.get('/user', protect, getReservationsByUser);

router.post('/', protect, createReservation);
router.delete('/:id', protect, deleteReservation);

module.exports = router;
