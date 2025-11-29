const { Content, Category } = require('../models');

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

module.exports = {
  getHomeContent,
  getMovies,
  getShorts,
  getContentById
};
