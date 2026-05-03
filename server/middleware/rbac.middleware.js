/**
 * Middleware for Role-Based Access Control
 * Usage: requireRole(['admin', 'govt'])
 * @param {Array<string>} roles - Roles allowed for the route
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "No user found in request" });
    }

    if (roles.includes(req.user.role)) {
      next();
    } else {
      return res.status(403).json({ message: `Access denied. Role ${req.user.role} not authorized.` });
    }
  };
};

module.exports = requireRole;
