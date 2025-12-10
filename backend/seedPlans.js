const { sequelize, SubscriptionPlan } = require('./models');
const dotenv = require('dotenv');

dotenv.config();

const seedPlans = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    const plans = [
        {
            name: 'Weekly Premium',
            price: 49,
            durationInDays: 7,
            features: JSON.stringify(['Ad-free', 'HD Quality', 'Mobile Only']),
            isActive: true
        },
        {
            name: 'Bi-Weekly Premium',
            price: 99,
            durationInDays: 14,
            features: JSON.stringify(['Ad-free', 'Full HD', '2 Devices']),
            isActive: true
        },
        {
            name: 'Monthly Premium',
            price: 199,
            durationInDays: 30,
            features: JSON.stringify(['Ad-free', '4K Ultra HD', '4 Devices', 'Downloads']),
            isActive: true
        },
        {
            name: 'Yearly Premium',
            price: 999,
            durationInDays: 365,
            features: JSON.stringify(['Ad-free', '4K Ultra HD', '4 Devices', 'Downloads', 'Early Access']),
            isActive: true
        }
    ];

    console.log('Seeding Plans...');

    for (const p of plans) {
        // Find or Create based on name and duration to prevent duplicates
        const [plan, created] = await SubscriptionPlan.findOrCreate({
            where: { name: p.name, durationInDays: p.durationInDays },
            defaults: p
        });

        if (created) {
            console.log(`Created: ${p.name}`);
        } else {
            // Update if exists (e.g., price change)
            await plan.update(p);
            console.log(`Updated: ${p.name}`);
        }
    }

    console.log('Plans seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding plans:', error);
    process.exit(1);
  }
};

seedPlans();
