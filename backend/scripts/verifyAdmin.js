require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const verifyOrCreateAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hostel-ease');
    console.log('✅ MongoDB connected\n');

    // Check if admin exists
    let admin = await User.findOne({ email: 'admin123@gmail.com' });

    if (admin) {
      console.log('✅ Admin account exists!');
      console.log('\n📧 Admin Details:');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Name: ${admin.name}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Student Type: ${admin.studentType || 'N/A'}`);
      console.log(`   Created: ${admin.createdAt}`);
      console.log('\n✅ Admin can login with:');
      console.log(`   Email: admin123@gmail.com`);
      console.log(`   Password: @admin123`);
    } else {
      console.log('⚠️  Admin account not found!');
      console.log('🔧 Creating admin account...\n');

      // Hash password
      const hashedPassword = await bcrypt.hash('@admin123', 10);

      // Create admin
      admin = await User.create({
        name: 'Admin',
        email: 'admin123@gmail.com',
        password: hashedPassword,
        role: 'admin',
        studentType: 'hosteller', // Required field
        phone: '1234567890',
        collegeRegNo: 'ADMIN001',
        roomNumber: 'ADMIN',
        photo: ''
      });

      console.log('✅ Admin account created successfully!');
      console.log('\n📧 Admin Details:');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Name: ${admin.name}`);
      console.log(`   Role: ${admin.role}`);
      console.log('\n✅ Admin can login with:');
      console.log(`   Email: admin123@gmail.com`);
      console.log(`   Password: @admin123`);
    }

    // Count total users
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    console.log('\n📊 User Statistics:');
    console.log(`   Total Users: ${totalUsers}`);
    console.log(`   Students: ${totalStudents}`);
    console.log(`   Admins: ${totalAdmins}`);

    console.log('\n🎉 Admin verification complete!');
    console.log('\n🚀 You can now:');
    console.log('   1. Start backend: npm run dev');
    console.log('   2. Start frontend: npm start');
    console.log('   3. Login at: http://localhost:3000');
    console.log('   4. Use credentials above');
    console.log('   5. Access admin panel: http://localhost:3000/admin');

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

verifyOrCreateAdmin();
