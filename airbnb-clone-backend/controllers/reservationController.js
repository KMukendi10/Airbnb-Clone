const Reservation = require('../models/Reservation');
const Accommodation = require('../models/Accommodation');
const asyncHandler = require('../utils/asyncHandler');

const MS_PER_NIGHT = 1000 * 60 * 60 * 24;

// Recomputes the cost breakdown server-side from the accommodation's own
// fees rather than trusting a total sent by the client.
const calculateCost = (accommodation, checkIn, checkOut) => {
  const totalNights = Math.round((new Date(checkOut) - new Date(checkIn)) / MS_PER_NIGHT);

  if (totalNights <= 0) {
    const err = new Error('checkOut must be after checkIn');
    err.statusCode = 400;
    throw err;
  }

  const { price, weeklyDiscount = 0, cleaningFee = 0, serviceFee = 0, occupancyTaxes = 0 } =
    accommodation;

  let subtotal = price * totalNights;

  // Apply the weekly discount (stored as a percentage) once a stay hits 7+ nights
  const discountAmount = totalNights >= 7 ? subtotal * (weeklyDiscount / 100) : 0;
  subtotal -= discountAmount;

  const totalCost = subtotal + cleaningFee + serviceFee + occupancyTaxes;

  return {
    nightlyPrice: price,
    totalNights,
    weeklyDiscount,
    cleaningFee,
    serviceFee,
    occupancyTaxes,
    totalCost: Math.round(totalCost * 100) / 100,
  };
};

// @desc    Create a reservation
// @route   POST /api/reservations
// @access  Private
const createReservation = asyncHandler(async (req, res) => {
  const { accommodationId, checkIn, checkOut, guests } = req.body;

  if (!accommodationId || !checkIn || !checkOut || !guests) {
    res.status(400);
    throw new Error('accommodationId, checkIn, checkOut and guests are required');
  }

  const accommodation = await Accommodation.findById(accommodationId);
  if (!accommodation) {
    res.status(404);
    throw new Error('Accommodation not found');
  }

  if (guests > accommodation.guests) {
    res.status(400);
    throw new Error(`This listing sleeps a maximum of ${accommodation.guests} guests`);
  }

  const costBreakdown = calculateCost(accommodation, checkIn, checkOut);

  const reservation = await Reservation.create({
    accommodation: accommodation._id,
    host: accommodation.host,
    user: req.user._id,
    checkIn,
    checkOut,
    guests,
    ...costBreakdown,
  });

  res.status(201).json(reservation);
});

// @desc    Get all reservations for listings owned by the logged-in host
// @route   GET /api/reservations/host
// @access  Private (host)
const getReservationsByHost = asyncHandler(async (req, res) => {
  const reservations = await Reservation.find({ host: req.user._id })
    .populate('accommodation', 'title location images')
    .populate('user', 'username')
    .sort({ createdAt: -1 });

  res.json(reservations);
});

// @desc    Get all reservations made by the logged-in user
// @route   GET /api/reservations/user
// @access  Private
const getReservationsByUser = asyncHandler(async (req, res) => {
  const reservations = await Reservation.find({ user: req.user._id })
    .populate('accommodation', 'title location images')
    .sort({ createdAt: -1 });

  res.json(reservations);
});

// @desc    Delete/cancel a reservation
// @route   DELETE /api/reservations/:id
// @access  Private (the user who booked it, or the host it belongs to)
const deleteReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);

  if (!reservation) {
    res.status(404);
    throw new Error('Reservation not found');
  }

  const isOwner = reservation.user.toString() === req.user._id.toString();
  const isHost = reservation.host.toString() === req.user._id.toString();

  if (!isOwner && !isHost) {
    res.status(403);
    throw new Error('Not authorized to cancel this reservation');
  }

  await reservation.deleteOne();
  res.json({ message: 'Reservation cancelled', id: req.params.id });
});

module.exports = {
  createReservation,
  getReservationsByHost,
  getReservationsByUser,
  deleteReservation,
};
