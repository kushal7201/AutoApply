import { validationResult } from 'express-validator';
import Job from '../models/Job.js';

// @route   GET /api/jobs
// @desc    Get all jobs with filters (renamed to searchJobs for routes)
// @access  Private
export const searchJobs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      location,
      company,
      jobType,
      experienceLevel,
      remote,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query object
    const query = {};

    // Search in title, description, and company
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by location
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Filter by company
    if (company) {
      query.company = { $regex: company, $options: 'i' };
    }

    // Filter by job type
    if (jobType) {
      query.jobType = jobType;
    }

    // Filter by experience level
    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    // Filter by remote option
    if (remote !== undefined) {
      query.remote = remote === 'true';
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const jobs = await Job.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @route   GET /api/jobs/:id
// @desc    Get job by ID
// @access  Private
export const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      data: { job }
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @route   POST /api/jobs
// @desc    Create a new job
// @access  Private (Admin only - for manual job posting)
export const createJob = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const jobData = {
      ...req.body,
      createdBy: req.user.userId
    };

    const job = new Job(jobData);
    await job.save();

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: { job }
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @route   PUT /api/jobs/:id
// @desc    Update job
// @access  Private (Admin only)
export const updateJob = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: { job }
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @route   DELETE /api/jobs/:id
// @desc    Delete job
// @access  Private (Admin only)
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @route   POST /api/jobs/scrape
// @desc    Trigger job scraping from various platforms
// @access  Private (Admin only)
export const scrapeJobs = async (req, res) => {
  try {
    const { platform, keywords, location, limit = 50 } = req.body;

    // This would integrate with your scraping service
    // For now, return a placeholder response
    
    res.json({
      success: true,
      message: 'Job scraping initiated',
      data: {
        platform,
        keywords,
        location,
        limit,
        status: 'queued'
      }
    });
  } catch (error) {
    console.error('Scrape jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @route   GET /api/jobs/stats
// @desc    Get job statistics
// @access  Private
export const getJobStats = async (req, res) => {
  try {
    const stats = await Job.aggregate([
      {
        $group: {
          _id: null,
          totalJobs: { $sum: 1 },
          avgSalaryMin: { $avg: '$salaryRange.min' },
          avgSalaryMax: { $avg: '$salaryRange.max' }
        }
      }
    ]);

    const jobTypeStats = await Job.aggregate([
      {
        $group: {
          _id: '$jobType',
          count: { $sum: 1 }
        }
      }
    ]);

    const locationStats = await Job.aggregate([
      {
        $group: {
          _id: '$location',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        general: stats[0] || { totalJobs: 0, avgSalaryMin: 0, avgSalaryMax: 0 },
        byJobType: jobTypeStats,
        topLocations: locationStats
      }
    });
  } catch (error) {
    console.error('Get job stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @route   POST /api/jobs/:id/save
// @desc    Save job for later
// @access  Private
export const saveJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.userId;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // For now, we'll just return success
    // In a full implementation, you'd save this to a SavedJobs model
    res.json({
      success: true,
      message: 'Job saved successfully',
      data: { jobId, saved: true }
    });
  } catch (error) {
    console.error('Save job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @route   DELETE /api/jobs/:id/save
// @desc    Remove job from saved list
// @access  Private
export const unsaveJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.userId;

    // For now, we'll just return success
    // In a full implementation, you'd remove this from SavedJobs model
    res.json({
      success: true,
      message: 'Job removed from saved list',
      data: { jobId, saved: false }
    });
  } catch (error) {
    console.error('Unsave job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @route   GET /api/jobs/saved
// @desc    Get user's saved jobs
// @access  Private
export const getSavedJobs = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20 } = req.query;

    // For now, return empty array
    // In a full implementation, you'd query SavedJobs model
    res.json({
      success: true,
      data: {
        jobs: [],
        pagination: {
          current: parseInt(page),
          pages: 0,
          total: 0,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get saved jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
