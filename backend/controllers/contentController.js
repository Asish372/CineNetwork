const { Content, Category, WatchHistory } = require('../models');

// @desc    Get Home Screen Content (Categories with Contents)
// @route   GET /api/content/home
// @access  Public
const getHomeContent = async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [{
        model: Content,
        through: { attributes: [] } // Exclude junction table attributes
      }],
      order: [['displayOrder', 'ASC']]
    });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching home content:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get All Movies
// @route   GET /api/content/movies
// @access  Public
const getMovies = async (req, res) => {
  try {
    const movies = await Content.findAll({
      where: { type: 'movie' },
      order: [['createdAt', 'DESC']]
    });
    res.json(movies);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get All Shorts
// @route   GET /api/content/shorts
// @access  Public
const getShorts = async (req, res) => {
  try {
    const shorts = await Content.findAll({
      where: { type: 'short' },
      order: [['createdAt', 'DESC']]
    });
    res.json(shorts);
  } catch (error) {
    console.error('Error fetching shorts:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Content by ID
// @route   GET /api/content/:id
// @access  Public
const getContentById = async (req, res) => {
  try {
    const content = await Content.findByPk(req.params.id);
    if (content) {
      res.json(content);
    } else {
      res.status(404).json({ message: 'Content not found' });
    }
  } catch (error) {
    console.error('Error fetching content by ID:', error);
    res.status(500).json({ message: error.message });
  }
};



// @desc    Update Watch Progress
// @route   POST /api/content/progress
// @access  Private
const updateProgress = async (req, res) => {
  const { contentId, progress } = req.body;
  const userId = req.user.id;

  try {
    console.log(`[updateProgress] Received request: userId=${userId}, contentId=${contentId} (${typeof contentId}), progress=${progress} (${typeof progress})`);
    
    const parsedContentId = parseInt(contentId, 10);
    const parsedProgress = parseInt(progress, 10);

    if (isNaN(parsedContentId) || isNaN(parsedProgress)) {
        console.error('[updateProgress] Invalid input: contentId or progress is NaN');
        return res.status(400).json({ message: 'Invalid contentId or progress' });
    }

    const [history, created] = await WatchHistory.findOrCreate({
      where: { userId, contentId: parsedContentId },
      defaults: { progress: parsedProgress, lastWatched: new Date() }
    });

    console.log(`[updateProgress] findOrCreate result: created=${created}, historyId=${history.id}`);

    if (!created) {
      console.log(`[updateProgress] Updating existing entry. Old progress: ${history.progress}, New progress: ${parsedProgress}`);
      history.progress = parsedProgress;
      history.lastWatched = new Date();
      await history.save();
      console.log('[updateProgress] Entry updated successfully');
    } else {
      console.log('[updateProgress] New entry created successfully');
    }

    res.json(history);
  } catch (error) {
    console.error('[updateProgress] Error updating progress:', error);
    res.status(500).json({ message: error.message });
  }
};

// Helper to parse duration string to milliseconds
const parseDurationToMs = (durationStr) => {
    if (!durationStr) return 0;
    
    let totalMs = 0;
    
    // Handle "15s" format
    if (durationStr.endsWith('s')) {
        return parseInt(durationStr) * 1000;
    }

    // Handle "2h 28m" or "30m" format
    const parts = durationStr.split(' ');
    for (const part of parts) {
        if (part.endsWith('h')) {
            totalMs += parseInt(part) * 3600 * 1000;
        } else if (part.endsWith('m')) {
            totalMs += parseInt(part) * 60 * 1000;
        }
    }
    
    return totalMs;
};

// @desc    Get Continue Watching List
// @route   GET /api/content/continue-watching
// @access  Private
const getContinueWatching = async (req, res) => {
  const userId = req.user.id;

  try {
    console.log(`Fetching continue watching for user: ${userId}`);
    const history = await WatchHistory.findAll({
      where: { userId },
      include: [{
        model: Content,
        attributes: ['id', 'title', 'thumbnailUrl', 'videoUrl', 'duration', 'type']
      }],
      order: [['lastWatched', 'DESC']],
      limit: 20 // Increased limit to account for filtered items
    });

    console.log(`[getContinueWatching] Found ${history.length} raw history entries`);
    
    // Filter out items that are finished (> 90%)
    const continueWatchingList = history.filter(item => {
        if (!item.Content) return false;
        if (item.progress <= 0) return false;

        const durationMs = parseDurationToMs(item.Content.duration);
        if (durationMs === 0) return true; // Keep if duration unknown

        const percentage = (item.progress / durationMs) * 100;
        const isFinished = percentage > 90; // Consider finished if > 90%

        if (isFinished) {
            console.log(`[getContinueWatching] Filtering out finished item: ${item.Content.title} (${percentage.toFixed(1)}%)`);
        }

        return !isFinished;
    });

    console.log(`Returning ${continueWatchingList.length} continue watching items`);
    res.json(continueWatchingList);
  } catch (error) {
    console.error('Error fetching continue watching:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search Content
// @route   GET /api/content/search
// @access  Public
const searchContent = async (req, res) => {
  const { query } = req.query;
  
  try {
    console.log(`[searchContent] Searching for: ${query}`);
    
    if (!query) {
        return res.json([]);
    }

    const { Op } = require('sequelize');
    
    // Split query into individual terms for smarter matching
    // e.g. "Dark Knight" -> ["Dark", "Knight"]
    // This allows "Knight Dark" to still find "The Dark Knight"
    const terms = query.split(' ').filter(term => term.length > 0);

    const searchConditions = terms.map(term => ({
        [Op.or]: [
            { title: { [Op.like]: `%${term}%` } },
            { description: { [Op.like]: `%${term}%` } },
            { genre: { [Op.like]: `%${term}%` } }
        ]
    }));

    const results = await Content.findAll({
      where: {
        [Op.and]: searchConditions
      },
      limit: 20
    });

    console.log(`[searchContent] Found ${results.length} results`);
    res.json(results);
  } catch (error) {
    console.error('Error searching content:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Content by Category or Genre
// @route   GET /api/content/category/:title
// @access  Public
const getContentByCategory = async (req, res) => {
  const { title } = req.params;

  try {
    console.log(`[getContentByCategory] Fetching content for: ${title}`);

    // 1. Try to find a Category with this title
    const category = await Category.findOne({
      where: { title },
      include: [{
        model: Content,
        through: { attributes: [] }
      }]
    });

    if (category && category.Contents.length > 0) {
      console.log(`[getContentByCategory] Found category '${title}' with ${category.Contents.length} items`);
      return res.json(category.Contents);
    }

    // 2. If no category found (or empty), search by Genre in Content
    // Using Op.like for partial matching (e.g. "Action" matches "Action Movies")
    const { Op } = require('sequelize');
    const contents = await Content.findAll({
      where: {
        genre: { [Op.like]: `%${title}%` }
      },
      limit: 50
    });

    console.log(`[getContentByCategory] Found ${contents.length} items by genre '${title}'`);
    res.json(contents);

  } catch (error) {
    console.error('Error fetching content by category:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getHomeContent,
  getMovies,
  getShorts,
  getContentById,
  updateProgress,
  getContinueWatching,
  searchContent,
  getContentByCategory
};
