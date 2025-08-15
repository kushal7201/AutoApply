const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: [
      'draft',           // Application being prepared
      'submitted',       // Successfully submitted
      'pending',         // Awaiting response
      'under_review',    // Being reviewed by employer
      'interview_scheduled', // Interview scheduled
      'interviewed',     // Interview completed
      'offer_received',  // Job offer received
      'accepted',        // Offer accepted
      'rejected',        // Application rejected
      'withdrawn',       // Application withdrawn by user
      'expired',         // Application expired
      'failed'           // Technical failure during submission
    ],
    default: 'draft',
    index: true
  },
  method: {
    type: String,
    enum: ['automated', 'manual', 'bulk'],
    default: 'automated'
  },
  submissionDetails: {
    submittedAt: Date,
    submissionMethod: {
      type: String,
      enum: ['autofill', 'manual', 'one_click', 'email']
    },
    timeToComplete: Number, // seconds
    attempts: {
      type: Number,
      default: 1
    },
    lastAttemptAt: Date,
    success: {
      type: Boolean,
      default: false
    },
    errorMessage: String,
    screenshot: {
      url: String,
      cloudinaryPublicId: String
    }
  },
  applicationData: {
    resume: {
      filename: String,
      cloudinaryUrl: String,
      cloudinaryPublicId: String,
      version: String // Track which version was used
    },
    coverLetter: {
      content: String,
      customized: {
        type: Boolean,
        default: false
      },
      template: String
    },
    responses: [{
      question: String,
      answer: String,
      fieldType: {
        type: String,
        enum: ['text', 'textarea', 'select', 'checkbox', 'radio', 'file', 'date']
      },
      required: Boolean
    }],
    additionalDocuments: [{
      type: String, // 'portfolio', 'certificate', 'reference', etc.
      filename: String,
      cloudinaryUrl: String,
      cloudinaryPublicId: String
    }]
  },
  tracking: {
    source: {
      type: String,
      enum: ['job_board', 'company_website', 'referral', 'recruiter', 'other'],
      default: 'job_board'
    },
    referralCode: String,
    utm: {
      source: String,
      medium: String,
      campaign: String,
      term: String,
      content: String
    },
    deviceInfo: {
      userAgent: String,
      platform: String,
      browser: String
    }
  },
  communication: [{
    type: {
      type: String,
      enum: ['email', 'phone', 'message', 'interview_invite', 'rejection', 'offer']
    },
    direction: {
      type: String,
      enum: ['inbound', 'outbound']
    },
    subject: String,
    content: String,
    sender: String,
    recipient: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    attachments: [{
      filename: String,
      url: String,
      type: String
    }],
    read: {
      type: Boolean,
      default: false
    }
  }],
  timeline: [{
    event: {
      type: String,
      enum: [
        'application_started',
        'application_submitted',
        'confirmation_received',
        'under_review',
        'interview_requested',
        'interview_scheduled',
        'interview_completed',
        'reference_requested',
        'background_check',
        'offer_extended',
        'offer_accepted',
        'offer_declined',
        'rejected',
        'withdrawn'
      ]
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    description: String,
    automated: {
      type: Boolean,
      default: true
    },
    metadata: mongoose.Schema.Types.Mixed
  }],
  interview: {
    scheduled: [{
      type: {
        type: String,
        enum: ['phone', 'video', 'in_person', 'technical', 'hr', 'panel']
      },
      scheduledAt: Date,
      duration: Number, // minutes
      location: String,
      meetingLink: String,
      interviewer: {
        name: String,
        email: String,
        role: String
      },
      notes: String,
      completed: {
        type: Boolean,
        default: false
      },
      feedback: String,
      rating: {
        type: Number,
        min: 1,
        max: 5
      }
    }]
  },
  offer: {
    received: {
      type: Boolean,
      default: false
    },
    details: {
      salary: {
        amount: Number,
        currency: String,
        frequency: {
          type: String,
          enum: ['hourly', 'monthly', 'annually']
        }
      },
      benefits: [String],
      startDate: Date,
      location: String,
      remote: Boolean,
      equity: String,
      vacation: String,
      otherPerks: [String]
    },
    deadline: Date,
    negotiable: {
      type: Boolean,
      default: true
    },
    response: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'negotiating']
    },
    responseDate: Date
  },
  analytics: {
    viewedAt: [Date],
    timeSpent: Number, // Total time spent on this application
    clicks: Number,
    profileViews: Number, // How many times employer viewed our profile
    searchAppearances: Number
  },
  notes: [{
    content: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['general', 'interview_prep', 'follow_up', 'reminder'],
      default: 'general'
    }
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  tags: [String],
  archived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
ApplicationSchema.virtual('daysSinceSubmission').get(function() {
  if (!this.submissionDetails.submittedAt) return null;
  
  const diffTime = Math.abs(new Date() - this.submissionDetails.submittedAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

ApplicationSchema.virtual('isRecent').get(function() {
  const days = this.daysSinceSubmission;
  return days !== null && days <= 7;
});

ApplicationSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    'draft': 'Draft',
    'submitted': 'Submitted',
    'pending': 'Pending',
    'under_review': 'Under Review',
    'interview_scheduled': 'Interview Scheduled',
    'interviewed': 'Interviewed',
    'offer_received': 'Offer Received',
    'accepted': 'Accepted',
    'rejected': 'Rejected',
    'withdrawn': 'Withdrawn',
    'expired': 'Expired',
    'failed': 'Failed'
  };
  
  return statusMap[this.status] || this.status;
});

// Methods
ApplicationSchema.methods.addTimelineEvent = function(event, description, metadata = {}) {
  this.timeline.push({
    event,
    description,
    metadata,
    timestamp: new Date(),
    automated: true
  });
  
  return this.save();
};

ApplicationSchema.methods.updateStatus = function(newStatus, description) {
  const oldStatus = this.status;
  this.status = newStatus;
  
  // Add timeline event
  this.addTimelineEvent(
    `status_changed_to_${newStatus}`,
    description || `Status changed from ${oldStatus} to ${newStatus}`,
    { oldStatus, newStatus }
  );
  
  return this.save();
};

ApplicationSchema.methods.markAsRead = function() {
  this.communication.forEach(comm => {
    if (comm.direction === 'inbound') {
      comm.read = true;
    }
  });
  
  return this.save();
};

ApplicationSchema.methods.getLatestCommunication = function() {
  return this.communication
    .sort((a, b) => b.timestamp - a.timestamp)[0] || null;
};

ApplicationSchema.methods.hasUnreadCommunication = function() {
  return this.communication.some(comm => 
    comm.direction === 'inbound' && !comm.read
  );
};

// Static methods
ApplicationSchema.statics.getStatsByUser = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

ApplicationSchema.statics.getRecentActivity = function(userId, days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.find({
    userId: mongoose.Types.ObjectId(userId),
    updatedAt: { $gte: startDate }
  })
  .populate('jobId')
  .sort({ updatedAt: -1 })
  .limit(20);
};

// Indexes
ApplicationSchema.index({ userId: 1, status: 1 });
ApplicationSchema.index({ jobId: 1 });
ApplicationSchema.index({ status: 1, createdAt: -1 });
ApplicationSchema.index({ 'submissionDetails.submittedAt': -1 });
ApplicationSchema.index({ priority: 1, createdAt: -1 });
ApplicationSchema.index({ archived: 1, createdAt: -1 });
ApplicationSchema.index({ tags: 1 });

// Compound indexes
ApplicationSchema.index({ userId: 1, createdAt: -1 });
ApplicationSchema.index({ userId: 1, status: 1, createdAt: -1 });
ApplicationSchema.index({ userId: 1, archived: 1, createdAt: -1 });

module.exports = mongoose.model('Application', ApplicationSchema);
