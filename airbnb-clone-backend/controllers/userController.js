const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// Signs a JWT for a given user id.
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// @desc    Register a new user (host or guest)
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password) {
    res.status(400);
    throw new Error('Username, email and password are required');
  }

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    res.status(400);
    throw new Error(
      existingUser.email === email
        ? 'A user with that email already exists'
        : 'A user with that username already exists'
    );
  }

  const user = await User.create({
    username,
    email,
    password,
    role: role === 'host' ? 'host' : 'user',
  });

  res.status(201).json({
    _id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  });
});

// @desc    Authenticate user & return a token
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  // password has `select: false` on the schema, so it must be explicitly requested
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.json({
    _id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  });
});

// @desc    Get the currently logged-in user (used to persist sessions on refresh)
// @route   GET /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  // req.user is set by the `protect` middleware
  res.json({
    _id: req.user._id,
    username: req.user.username,
    email: req.user.email,
    role: req.user.role,
  });
});

module.exports = { registerUser, loginUser, getMe };
