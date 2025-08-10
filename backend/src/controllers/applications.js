import { validationResult } from 'express-validator';
import Application from '../models/Application.js';
import Job from '../models/Job.js';

// @route   GET /api/applications
// @desc    Get user's job applications
// @access  Private
export const getApplications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query object
    const query = { user: req.user.userId };

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with job population
    const applications = await Application.find(query)
      .populate('job', 'title company location jobType salaryRange')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Application.countDocuments(query);

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @route   GET /api/applications/:id
// @desc    Get application by ID
// @access  Private
export const getApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user.userId
    }).populate('job');
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      data: { application }
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @route   POST /api/applications
// @desc    Create a new job application (renamed to applyToJob for routes)
// @access  Private
export const applyToJob = async (req, res) => {
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

    const { coverLetter, customResume } = req.body;
    const jobId = req.params.jobId;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user already applied to this job
    const existingApplication = await Application.findOne({
      user: req.user.userId,
      job: jobId
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this job'
      });
    }

    // Create application
    const application = new Application({
      user: req.user.userId,
      job: jobId,
      coverLetter,
      customResume,
      status: 'pending'
    });

    await application.save();

    // Populate job details for response
    await application.populate('job', 'title company location jobType');

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: { application }
    });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @route   PUT /api/applications/:id
// @desc    Update application
// @access  Private
export const updateApplication = async (req, res) => {
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

    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('job', 'title company location jobType');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      message: 'Application updated successfully',
      data: { application }
    });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @route   DELETE /api/applications/:id
// @desc    Delete application
// @access  Private
export const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @route   POST /api/applications/bulk
// @desc    Apply to multiple jobs at once
// @access  Private
export const bulkApply = async (req, res) => {
  try {
    const { jobIds, coverLetter, customResume } = req.body;

    if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Job IDs array is required'
      });
    }

    const results = [];
    const errors = [];

    for (const jobId of jobIds) {
      try {
        // Check if job exists
        const job = await Job.findById(jobId);
        if (!job) {
          errors.push({ jobId, error: 'Job not found' });
          continue;
        }

        // Check if already applied
        const existingApplication = await Application.findOne({
          user: req.user.userId,
          job: jobId
        });

        if (existingApplication) {
          errors.push({ jobId, error: 'Already applied to this job' });
          continue;
        }

        // Create application
        const application = new Application({
          user: req.user.userId,
          job: jobId,
          coverLetter,
          customResume,
          status: 'pending'
        });

        await application.save();
        results.push({ jobId, applicationId: application._id, status: 'success' });
      } catch (error) {
        errors.push({ jobId, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `Applied to ${results.length} jobs successfully`,
      data: {
        successful: results,
        failed: errors,
        totalProcessed: jobIds.length,
        successCount: results.length,
        errorCount: errors.length
      }
    });
  } catch (error) {
    console.error('Bulk apply error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @route   GET /api/applications/stats
// @desc    Get application statistics
// @access  Private
export const getApplicationStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get status distribution
    const statusStats = await Application.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get total applications
    const totalApplications = await Application.countDocuments({ user: userId });

    // Get recent applications (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentApplications = await Application.countDocuments({
      user: userId,
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get success rate (accepted / total)
    const acceptedCount = await Application.countDocuments({
      user: userId,
      status: 'accepted'
    });

    const successRate = totalApplications > 0 ? (acceptedCount / totalApplications) * 100 : 0;

    res.json({
      success: true,
      data: {
        total: totalApplications,
        recent: recentApplications,
        successRate: Math.round(successRate * 100) / 100,
        byStatus: statusStats,
        accepted: acceptedCount
      }
    });
  } catch (error) {
    console.error('Get application stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @route   POST /api/applications/:id/retry
// @desc    Retry failed application
// @access  Private
export const retryApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user.userId
    });
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Reset status to pending for retry
    application.status = 'pending';
    await application.save();

    res.json({
      success: true,
      message: 'Application queued for retry',
      data: { application }
    });
  } catch (error) {
    console.error('Retry application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @route   DELETE /api/applications/:id
// @desc    Cancel application
// @access  Private
export const cancelApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user.userId
    });
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Update status to withdrawn
    application.status = 'withdrawn';
    await application.save();

    res.json({
      success: true,
      message: 'Application cancelled successfully',
      data: { application }
    });
  } catch (error) {
    console.error('Cancel application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @route   POST /api/applications/rapid-apply/start
// @desc    Start rapid apply process
// @access  Private
export const startRapidApply = async (req, res) => {
  try {
    const { filters, maxApplications = 50 } = req.body;
    const userId = req.user.userId;

    // This would integrate with your rapid apply service
    // For now, return a placeholder response
    
    res.json({
      success: true,
      message: 'Rapid apply started',
      data: {
        sessionId: `rapid_${userId}_${Date.now()}`,
        status: 'active',
        maxApplications,
        filters,
        applicationsSubmitted: 0
      }
    });
  } catch (error) {
    console.error('Start rapid apply error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @route   POST /api/applications/rapid-apply/stop
// @desc    Stop rapid apply process
// @access  Private
export const stopRapidApply = async (req, res) => {
  try {
    const userId = req.user.userId;

    // This would stop the rapid apply service
    // For now, return a placeholder response
    
    res.json({
      success: true,
      message: 'Rapid apply stopped',
      data: {
        status: 'stopped',
        totalApplicationsSubmitted: 0
      }
    });
  } catch (error) {
    console.error('Stop rapid apply error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @route   GET /api/applications/rapid-apply/status
// @desc    Get rapid apply status
// @access  Private
export const getRapidApplyStatus = async (req, res) => {
  try {
    const userId = req.user.userId;

    // This would check the rapid apply service status
    // For now, return a placeholder response
    
    res.json({
      success: true,
      data: {
        status: 'inactive',
        isRunning: false,
        applicationsSubmitted: 0,
        applicationsSuccessful: 0,
        applicationsFailed: 0,
        estimatedTimeRemaining: null
      }
    });
  } catch (error) {
    console.error('Get rapid apply status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
