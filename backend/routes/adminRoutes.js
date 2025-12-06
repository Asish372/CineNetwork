const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Dashboard Routes
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/dashboard/trends', adminController.getDashboardTrends);
router.get('/dashboard/alerts', adminController.getDashboardAlerts);
router.get('/dashboard/live', adminController.getDashboardLive);

module.exports = router;
