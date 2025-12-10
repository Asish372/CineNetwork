const dotenv = require('dotenv');
dotenv.config();
const sequelize = require('./config/db');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    const email = 'admin@cinenetwork.com';
    const password = '258022';
    const fullName = 'Super Admin';
    const phone = '9999999999';

    // Check if exists
    let user = await User.findOne({ where: { email } });

    if (user) {
      console.log('Admin user exists. Updating password...');
      // Set plain password; the beforeUpdate hook in User.js will hash it
      user.password = password; 
      await user.save();
      console.log('Admin password updated.');
    } else {
      console.log('Creating admin user...');
      // Create triggers beforeCreate hook which hashes password
      await User.create({
        fullName,
        email,
        phone,
        password
      });
      console.log('Admin user created.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedAdmin();
