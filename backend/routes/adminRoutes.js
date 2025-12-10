const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

const { protect } = require('../middleware/authMiddleware');

// Verify Token Endpoint (for frontend init)
router.get('/verify', protect, adminController.verifyToken);

// Dashboard Routes (Protected)
router.get('/dashboard/stats', protect, adminController.getDashboardStats);
router.get('/dashboard/trends', protect, adminController.getDashboardTrends);
router.get('/dashboard/alerts', protect, adminController.getDashboardAlerts);
router.get('/dashboard/live', protect, adminController.getDashboardLive);
router.get('/dashboard/widgets', protect, adminController.getDashboardWidgets);
router.get('/users', protect, adminController.getAllUsers);
router.get('/subscriptions', protect, adminController.getAllSubscriptions);

module.exports = router;
