const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// Verifies the Bearer token on the request, attaches the authenticated
// user (minus password) to req.user, and rejects the request otherwise.
const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }

  // Verify the token signature/expiry first; if it fails, reject immediately.
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (_err) {
    res.status(401);
    throw new Error('Not authorized, token invalid or expired');
  }

  // Token is valid — look up the user in the database.
  const user = await User.findById(decoded.id);

  if (!user) {
    res.status(401);
    throw new Error('Not authorized, user no longer exists');
  }

  req.user = user;
  next();
});

// Restricts a route to specific roles, e.g. authorize('host').
// Use after `protect` so req.user is already populated.
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    res.status(403);
    throw new Error(`Role '${req.user?.role}' is not permitted to perform this action`);
  }
  next();
};

module.exports = { protect, authorize };
