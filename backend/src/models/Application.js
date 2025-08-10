import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job is required']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'submitted', 'reviewing', 'interviewing', 'rejected', 'accepted', 'withdrawn'],
      message: 'Status must be one of: pending, submitted, reviewing, interviewing, rejected, accepted, withdrawn'
    },
    default: 'pending'
  },
  coverLetter: {
    type: String,
    trim: true,
    maxlength: [5000, 'Cover letter cannot exceed 5000 characters']
  },
  customResume: {
    url: {
      type: String,
      trim: true
    },
    publicId: {
      type: String,
      trim: true
    }
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  submissionMethod: {
    type: String,
    enum: ['automated', 'manual', 'email'],
    default: 'automated'
  },
  submissionDetails: {
    platform: {
      type: String,
      enum: ['linkedin', 'indeed', 'glassdoor', 'monster', 'ziprecruiter', 'company-website', 'email'],
      trim: true
    },
    submittedAt: {
      type: Date
    },
    confirmationId: {
      type: String,
      trim: true
    },
    submissionUrl: {
      type: String,
      trim: true
    }
  },
  timeline: [{
    status: {
      type: String,
      enum: ['pending', 'submitted', 'reviewing', 'interviewing', 'rejected', 'accepted', 'withdrawn'],
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      trim: true,
      maxlength: [1000, 'Note cannot exceed 1000 characters']
    },
    automated: {
      type: Boolean,
      default: false
    }
  }],
  interviews: [{
    type: {
      type: String,
      enum: ['phone', 'video', 'in-person', 'technical', 'panel'],
      required: true
    },
    scheduledDate: {
      type: Date,
      required: true
    },
    duration: {
      type: Number, // in minutes
      min: [15, 'Interview duration must be at least 15 minutes']
    },
    location: {
      type: String,
      trim: true
    },
    meetingLink: {
      type: String,
      trim: true
    },
    interviewer: {
      name: {
        type: String,
        trim: true
      },
      title: {
        type: String,
        trim: true
      },
      email: {
        type: String,
        trim: true,
        lowercase: true
      }
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
      default: 'scheduled'
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Interview notes cannot exceed 2000 characters']
    },
    feedback: {
      type: String,
      trim: true,
      maxlength: [2000, 'Interview feedback cannot exceed 2000 characters']
    }
  }],
  salary: {
    offered: {
      type: Number,
      min: [0, 'Offered salary cannot be negative']
    },
    negotiated: {
      type: Number,
      min: [0, 'Negotiated salary cannot be negative']
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
  notes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  },
  attachments: [{
    type: {
      type: String,
      enum: ['resume', 'cover-letter', 'portfolio', 'certificate', 'reference', 'other'],
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    publicId: {
      type: String,
      trim: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  followUp: {
    lastFollowUp: {
      type: Date
    },
    nextFollowUp: {
      type: Date
    },
    followUpCount: {
      type: Number,
      default: 0,
      min: [0, 'Follow-up count cannot be negative']
    }
  },
  analytics: {
    responseTime: {
      type: Number // in days
    },
    source: {
      type: String,
      enum: ['organic', 'referral', 'job-board', 'company-career-page', 'recruiter']
    }
  }
}, {
  timestamps: true
});

// Indexes for faster queries
applicationSchema.index({ user: 1, job: 1 }, { unique: true }); // Prevent duplicate applications
applicationSchema.index({ user: 1 });
applicationSchema.index({ job: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ applicationDate: -1 });
applicationSchema.index({ createdAt: -1 });
applicationSchema.index({ 'submissionDetails.platform': 1 });

// Compound indexes for common queries
applicationSchema.index({ user: 1, status: 1 });
applicationSchema.index({ user: 1, applicationDate: -1 });
applicationSchema.index({ status: 1, applicationDate: -1 });

// Virtual for application age in days
applicationSchema.virtual('daysSinceApplication').get(function() {
  const now = new Date();
  const applied = this.applicationDate || this.createdAt;
  const diffTime = Math.abs(now - applied);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for current status duration
applicationSchema.virtual('currentStatusDuration').get(function() {
  if (!this.timeline || this.timeline.length === 0) {
    return this.daysSinceApplication;
  }
  
  const lastStatusChange = this.timeline[this.timeline.length - 1];
  const now = new Date();
  const diffTime = Math.abs(now - lastStatusChange.date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for next scheduled interview
applicationSchema.virtual('nextInterview').get(function() {
  if (!this.interviews || this.interviews.length === 0) {
    return null;
  }
  
  const now = new Date();
  const upcomingInterviews = this.interviews
    .filter(interview => interview.scheduledDate > now && interview.status === 'scheduled')
    .sort((a, b) => a.scheduledDate - b.scheduledDate);
  
  return upcomingInterviews.length > 0 ? upcomingInterviews[0] : null;
});

// Ensure virtuals are included in JSON output
applicationSchema.set('toJSON', { virtuals: true });
applicationSchema.set('toObject', { virtuals: true });

// Pre-save middleware to add status to timeline
applicationSchema.pre('save', function(next) {
  // If status has changed, add to timeline
  if (this.isModified('status')) {
    const newTimelineEntry = {
      status: this.status,
      date: new Date(),
      automated: true
    };
    
    // Only add if it's different from the last status
    if (this.timeline.length === 0 || 
        this.timeline[this.timeline.length - 1].status !== this.status) {
      this.timeline.push(newTimelineEntry);
    }
  }
  
  next();
});

// Method to update status with note
applicationSchema.methods.updateStatus = function(newStatus, note = '', automated = false) {
  this.status = newStatus;
  
  const timelineEntry = {
    status: newStatus,
    date: new Date(),
    note,
    automated
  };
  
  this.timeline.push(timelineEntry);
  return this.save();
};

// Method to schedule interview
applicationSchema.methods.scheduleInterview = function(interviewData) {
  this.interviews.push(interviewData);
  
  // Update status to interviewing if not already
  if (this.status === 'submitted' || this.status === 'reviewing') {
    this.status = 'interviewing';
  }
  
  return this.save();
};

// Method to add follow-up
applicationSchema.methods.addFollowUp = function(nextFollowUpDate) {
  this.followUp.lastFollowUp = new Date();
  this.followUp.nextFollowUp = nextFollowUpDate;
  this.followUp.followUpCount += 1;
  
  return this.save();
};

// Static method to get applications by status
applicationSchema.statics.getByStatus = function(userId, status) {
  return this.find({ user: userId, status }).populate('job', 'title company location');
};

// Static method to get applications requiring follow-up
applicationSchema.statics.getRequiringFollowUp = function(userId) {
  const today = new Date();
  return this.find({
    user: userId,
    'followUp.nextFollowUp': { $lte: today },
    status: { $in: ['submitted', 'reviewing', 'interviewing'] }
  }).populate('job', 'title company');
};

export default mongoose.model('Application', applicationSchema);
