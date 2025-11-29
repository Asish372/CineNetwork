const express = require('express');
const router = express.Router();
const { getHomeContent, getMovies, getShorts, getContentById } = require('../controllers/contentController');

router.get('/home', getHomeContent);
router.get('/movies', getMovies);
router.get('/shorts', getShorts);
router.get('/:id', getContentById);

module.exports = router;
