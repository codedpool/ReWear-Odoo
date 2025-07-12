const asyncHandler = require('express-async-handler');

const adminProtect = asyncHandler(async (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    res.status(403);
    throw new Error('Not authorized, admin access required');
  }
  next();
});

module.exports = { adminProtect };