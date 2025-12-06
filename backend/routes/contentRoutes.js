const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  getHomeContent, 
  getMovies, 
  getShorts, 
  getContentById, 
  updateProgress, 
  getContinueWatching,
  searchContent,
  getContentByCategory
} = require('../controllers/contentController');


router.get('/home', getHomeContent);
router.get('/movies', getMovies);
router.get('/shorts', getShorts);
router.get('/search', searchContent); // Search route
router.get('/continue-watching', protect, getContinueWatching); // Specific route before :id
router.post('/progress', protect, updateProgress);
router.get('/category/:title', getContentByCategory);
router.get('/:id', getContentById);

module.exports = router;
