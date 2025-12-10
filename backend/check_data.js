require('dotenv').config();
const { sequelize, Content, Layout } = require('./models');

async function checkData() {
  try {
    const contentCount = await Content.count();
    const layouts = await Layout.findAll();
    
    console.log(`Content Count: ${contentCount}`);
    console.log('Layouts:', JSON.stringify(layouts, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

checkData();
