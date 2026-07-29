require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Feedback = require('../models/Feedback');
const MealFeedback = require('../models/MealFeedback');
const LeaveRequest = require('../models/LeaveRequest');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Wallet = require('../models/Wallet');
const Chat = require('../models/Chat');

const clearStudentData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hostel-ease');
    console.log('✅ MongoDB connected\n');

    console.log('🗑️  CLEARING ALL STUDENT DATA...\n');

    // Get all student IDs (not admin)
    const students = await User.find({ role: 'student' });
    const studentIds = students.map(s => s._id);

    console.log(`📊 Found ${students.length} student accounts to delete\n`);

    if (students.length === 0) {
      console.log('✅ No student data to clear!\n');
      mongoose.connection.close();
      process.exit(0);
    }

    // Delete student-related data
    console.log('🔄 Deleting student data...\n');

    // 1. Delete all student users
    const deletedUsers = await User.deleteMany({ role: 'student' });
    console.log(`✅ Deleted ${deletedUsers.deletedCount} student accounts`);

    // 2. Delete all attendance records
    const deletedAttendance = await Attendance.deleteMany({ student: { $in: studentIds } });
    console.log(`✅ Deleted ${deletedAttendance.deletedCount} attendance records`);

    // 3. Delete all general feedback
    const deletedFeedback = await Feedback.deleteMany({ student: { $in: studentIds } });
    console.log(`✅ Deleted ${deletedFeedback.deletedCount} feedback records`);

    // 4. Delete all meal feedback
    const deletedMealFeedback = await MealFeedback.deleteMany({ student: { $in: studentIds } });
    console.log(`✅ Deleted ${deletedMealFeedback.deletedCount} meal feedback records`);

    // 5. Delete all leave requests
    const deletedLeave = await LeaveRequest.deleteMany({ student: { $in: studentIds } });
    console.log(`✅ Deleted ${deletedLeave.deletedCount} leave requests`);

    // 6. Delete all orders
    const deletedOrders = await Order.deleteMany({ user: { $in: studentIds } });
    console.log(`✅ Deleted ${deletedOrders.deletedCount} orders`);

    // 7. Delete all carts
    const deletedCarts = await Cart.deleteMany({ user: { $in: studentIds } });
    console.log(`✅ Deleted ${deletedCarts.deletedCount} carts`);

    // 8. Delete all wallets
    const deletedWallets = await Wallet.deleteMany({ user: { $in: studentIds } });
    console.log(`✅ Deleted ${deletedWallets.deletedCount} wallets`);

    // 9. Delete all chat messages
    const deletedChats = await Chat.deleteMany({ 
      $or: [
        { sender: { $in: studentIds } },
        { receiver: { $in: studentIds } }
      ]
    });
    console.log(`✅ Deleted ${deletedChats.deletedCount} chat messages`);

    console.log('\n🎉 ALL STUDENT DATA CLEARED SUCCESSFULLY!\n');

    // Verify admin is still there
    const adminCount = await User.countDocuments({ role: 'admin' });
    console.log('✅ VERIFICATION:');
    console.log(`   Admin accounts remaining: ${adminCount}`);
    console.log(`   Student accounts remaining: 0`);
    console.log('   All student-related data: DELETED\n');

    console.log('💡 You can now:');
    console.log('   1. Register new students');
    console.log('   2. Start fresh with clean database');
    console.log('   3. Admin account is preserved (admin123@gmail.com)\n');

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

clearStudentData();
