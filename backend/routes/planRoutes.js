const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');

// Public route to view plans
router.get('/', planController.getPlans);

// Admin routes (You might want to add authMiddleware here later)
router.post('/', planController.createPlan);
router.put('/:id', planController.updatePlan);
router.delete('/:id', planController.deletePlan);

module.exports = router;
