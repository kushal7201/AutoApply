import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [200, 'Job title cannot exceed 200 characters']
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    trim: true,
    maxlength: [10000, 'Job description cannot exceed 10000 characters']
  },
  requirements: [{
    type: String,
    trim: true,
    maxlength: [500, 'Requirement cannot exceed 500 characters']
  }],
  responsibilities: [{
    type: String,
    trim: true,
    maxlength: [500, 'Responsibility cannot exceed 500 characters']
  }],
  skills: [{
    type: String,
    trim: true,
    maxlength: [50, 'Skill cannot exceed 50 characters']
  }],
  location: {
    type: String,
    required: [true, 'Job location is required'],
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  remote: {
    type: Boolean,
    default: false
  },
  jobType: {
    type: String,
    required: [true, 'Job type is required'],
    enum: {
      values: ['full-time', 'part-time', 'contract', 'freelance', 'internship'],
      message: 'Job type must be one of: full-time, part-time, contract, freelance, internship'
    }
  },
  experienceLevel: {
    type: String,
    required: [true, 'Experience level is required'],
    enum: {
      values: ['entry', 'junior', 'mid', 'senior', 'lead', 'executive'],
      message: 'Experience level must be one of: entry, junior, mid, senior, lead, executive'
    }
  },
  salaryRange: {
    min: {
      type: Number,
      min: [0, 'Minimum salary cannot be negative']
    },
    max: {
      type: Number,
      min: [0, 'Maximum salary cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR']
    },
    period: {
      type: String,
      default: 'yearly',
      enum: ['hourly', 'monthly', 'yearly']
    }
  },
  benefits: [{
    type: String,
    trim: true,
    maxlength: [100, 'Benefit cannot exceed 100 characters']
  }],
  applicationUrl: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Application URL must be a valid URL']
  },
  applicationEmail: {
    type: String,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  deadline: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'filled', 'paused'],
    default: 'active'
  },
  source: {
    platform: {
      type: String,
      enum: ['linkedin', 'indeed', 'glassdoor', 'monster', 'ziprecruiter', 'manual', 'company-website'],
      default: 'manual'
    },
    url: {
      type: String,
      trim: true
    },
    scrapedAt: {
      type: Date
    }
  },
  postedDate: {
    type: Date,
    default: Date.now
  },
  updatedDate: {
    type: Date,
    default: Date.now
  },
  views: {
    type: Number,
    default: 0
  },
  applications: {
    type: Number,
    default: 0
  },
  industry: {
    type: String,
    trim: true,
    maxlength: [100, 'Industry cannot exceed 100 characters']
  },
  companySize: {
    type: String,
    enum: ['startup', 'small', 'medium', 'large', 'enterprise']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for faster queries and search
jobSchema.index({ title: 'text', description: 'text', company: 'text' });
jobSchema.index({ location: 1 });
jobSchema.index({ company: 1 });
jobSchema.index({ jobType: 1 });
jobSchema.index({ experienceLevel: 1 });
jobSchema.index({ remote: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ 'source.platform': 1 });
jobSchema.index({ postedDate: -1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ skills: 1 });
jobSchema.index({ industry: 1 });

// Compound indexes for common queries
jobSchema.index({ status: 1, jobType: 1, location: 1 });
jobSchema.index({ company: 1, status: 1 });
jobSchema.index({ remote: 1, jobType: 1 });

// Virtual for salary display
jobSchema.virtual('salaryDisplay').get(function() {
  if (!this.salaryRange || (!this.salaryRange.min && !this.salaryRange.max)) {
    return 'Not specified';
  }
  
  const { min, max, currency, period } = this.salaryRange;
  const formatSalary = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  if (min && max) {
    return `${formatSalary(min)} - ${formatSalary(max)} per ${period}`;
  } else if (min) {
    return `${formatSalary(min)}+ per ${period}`;
  } else if (max) {
    return `Up to ${formatSalary(max)} per ${period}`;
  }
  
  return 'Not specified';
});

// Virtual for days since posted
jobSchema.virtual('daysSincePosted').get(function() {
  const now = new Date();
  const posted = this.postedDate || this.createdAt;
  const diffTime = Math.abs(now - posted);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Ensure virtuals are included in JSON output
jobSchema.set('toJSON', { virtuals: true });
jobSchema.set('toObject', { virtuals: true });

// Pre-save middleware to validate salary range
jobSchema.pre('save', function(next) {
  if (this.salaryRange && this.salaryRange.min && this.salaryRange.max) {
    if (this.salaryRange.max < this.salaryRange.min) {
      next(new Error('Maximum salary must be greater than minimum salary'));
      return;
    }
  }
  
  this.updatedDate = new Date();
  next();
});

// Method to increment views
jobSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save({ validateBeforeSave: false });
};

// Method to increment applications count
jobSchema.methods.incrementApplications = function() {
  this.applications += 1;
  return this.save({ validateBeforeSave: false });
};

// Static method to find similar jobs
jobSchema.statics.findSimilar = function(jobId, limit = 5) {
  return this.find({
    _id: { $ne: jobId },
    status: 'active'
  })
  .limit(limit)
  .sort({ createdAt: -1 });
};

export default mongoose.model('Job', jobSchema);
