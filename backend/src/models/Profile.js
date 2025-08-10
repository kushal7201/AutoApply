import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [1000, 'Bio cannot exceed 1000 characters']
  },
  skills: [{
    type: String,
    trim: true,
    maxlength: [50, 'Skill name cannot exceed 50 characters']
  }],
  experience: [{
    company: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    position: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Position cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date
    },
    current: {
      type: Boolean,
      default: false
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters']
    }
  }],
  education: [{
    institution: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Institution name cannot exceed 100 characters']
    },
    degree: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Degree cannot exceed 100 characters']
    },
    field: {
      type: String,
      trim: true,
      maxlength: [100, 'Field of study cannot exceed 100 characters']
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date
    },
    current: {
      type: Boolean,
      default: false
    },
    gpa: {
      type: Number,
      min: [0, 'GPA cannot be negative'],
      max: [4.0, 'GPA cannot exceed 4.0']
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters']
    }
  }],
  resumeUrl: {
    type: String,
    trim: true
  },
  resumePublicId: {
    type: String,
    trim: true
  },
  photoUrl: {
    type: String,
    trim: true
  },
  photoPublicId: {
    type: String,
    trim: true
  },
  linkedinUrl: {
    type: String,
    trim: true,
    match: [
      /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/,
      'Please enter a valid LinkedIn URL'
    ]
  },
  githubUrl: {
    type: String,
    trim: true,
    match: [
      /^https?:\/\/(www\.)?github\.com\/[\w-]+\/?$/,
      'Please enter a valid GitHub URL'
    ]
  },
  portfolioUrl: {
    type: String,
    trim: true,
    match: [
      /^https?:\/\/.+/,
      'Please enter a valid URL'
    ]
  },
  preferences: {
    jobTypes: [{
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship']
    }],
    locations: [{
      type: String,
      trim: true
    }],
    remoteWork: {
      type: Boolean,
      default: false
    },
    salaryMin: {
      type: Number,
      min: [0, 'Minimum salary cannot be negative']
    },
    salaryMax: {
      type: Number,
      min: [0, 'Maximum salary cannot be negative']
    },
    industries: [{
      type: String,
      trim: true
    }]
  }
}, {
  timestamps: true
});

// Indexes for faster queries
profileSchema.index({ user: 1 });
profileSchema.index({ skills: 1 });
profileSchema.index({ 'experience.company': 1 });
profileSchema.index({ location: 1 });

// Virtual for full name
profileSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.firstName || this.lastName || '';
});

// Virtual for current experience
profileSchema.virtual('currentExperience').get(function() {
  return this.experience.filter(exp => exp.current);
});

// Virtual for current education
profileSchema.virtual('currentEducation').get(function() {
  return this.education.filter(edu => edu.current);
});

// Ensure virtuals are included in JSON output
profileSchema.set('toJSON', { virtuals: true });
profileSchema.set('toObject', { virtuals: true });

// Validate that endDate is after startDate for experience
profileSchema.pre('save', function(next) {
  // Validate experience dates
  for (const exp of this.experience) {
    if (exp.endDate && exp.startDate && exp.endDate < exp.startDate) {
      next(new Error('End date must be after start date for experience'));
      return;
    }
  }
  
  // Validate education dates
  for (const edu of this.education) {
    if (edu.endDate && edu.startDate && edu.endDate < edu.startDate) {
      next(new Error('End date must be after start date for education'));
      return;
    }
  }
  
  // Validate salary preferences
  if (this.preferences && this.preferences.salaryMax && this.preferences.salaryMin) {
    if (this.preferences.salaryMax < this.preferences.salaryMin) {
      next(new Error('Maximum salary must be greater than minimum salary'));
      return;
    }
  }
  
  next();
});

export default mongoose.model('Profile', profileSchema);
