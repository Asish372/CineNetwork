const { UserInteraction, Content } = require('../models');

// @desc    Add to Watchlist
// @route   POST /api/interactions/watchlist/add
// @access  Private
const addToWatchlist = async (req, res) => {
  const { contentId } = req.body;
  const userId = req.user.id;

  try {
    const [interaction, created] = await UserInteraction.findOrCreate({
      where: { userId, contentId, type: 'watchlist' },
      defaults: { progress: 0 }
    });

    if (created) {
      res.status(201).json({ message: 'Added to watchlist', interaction });
    } else {
      res.json({ message: 'Already in watchlist', interaction });
    }
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove from Watchlist
// @route   POST /api/interactions/watchlist/remove
// @access  Private
const removeFromWatchlist = async (req, res) => {
  const { contentId } = req.body;
  const userId = req.user.id;

  try {
    const deleted = await UserInteraction.destroy({
      where: { userId, contentId, type: 'watchlist' }
    });

    if (deleted) {
      res.json({ message: 'Removed from watchlist' });
    } else {
      res.status(404).json({ message: 'Item not found in watchlist' });
    }
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get User Watchlist
// @route   GET /api/interactions/watchlist
// @access  Private
const getWatchlist = async (req, res) => {
  const userId = req.user.id;

  try {
    const watchlist = await UserInteraction.findAll({
      where: { userId, type: 'watchlist' },
      include: [{
        model: Content,
        attributes: ['id', 'title', 'thumbnailUrl', 'videoUrl', 'genre', 'rating']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(watchlist);
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check if item is in Watchlist
// @route   GET /api/interactions/watchlist/:contentId
// @access  Private
const checkWatchlistStatus = async (req, res) => {
    const { contentId } = req.params;
    const userId = req.user.id;
  
    try {
      const interaction = await UserInteraction.findOne({
        where: { userId, contentId, type: 'watchlist' }
      });
  
      res.json({ isInWatchlist: !!interaction });
    } catch (error) {
      console.error('Error checking watchlist status:', error);
      res.status(500).json({ message: error.message });
    }
  };

module.exports = {
  addToWatchlist,
  removeFromWatchlist,
  getWatchlist,
  checkWatchlistStatus
};
