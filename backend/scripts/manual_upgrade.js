const { sequelize, User, UserSubscription, SubscriptionPlan } = require('../models');
require('dotenv').config();

const upgradeUser = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // 1. Find User
        const phone = '7205417412';
        const user = await User.findOne({ where: { phone } });

        if (!user) {
            console.error(`User with phone ${phone} not found!`);
            process.exit(1);
        }
        console.log(`Found User: ${user.fullName} (ID: ${user.id})`);

        // 2. Find a Plan (Prefer "Gold" or "Yearly")
        let plan = await SubscriptionPlan.findOne({ where: { name: 'Gold Premium' } });
        if (!plan) {
             plan = await SubscriptionPlan.findOne({ where: { name: 'Yearly' } });
        }
        if (!plan) {
            // Fallback to any plan
            plan = await SubscriptionPlan.findOne();
        }

        if (!plan) {
            console.error('No Subscription Plans found in DB. Please create one in Admin Panel first.');
            process.exit(1);
        }
        console.log(`Assigning Plan: ${plan.name} (Duration: ${plan.durationInDays} days)`);

        // 3. Create or Update Subscription
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 365); // Give 1 year access

        const [subscription, created] = await UserSubscription.findOrCreate({
            where: { userId: user.id },
            defaults: {
                planId: plan.id,
                startDate: startDate,
                endDate: endDate,
                status: 'active',
                paymentId: 'MANUAL_UPGRADE_ADMIN'
            }
        });

        if (!created) {
            await subscription.update({
                planId: plan.id,
                startDate: startDate,
                endDate: endDate,
                status: 'active',
                paymentId: 'MANUAL_UPGRADE_ADMIN'
            });
            console.log('Updated existing subscription.');
        } else {
            console.log('Created new subscription.');
        }

        console.log('User upgraded to Premium successfully!');
        process.exit(0);

    } catch (error) {
        console.error('Error upgrading user:', error);
        process.exit(1);
    }
};

upgradeUser();
