const Notification = require('../models/Notification.js');

/**
 * Get notifications for a user (farmer)
 */
exports.getNotifications = async (req, res) => {
  try {
    const farmerId = req.user?.farmerId;
    const notifications = await Notification.find({
      $or: [
        { to: farmerId },
        { to: 'all' },
        { to: req.user?.district || '' }
      ]
    }).sort({ time: -1 }).limit(50);
    
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
