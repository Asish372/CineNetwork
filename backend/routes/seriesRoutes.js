const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const seriesController = require('../controllers/seriesController');

// Seasons
router.get('/:seriesId/seasons', protect, seriesController.getSeasons);
router.post('/:seriesId/seasons', protect, seriesController.createSeason);
router.put('/seasons/:id', protect, seriesController.updateSeason);
router.delete('/seasons/:id', protect, seriesController.deleteSeason);

// Episodes
router.post('/seasons/:seasonId/episodes', protect, seriesController.createEpisode);
router.put('/episodes/:id', protect, seriesController.updateEpisode);
router.delete('/episodes/:id', protect, seriesController.deleteEpisode);

module.exports = router;
