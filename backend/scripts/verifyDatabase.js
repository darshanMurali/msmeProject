const mongoose = require('mongoose');
require('dotenv').config();

const verifyDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hostel-ease');
    console.log('✅ MongoDB Connected Successfully!\n');

    const db = mongoose.connection.db;
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    
    console.log('📊 DATABASE VERIFICATION\n');
    console.log('=' .repeat(60));
    console.log(`Database: ${db.databaseName}`);
    console.log(`Total Collections: ${collections.length}`);
    console.log('=' .repeat(60));
    console.log('\n📁 Collections Found:\n');
    
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      const emoji = count > 0 ? '✅' : '⚠️';
      console.log(`${emoji} ${collection.name.padEnd(25)} → ${count} documents`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('\n🎯 Expected Collections for All 12 Modules:\n');
    
    const expectedCollections = [
      { name: 'users', module: 'User Registration & Management' },
      { name: 'products', module: 'E-commerce Module' },
      { name: 'carts', module: 'E-commerce Module' },
      { name: 'orders', module: 'E-commerce Module' },
      { name: 'wallets', module: 'Digital Wallet' },
      { name: 'foodmenus', module: 'Food Menu Showcase' },
      { name: 'feedbacks', module: 'Feedback System' },
      { name: 'chats', module: 'Communication Module' },
      { name: 'predictionhistories', module: 'Past Prediction Module' },
      { name: 'attendances', module: 'Attendance Module' },
      { name: 'mealfeedbacks', module: 'Meal Feedback' },
      { name: 'leaverequests', module: 'Leave Management' },
      { name: 'announcements', module: 'Announcements' },
      { name: 'foodwastages', module: 'Food Wastage Tracking' },
      { name: 'trainingdatas', module: 'AI Training Data' }
    ];
    
    const collectionNames = collections.map(c => c.name);
    
    for (const expected of expectedCollections) {
      const exists = collectionNames.includes(expected.name);
      const emoji = exists ? '✅' : '❌';
      console.log(`${emoji} ${expected.name.padEnd(25)} - ${expected.module}`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('\n💡 Note: Collections are auto-created when data is inserted.');
    console.log('   Empty collections are normal for a fresh installation.\n');
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Database Connection Error:', error.message);
    process.exit(1);
  }
};

verifyDatabase();
