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
  getContentByCategory,
  createContent,
  updateContent,
  deleteContent,
  createCategory,
  deleteCategory,
  bulkAction
} = require('../controllers/contentController');


router.get('/home', getHomeContent);
router.get('/movies', getMovies);
router.get('/shorts', getShorts);
router.get('/search', searchContent); 
router.get('/continue-watching', protect, getContinueWatching);
router.post('/progress', protect, updateProgress);
router.get('/category/:title', getContentByCategory);
router.get('/:id', getContentById);

// Admin Routes
router.post('/', protect, createContent);
router.put('/:id', protect, updateContent);
router.delete('/:id', protect, deleteContent);

// Category Management
router.post('/category', protect, createCategory);
router.delete('/category/:id', protect, deleteCategory);

// Bulk Actions
router.post('/bulk', protect, bulkAction);

module.exports = router;
