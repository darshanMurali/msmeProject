const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'admin', 'superadmin'],
    default: 'student'
  },
  studentType: {
    type: String,
    enum: ['hosteller', 'day_scholar'],
    required: function () { return this.role === 'student'; }
  },
  collegeRegistrationNumber: {
    type: String,
    required: function () { return this.role === 'student'; },
    unique: true,
    sparse: true,
    trim: true
  },
  roomNumber: {
    type: String,
    required: function () { return this.role === 'student' && this.studentType === 'hosteller'; },
    trim: true
  },
  photo: {
    type: String,
    default: 'default-avatar.jpg'
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    maxlength: [15, 'Phone number cannot be longer than 15 characters']
  },
  parentContact: {
    type: String,
    required: function () { return this.role === 'student'; },
    maxlength: [15, 'Parent contact number cannot be longer than 15 characters']
  },
  department: {
    type: String,
    trim: true
  },
  year: {
    type: Number,
    min: 1,
    max: 5
  },
  isActive: {
    type: Boolean,
    default: true
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ collegeRegistrationNumber: 1 });
userSchema.index({ studentType: 1 });
userSchema.index({ roomNumber: 1 });
userSchema.index({ createdAt: -1 });

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET || 'fallback-secret-key',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
