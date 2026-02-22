const mongoose = require('mongoose');
require('dotenv').config();

const dropEmailIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    const db = mongoose.connection.db;
    
    // Drop email index from hospitals collection
    try {
      await db.collection('hospitals').dropIndex('email_1');
      console.log('✅ Dropped email_1 index from hospitals');
    } catch (err) {
      console.log('ℹ️  Email index already dropped or does not exist');
    }

    // Drop email index from laboratories collection
    try {
      await db.collection('laboratories').dropIndex('email_1');
      console.log('✅ Dropped email_1 index from laboratories');
    } catch (err) {
      console.log('ℹ️  Email index already dropped or does not exist');
    }

    console.log('✅ Done! You can now run seedData.js');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

dropEmailIndex();