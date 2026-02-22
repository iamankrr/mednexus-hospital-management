// middleware/admin.js - Admin Role Check Middleware

const admin = (req, res, next) => {
  // Check if user is authenticated (protect middleware should run first)
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please login first.'
    });
  }

  // Check if user role is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  // User is admin, proceed
  next();
};

module.exports = admin;