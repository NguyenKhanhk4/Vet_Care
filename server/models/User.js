const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Model
 * Represents all users in the system (customer, admin, doctor)
 * Currently only customer role is active
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't include password in queries by default
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9]{10,11}$/, 'Please enter a valid phone number'],
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, 'Address cannot exceed 200 characters'],
    },
    avatar: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ['customer', 'admin', 'doctor'],
      default: 'customer',
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

/**
 * Pre-save middleware to hash password before saving
 * Only hashes if the password field has been modified
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Instance method to compare entered password with hashed password
 * @param {string} enteredPassword - Plain text password to compare
 * @returns {Promise<boolean>} - True if passwords match
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Remove sensitive fields when converting to JSON
 */
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

module.exports = mongoose.model('User', userSchema);
