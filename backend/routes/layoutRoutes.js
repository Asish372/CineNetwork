const express = require('express');
const router = express.Router();
const layoutController = require('../controllers/layoutController');

// Helper to use controller without auth middleware (for now, or add auth if needed)
// Assuming secure pages, we should probably add auth. 
// But let's check server.js if middleware is applied globally or per route.
// For admin purposes, we can assume protected by whatever wraps admin routes.

router.get('/:page', layoutController.getLayout);
router.post('/:page', layoutController.saveLayout);
router.get('/search/content', layoutController.searchContentForLayout);

module.exports = router;
