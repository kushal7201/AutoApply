const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  company: {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    logo: String,
    website: String,
    size: {
      type: String,
      enum: ['startup', 'small', 'medium', 'large', 'enterprise']
    },
    industry: String,
    description: String
  },
  location: {
    city: String,
    state: String,
    country: String,
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    remote: {
      type: Boolean,
      default: false
    },
    hybrid: {
      type: Boolean,
      default: false
    }
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'temporary', 'internship', 'volunteer'],
    required: true
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'junior', 'mid', 'senior', 'lead', 'executive'],
    index: true
  },
  salary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    type: {
      type: String,
      enum: ['hourly', 'annual', 'contract'],
      default: 'annual'
    },
    disclosed: {
      type: Boolean,
      default: false
    }
  },
  description: {
    type: String,
    required: true
  },
  requirements: [String],
  responsibilities: [String],
  benefits: [String],
  skills: [{
    name: String,
    required: {
      type: Boolean,
      default: false
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert']
    }
  }],
  applicationInfo: {
    applyUrl: {
      type: String,
      required: true
    },
    externalId: String, // ID from the source platform
    deadline: Date,
    easyApply: {
      type: Boolean,
      default: false
    },
    requiresCoverLetter: {
      type: Boolean,
      default: false
    },
    questionsRequired: [{
      question: String,
      type: {
        type: String,
        enum: ['text', 'boolean', 'select', 'number', 'date'],
        default: 'text'
      },
      required: {
        type: Boolean,
        default: false
      },
      options: [String]
    }]
  },
  source: {
    platform: {
      type: String,
      required: true,
      enum: ['linkedin', 'indeed', 'glassdoor', 'monster', 'ziprecruiter', 'company_website', 'other']
    },
    url: {
      type: String,
      required: true
    },
    scrapedAt: {
      type: Date,
      default: Date.now
    },
    lastUpdated: Date
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'filled', 'removed'],
    default: 'active',
    index: true
  },
  postedDate: {
    type: Date,
    index: true
  },
  expiryDate: Date,
  metadata: {
    views: {
      type: Number,
      default: 0
    },
    applications: {
      type: Number,
      default: 0
    },
    saves: {
      type: Number,
      default: 0
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    tags: [String],
    industries: [String],
    featured: {
      type: Boolean,
      default: false
    }
  },
  autofillCompatibility: {
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    lastChecked: Date,
    supportedFields: [String],
    knownIssues: [String],
    connector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Connector'
    }
  },
  rawData: {
    html: String,
    json: mongoose.Schema.Types.Mixed,
    screenshots: [{
      url: String,
      cloudinaryPublicId: String,
      type: {
        type: String,
        enum: ['full_page', 'job_details', 'application_form']
      },
      capturedAt: Date
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full location
JobSchema.virtual('fullLocation').get(function() {
  const parts = [];
  if (this.location.city) parts.push(this.location.city);
  if (this.location.state) parts.push(this.location.state);
  if (this.location.country) parts.push(this.location.country);
  
  let location = parts.join(', ');
  
  if (this.location.remote) {
    location = location ? `${location} (Remote)` : 'Remote';
  } else if (this.location.hybrid) {
    location = location ? `${location} (Hybrid)` : 'Hybrid';
  }
  
  return location;
});

// Virtual for salary range display
JobSchema.virtual('salaryDisplay').get(function() {
  if (!this.salary.disclosed || (!this.salary.min && !this.salary.max)) {
    return 'Not disclosed';
  }
  
  const currency = this.salary.currency || 'USD';
  const type = this.salary.type || 'annual';
  
  let display = '';
  
  if (this.salary.min && this.salary.max) {
    display = `${currency} ${this.salary.min.toLocaleString()} - ${this.salary.max.toLocaleString()}`;
  } else if (this.salary.min) {
    display = `${currency} ${this.salary.min.toLocaleString()}+`;
  } else if (this.salary.max) {
    display = `Up to ${currency} ${this.salary.max.toLocaleString()}`;
  }
  
  if (type !== 'annual') {
    display += ` per ${type === 'hourly' ? 'hour' : 'contract'}`;
  }
  
  return display;
});

// Virtual for experience level display
JobSchema.virtual('experienceLevelDisplay').get(function() {
  const levels = {
    'entry': 'Entry Level',
    'junior': 'Junior Level',
    'mid': 'Mid Level',
    'senior': 'Senior Level',
    'lead': 'Lead Level',
    'executive': 'Executive Level'
  };
  
  return levels[this.experienceLevel] || 'Not specified';
});

// Method to increment view count
JobSchema.methods.incrementViews = function() {
  this.metadata.views += 1;
  return this.save();
};

// Method to increment save count
JobSchema.methods.incrementSaves = function() {
  this.metadata.saves += 1;
  return this.save();
};

// Method to increment application count
JobSchema.methods.incrementApplications = function() {
  this.metadata.applications += 1;
  return this.save();
};

// Method to check if job is fresh (posted within last 7 days)
JobSchema.methods.isFresh = function() {
  if (!this.postedDate) return false;
  
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  return this.postedDate >= weekAgo;
};

// Method to check if job is expiring soon (within 3 days)
JobSchema.methods.isExpiringSoon = function() {
  if (!this.expiryDate) return false;
  
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  
  return this.expiryDate <= threeDaysFromNow;
};

// Static method to find similar jobs
JobSchema.statics.findSimilar = function(jobId, limit = 5) {
  return this.findById(jobId).then(job => {
    if (!job) return [];
    
    return this.find({
      _id: { $ne: jobId },
      status: 'active',
      $or: [
        { 'company.name': job.company.name },
        { 
          title: { 
            $regex: job.title.split(' ').slice(0, 2).join('|'), 
            $options: 'i' 
          } 
        },
        { 
          skills: { 
            $in: job.skills.map(skill => skill.name) 
          } 
        }
      ]
    })
    .limit(limit)
    .sort({ postedDate: -1 });
  });
};

// Indexes
JobSchema.index({ title: 'text', 'company.name': 'text', description: 'text' });
JobSchema.index({ 'location.city': 1, 'location.state': 1, 'location.country': 1 });
JobSchema.index({ jobType: 1, experienceLevel: 1 });
JobSchema.index({ 'salary.min': 1, 'salary.max': 1 });
JobSchema.index({ postedDate: -1 });
JobSchema.index({ status: 1, postedDate: -1 });
JobSchema.index({ 'source.platform': 1 });
JobSchema.index({ 'metadata.featured': 1, postedDate: -1 });
JobSchema.index({ 'skills.name': 1 });

// Compound indexes
JobSchema.index({ status: 1, 'location.remote': 1, jobType: 1 });
JobSchema.index({ 'company.name': 1, status: 1, postedDate: -1 });

module.exports = mongoose.model('Job', JobSchema);
