const mongoose = require('mongoose');

const CandidateProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  personalInfo: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    linkedIn: String,
    portfolio: String,
    github: String,
    website: String
  },
  resumes: [{
    filename: {
      type: String,
      required: true
    },
    cloudinaryUrl: {
      type: String,
      required: true
    },
    cloudinaryPublicId: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      enum: ['pdf', 'doc', 'docx'],
      required: true
    },
    fileSize: Number,
    isActive: {
      type: Boolean,
      default: true
    },
    parsedData: {
      summary: String,
      skills: [String],
      experience: [{
        jobTitle: String,
        company: String,
        startDate: Date,
        endDate: Date,
        current: Boolean,
        description: String,
        achievements: [String]
      }],
      education: [{
        degree: String,
        field: String,
        institution: String,
        startDate: Date,
        endDate: Date,
        gpa: String,
        achievements: [String]
      }],
      certifications: [{
        name: String,
        issuer: String,
        issueDate: Date,
        expiryDate: Date,
        credentialId: String,
        url: String
      }],
      projects: [{
        name: String,
        description: String,
        technologies: [String],
        url: String,
        startDate: Date,
        endDate: Date
      }]
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  defaultResume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'resumes'
  },
  profileCompletion: {
    personalInfo: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    resumes: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    overall: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  preferences: {
    jobTypes: [{
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'temporary', 'internship', 'volunteer']
    }],
    workArrangements: [{
      type: String,
      enum: ['remote', 'hybrid', 'on-site']
    }],
    industries: [String],
    companySizes: [{
      type: String,
      enum: ['startup', 'small', 'medium', 'large', 'enterprise']
    }],
    salaryRange: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'USD'
      }
    },
    locations: [{
      city: String,
      state: String,
      country: String,
      radius: Number // in miles/km
    }],
    keywords: [String],
    excludeKeywords: [String]
  },
  applicationDefaults: {
    coverLetter: String,
    availability: {
      startDate: Date,
      noticePeriod: String
    },
    willingToRelocate: Boolean,
    requiresSponsorship: Boolean,
    veteranStatus: {
      type: String,
      enum: ['none', 'veteran', 'disabled-veteran', 'prefer-not-to-say']
    },
    disability: {
      type: String,
      enum: ['none', 'yes', 'prefer-not-to-say']
    },
    ethnicity: {
      type: String,
      enum: [
        'american-indian',
        'asian',
        'black',
        'hispanic',
        'native-hawaiian',
        'white',
        'two-or-more',
        'prefer-not-to-say'
      ]
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'non-binary', 'prefer-not-to-say']
    }
  },
  customFields: [{
    label: String,
    value: String,
    type: {
      type: String,
      enum: ['text', 'number', 'date', 'boolean', 'select'],
      default: 'text'
    },
    options: [String] // for select type
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
CandidateProfileSchema.virtual('fullName').get(function() {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

// Virtual for active resume
CandidateProfileSchema.virtual('activeResume').get(function() {
  if (this.defaultResume) {
    return this.resumes.find(resume => 
      resume._id.toString() === this.defaultResume.toString() && resume.isActive
    );
  }
  return this.resumes.find(resume => resume.isActive);
});

// Method to calculate profile completion
CandidateProfileSchema.methods.calculateProfileCompletion = function() {
  let personalInfoScore = 0;
  let resumeScore = 0;

  // Personal info scoring (40 points max)
  const personalInfo = this.personalInfo;
  if (personalInfo.firstName) personalInfoScore += 5;
  if (personalInfo.lastName) personalInfoScore += 5;
  if (personalInfo.email) personalInfoScore += 5;
  if (personalInfo.phone) personalInfoScore += 5;
  if (personalInfo.address && personalInfo.address.city) personalInfoScore += 5;
  if (personalInfo.linkedIn) personalInfoScore += 5;
  if (personalInfo.portfolio || personalInfo.github || personalInfo.website) personalInfoScore += 5;
  if (this.preferences.jobTypes && this.preferences.jobTypes.length > 0) personalInfoScore += 5;

  // Resume scoring (60 points max)
  const activeResumes = this.resumes.filter(resume => resume.isActive);
  if (activeResumes.length > 0) {
    resumeScore += 20; // Base score for having a resume
    
    const resume = activeResumes[0];
    if (resume.parsedData) {
      if (resume.parsedData.summary) resumeScore += 10;
      if (resume.parsedData.skills && resume.parsedData.skills.length > 0) resumeScore += 10;
      if (resume.parsedData.experience && resume.parsedData.experience.length > 0) resumeScore += 10;
      if (resume.parsedData.education && resume.parsedData.education.length > 0) resumeScore += 10;
    }
  }

  this.profileCompletion.personalInfo = Math.min(personalInfoScore * 2.5, 100); // Convert to percentage
  this.profileCompletion.resumes = Math.min(resumeScore * 1.67, 100); // Convert to percentage
  this.profileCompletion.overall = Math.round((this.profileCompletion.personalInfo + this.profileCompletion.resumes) / 2);

  return this.profileCompletion;
};

// Method to add resume
CandidateProfileSchema.methods.addResume = function(resumeData) {
  this.resumes.push(resumeData);
  
  // Set as default if it's the first resume
  if (this.resumes.length === 1) {
    this.defaultResume = this.resumes[0]._id;
  }
  
  this.calculateProfileCompletion();
};

// Method to remove resume
CandidateProfileSchema.methods.removeResume = function(resumeId) {
  const resumeIndex = this.resumes.findIndex(resume => 
    resume._id.toString() === resumeId.toString()
  );
  
  if (resumeIndex > -1) {
    this.resumes.splice(resumeIndex, 1);
    
    // Update default resume if needed
    if (this.defaultResume && this.defaultResume.toString() === resumeId.toString()) {
      this.defaultResume = this.resumes.length > 0 ? this.resumes[0]._id : null;
    }
    
    this.calculateProfileCompletion();
    return true;
  }
  
  return false;
};

// Pre-save middleware to calculate completion
CandidateProfileSchema.pre('save', function(next) {
  if (this.isModified('personalInfo') || this.isModified('resumes') || this.isModified('preferences')) {
    this.calculateProfileCompletion();
  }
  next();
});

// Indexes
CandidateProfileSchema.index({ userId: 1 });
CandidateProfileSchema.index({ 'personalInfo.email': 1 });
CandidateProfileSchema.index({ 'profileCompletion.overall': -1 });

module.exports = mongoose.model('CandidateProfile', CandidateProfileSchema);
