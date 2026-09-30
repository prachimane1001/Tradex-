const { verifyToken } = require('../utils/security');
const db = require('../db/database');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ success: false, message: 'Session expired or invalid token.' });
  }

  // Fetch full user record from database
  const user = db.findOne('users', { _id: decoded.id });
  if (!user) {
    return res.status(401).json({ success: false, message: 'User account not found.' });
  }

  req.user = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    virtualBalance: user.virtualBalance
  };

  next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Access denied. ${role.toUpperCase()} role required for this action.`
      });
    }
    next();
  };
}

module.exports = {
  authenticate,
  requireRole
};
