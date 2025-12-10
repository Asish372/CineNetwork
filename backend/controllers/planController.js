const { SubscriptionPlan } = require('../models');

// Helper to parse JSON fields
const parsePlan = (plan) => {
    if (!plan) return null;
    const p = plan.toJSON();
    if (typeof p.features === 'string') {
        try { p.features = JSON.parse(p.features); } catch(e) { p.features = []; }
    }
    return p;
};

exports.createPlan = async (req, res) => {
  try {
    const { name, price, durationInDays, features } = req.body;
    const plan = await SubscriptionPlan.create({ name, price, durationInDays, features });
    res.status(201).json(parsePlan(plan));
  } catch (error) {
    res.status(500).json({ message: 'Error creating plan', error });
  }
};

exports.getPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.findAll({ where: { isActive: true } });
    const parsedPlans = plans.map(p => parsePlan(p));
    res.json(parsedPlans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching plans', error });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await SubscriptionPlan.findByPk(id);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    
    await plan.update(req.body);
    res.json(parsePlan(plan));
  } catch (error) {
    res.status(500).json({ message: 'Error updating plan', error });
  }
};

exports.deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await SubscriptionPlan.findByPk(id);
    if (plan) {
      // Soft delete by setting isActive to false
      await plan.update({ isActive: false });
    }
    res.json({ message: 'Plan deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting plan', error });
  }
};
