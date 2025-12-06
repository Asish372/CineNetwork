const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  addToWatchlist, 
  removeFromWatchlist, 
  getWatchlist,
  checkWatchlistStatus
} = require('../controllers/interactionController');

router.post('/watchlist/add', protect, addToWatchlist);
router.post('/watchlist/remove', protect, removeFromWatchlist);
router.get('/watchlist', protect, getWatchlist);
router.get('/watchlist/:contentId', protect, checkWatchlistStatus);

module.exports = router;
