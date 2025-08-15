const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  firstName: {
    type: String,
    required: [true, 'Please provide first name'],
    trim: true,
    maxlength: [50, 'First name cannot be more than 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Please provide last name'],
    trim: true,
    maxlength: [50, 'Last name cannot be more than 50 characters']
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastLogin: {
    type: Date,
    default: Date.now
  },
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: true
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'expired'],
      default: 'active'
    },
    startDate: Date,
    endDate: Date,
    features: {
      maxApplicationsPerDay: {
        type: Number,
        default: 25
      },
      maxRapidApplyJobs: {
        type: Number,
        default: 25
      },
      advancedFilters: {
        type: Boolean,
        default: false
      },
      prioritySupport: {
        type: Boolean,
        default: false
      }
    }
  },
  usage: {
    applicationsToday: {
      type: Number,
      default: 0
    },
    lastApplicationDate: Date,
    totalApplications: {
      type: Number,
      default: 0
    },
    successfulApplications: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to check password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate JWT token
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      email: this.email,
      role: this.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '24h'
    }
  );
};

// Method to generate refresh token
UserSchema.methods.getSignedRefreshToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      type: 'refresh'
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
    }
  );
};

// Method to reset daily usage
UserSchema.methods.resetDailyUsage = function() {
  const today = new Date();
  const lastApplicationDate = this.usage.lastApplicationDate;
  
  if (!lastApplicationDate || 
      today.toDateString() !== lastApplicationDate.toDateString()) {
    this.usage.applicationsToday = 0;
    this.usage.lastApplicationDate = today;
  }
};

// Method to check if user can apply
UserSchema.methods.canApply = function() {
  this.resetDailyUsage();
  return this.usage.applicationsToday < this.subscription.features.maxApplicationsPerDay;
};

// Method to increment application count
UserSchema.methods.incrementApplicationCount = function(successful = false) {
  this.usage.applicationsToday += 1;
  this.usage.totalApplications += 1;
  this.usage.lastApplicationDate = new Date();
  
  if (successful) {
    this.usage.successfulApplications += 1;
  }
};

// Index for email lookup
UserSchema.index({ email: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ 'subscription.plan': 1 });

module.exports = mongoose.model('User', UserSchema);
