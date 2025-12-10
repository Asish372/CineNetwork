const { User, Content, UserInteraction, Sequelize } = require('../models');

// Get Dashboard Stats
// Get Dashboard Stats
exports.getDashboardStats = async (req, res) => {
    // ... existing code ...
};

exports.verifyToken = async (req, res) => {
    // If request reaches here, token is valid (middleware passed)
    res.status(200).json({ valid: true, user: req.user });
};

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalContent = await Content.count();
    
    // Calculate total views from Content model
    const totalViewsResult = await Content.sum('views');
    const totalViews = totalViewsResult || 0;

    // Calculate total interactions (likes, etc.) or just count rows
    const totalInteractions = await UserInteraction.count();

    res.json({
      totalUsers,
      totalContent,
      totalViews,
      totalInteractions
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get Dashboard Trends
exports.getDashboardTrends = async (req, res) => {
  try {
    // For now, return mock data or simple aggregations.
    // In a real app, you might aggregate views by day from a History table.
    const range = req.query.range || 7; // days
    
    // Mock data structure expected by typical charts
    const labels = [];
    const data = [];
    
    const today = new Date();
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
      // Random mock data for visualization purposes until we have real historical metrics
      data.push(Math.floor(Math.random() * 50) + 10); 
    }

    res.json({
      labels,
      datasets: [
        {
          label: 'Daily Views',
          data,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }
      ]
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get System Alerts
exports.getDashboardAlerts = async (req, res) => {
  try {
    // Return system health alerts
    const alerts = [
      { id: 1, type: 'info', message: 'System running smoothly.', timestamp: new Date() },
      // Check for potential issues (e.g., high memory, failed jobs) - Mock for now
    ];

    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get Live Data
exports.getDashboardLive = async (req, res) => {
  try {
    // If Socket.IO is attached to the app like app.get('io')
    const io = req.app.get('io');
    const activeConnections = io ? io.engine.clientsCount : 0;

    res.json({
      activeUsers: activeConnections,
      serverTime: new Date(),
    });
  } catch (error) {
    console.error('Error fetching live data:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get All Users (Paginated)
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.json({
        users: rows,
        total: count,
        page,
        pages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get Dashboard Widgets Data
exports.getDashboardWidgets = async (req, res) => {
  try {
    // 1. Top 10 Titles by Plays (Views)
    const topContent = await Content.findAll({
        order: [['views', 'DESC']],
        limit: 5,
        attributes: ['id', 'title', 'views', 'rating', 'type', 'thumbnailUrl']
    });

    // 2. Recent Users (New Registrations)
    const recentUsers = await User.findAll({
        order: [['createdAt', 'DESC']],
        limit: 10,
        attributes: ['id', 'fullName', 'email', 'createdAt']
    });

    res.json({
        topContent,
        recentUsers
    });

  } catch (error) {
    console.error('Error fetching dashboard widgets:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get All Subscriptions (Paginated)
exports.getAllSubscriptions = async (req, res) => {
  try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const { UserSubscription, User, SubscriptionPlan } = require('../models');
      const { count, rows } = await UserSubscription.findAndCountAll({
          include: [
              { model: User, attributes: ['id', 'fullName', 'email', 'phone'] },
              { model: SubscriptionPlan, attributes: ['id', 'name', 'price', 'durationInDays'] }
          ],
          order: [['startDate', 'DESC']],
          limit,
          offset
      });
      
      res.json({
          subscriptions: rows,
          total: count,
          page,
          pages: Math.ceil(count / limit)
      });
  } catch (error) {
      console.error('Error fetching subscriptions:', error);
      res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
    getDashboardStats: exports.getDashboardStats,
    getDashboardTrends: exports.getDashboardTrends,
    getDashboardLive: exports.getDashboardLive,
    getDashboardAlerts: exports.getDashboardAlerts,
    getAllUsers: exports.getAllUsers,
    getDashboardWidgets: exports.getDashboardWidgets,
    getAllSubscriptions: exports.getAllSubscriptions,
    verifyToken: exports.verifyToken
};
