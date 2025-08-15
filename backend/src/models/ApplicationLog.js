const mongoose = require('mongoose');

const ApplicationLogSchema = new mongoose.Schema({
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
      'pending',     // Queued but not started
      'in_progress', // Currently being processed
      'success',     // Successfully submitted
      'partial',     // Partially completed (manual intervention needed)
      'failed',      // Failed to complete
      'cancelled',   // User cancelled
      'timeout',     // Process timed out
      'blocked'      // Blocked by anti-bot measures
    ],
    default: 'pending',
    index: true
  },
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  attempts: [{
    attemptNumber: Number,
    startedAt: Date,
    completedAt: Date,
    status: {
      type: String,
      enum: ['success', 'failed', 'cancelled', 'timeout', 'blocked']
    },
    error: {
      type: String,
      code: String,
      stack: String
    },
    steps: [{
      name: String,
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'success', 'failed', 'skipped']
      },
      startedAt: Date,
      completedAt: Date,
      details: mongoose.Schema.Types.Mixed,
      error: String,
      screenshot: {
        url: String,
        cloudinaryPublicId: String
      }
    }],
    screenshots: [{
      url: String,
      cloudinaryPublicId: String,
      type: {
        type: String,
        enum: ['initial', 'form_filled', 'submitted', 'error', 'final']
      },
      capturedAt: Date,
      step: String
    }],
    metrics: {
      totalDuration: Number, // in milliseconds
      formFillTime: Number,
      submissionTime: Number,
      waitTime: Number,
      retryCount: Number
    }
  }],
  workerInfo: {
    workerId: String,
    workerType: {
      type: String,
      enum: ['browser_extension', 'playwright_worker', 'manual']
    },
    browserInfo: {
      name: String,
      version: String,
      userAgent: String
    },
    sessionId: String
  },
  formData: {
    submittedData: mongoose.Schema.Types.Mixed,
    fieldsMapping: [{
      fieldName: String,
      fieldType: String,
      profileField: String,
      value: mongoose.Schema.Types.Mixed,
      confidence: Number,
      method: {
        type: String,
        enum: ['exact_match', 'fuzzy_match', 'ai_inference', 'manual_mapping']
      }
    }],
    filesUploaded: [{
      fieldName: String,
      fileName: String,
      fileType: String,
      cloudinaryUrl: String,
      uploadedAt: Date
    }],
    customQuestions: [{
      question: String,
      answer: mongoose.Schema.Types.Mixed,
      answerMethod: {
        type: String,
        enum: ['profile_data', 'default_answer', 'ai_generated', 'manual_input']
      }
    }]
  },
  humanInteraction: {
    required: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      enum: ['captcha', '2fa', 'manual_field', 'account_creation', 'terms_agreement', 'custom_question']
    },
    prompt: String,
    response: mongoose.Schema.Types.Mixed,
    respondedAt: Date,
    timeoutAt: Date,
    skipped: {
      type: Boolean,
      default: false
    }
  },
  connector: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Connector'
  },
  source: {
    platform: String,
    url: String,
    referrer: String
  },
  configuration: {
    maxRetries: {
      type: Number,
      default: 3
    },
    timeout: {
      type: Number,
      default: 300000 // 5 minutes in milliseconds
    },
    waitForHuman: {
      type: Boolean,
      default: true
    },
    takeScreenshots: {
      type: Boolean,
      default: true
    },
    useProxy: {
      type: Boolean,
      default: false
    },
    headless: {
      type: Boolean,
      default: true
    }
  },
  result: {
    applicationId: String, // External application ID if provided
    confirmationNumber: String,
    submissionUrl: String,
    followUpActions: [String],
    nextSteps: String,
    estimatedResponse: String
  },
  analytics: {
    confidenceScore: {
      type: Number,
      min: 0,
      max: 100
    },
    fieldsFilledAutomatically: Number,
    fieldsRequiredManualInput: Number,
    totalFields: Number,
    processingTime: Number,
    queueTime: Number,
    successProbability: Number
  },
  audit: {
    ipAddress: String,
    userAgent: String,
    sessionData: mongoose.Schema.Types.Mixed,
    complianceFlags: [String],
    privacyNotes: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for latest attempt
ApplicationLogSchema.virtual('latestAttempt').get(function() {
  return this.attempts.length > 0 ? this.attempts[this.attempts.length - 1] : null;
});

// Virtual for total attempts count
ApplicationLogSchema.virtual('attemptsCount').get(function() {
  return this.attempts.length;
});

// Virtual for success rate
ApplicationLogSchema.virtual('successRate').get(function() {
  if (this.attempts.length === 0) return 0;
  
  const successfulAttempts = this.attempts.filter(attempt => attempt.status === 'success').length;
  return (successfulAttempts / this.attempts.length) * 100;
});

// Virtual for total processing time
ApplicationLogSchema.virtual('totalProcessingTime').get(function() {
  return this.attempts.reduce((total, attempt) => {
    return total + (attempt.metrics?.totalDuration || 0);
  }, 0);
});

// Virtual for current step
ApplicationLogSchema.virtual('currentStep').get(function() {
  const latestAttempt = this.latestAttempt;
  if (!latestAttempt || !latestAttempt.steps) return null;
  
  return latestAttempt.steps.find(step => 
    step.status === 'in_progress' || step.status === 'pending'
  ) || latestAttempt.steps[latestAttempt.steps.length - 1];
});

// Method to start new attempt
ApplicationLogSchema.methods.startNewAttempt = function() {
  const attemptNumber = this.attempts.length + 1;
  
  const newAttempt = {
    attemptNumber,
    startedAt: new Date(),
    status: 'in_progress',
    steps: [],
    screenshots: [],
    metrics: {
      retryCount: attemptNumber - 1
    }
  };
  
  this.attempts.push(newAttempt);
  this.status = 'in_progress';
  
  return newAttempt;
};

// Method to complete attempt
ApplicationLogSchema.methods.completeAttempt = function(status, result = {}) {
  const latestAttempt = this.latestAttempt;
  if (!latestAttempt) return false;
  
  latestAttempt.completedAt = new Date();
  latestAttempt.status = status;
  
  if (latestAttempt.startedAt) {
    latestAttempt.metrics.totalDuration = 
      latestAttempt.completedAt.getTime() - latestAttempt.startedAt.getTime();
  }
  
  this.status = status;
  
  if (status === 'success' && result) {
    this.result = { ...this.result, ...result };
  }
  
  return true;
};

// Method to add step to current attempt
ApplicationLogSchema.methods.addStep = function(stepData) {
  const latestAttempt = this.latestAttempt;
  if (!latestAttempt) return false;
  
  const step = {
    ...stepData,
    startedAt: new Date(),
    status: 'in_progress'
  };
  
  latestAttempt.steps.push(step);
  return step;
};

// Method to complete step
ApplicationLogSchema.methods.completeStep = function(stepName, status, details = {}) {
  const latestAttempt = this.latestAttempt;
  if (!latestAttempt) return false;
  
  const step = latestAttempt.steps.find(s => s.name === stepName);
  if (!step) return false;
  
  step.completedAt = new Date();
  step.status = status;
  step.details = { ...step.details, ...details };
  
  return true;
};

// Method to add screenshot
ApplicationLogSchema.methods.addScreenshot = function(screenshotData) {
  const latestAttempt = this.latestAttempt;
  if (!latestAttempt) return false;
  
  const screenshot = {
    ...screenshotData,
    capturedAt: new Date()
  };
  
  latestAttempt.screenshots.push(screenshot);
  return screenshot;
};

// Method to require human interaction
ApplicationLogSchema.methods.requireHumanInteraction = function(type, prompt, timeoutMinutes = 30) {
  this.humanInteraction.required = true;
  this.humanInteraction.type = type;
  this.humanInteraction.prompt = prompt;
  this.humanInteraction.timeoutAt = new Date(Date.now() + timeoutMinutes * 60 * 1000);
  this.status = 'partial';
  
  return this.save();
};

// Method to resolve human interaction
ApplicationLogSchema.methods.resolveHumanInteraction = function(response) {
  this.humanInteraction.response = response;
  this.humanInteraction.respondedAt = new Date();
  this.humanInteraction.required = false;
  this.status = 'in_progress';
  
  return this.save();
};

// Method to check if timed out
ApplicationLogSchema.methods.isTimedOut = function() {
  if (!this.humanInteraction.timeoutAt) return false;
  return new Date() > this.humanInteraction.timeoutAt;
};

// Static method to get applications by status
ApplicationLogSchema.statics.getByStatus = function(userId, status) {
  return this.find({ userId, status })
    .populate('jobId')
    .sort({ createdAt: -1 });
};

// Static method to get success rate for user
ApplicationLogSchema.statics.getSuccessRate = function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        successful: {
          $sum: {
            $cond: [{ $eq: ['$status', 'success'] }, 1, 0]
          }
        }
      }
    },
    {
      $project: {
        total: 1,
        successful: 1,
        successRate: {
          $cond: [
            { $gt: ['$total', 0] },
            { $multiply: [{ $divide: ['$successful', '$total'] }, 100] },
            0
          ]
        }
      }
    }
  ]);
};

// Indexes
ApplicationLogSchema.index({ userId: 1, status: 1 });
ApplicationLogSchema.index({ jobId: 1 });
ApplicationLogSchema.index({ status: 1, createdAt: -1 });
ApplicationLogSchema.index({ 'humanInteraction.required': 1, 'humanInteraction.timeoutAt': 1 });
ApplicationLogSchema.index({ 'workerInfo.workerId': 1 });
ApplicationLogSchema.index({ priority: -1, createdAt: 1 });

// Compound indexes
ApplicationLogSchema.index({ userId: 1, createdAt: -1 });
ApplicationLogSchema.index({ status: 1, priority: -1, createdAt: 1 });

module.exports = mongoose.model('ApplicationLog', ApplicationLogSchema);
