const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const { authenticate } = require('../middleware/auth');

// @desc    Get all user applications
// @route   GET /api/applications
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
      archived = 'false'
    } = req.query;

    // Build query
    let query = { 
      userId: req.user.id,
      archived: archived === 'true'
    };

    // Status filter
    if (status && status !== 'all') {
      if (Array.isArray(status)) {
        query.status = { $in: status };
      } else {
        query.status = status;
      }
    }

    // Search filter
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      const jobs = await Job.find({
        $or: [
          { title: searchRegex },
          { 'company.name': searchRegex }
        ]
      }).select('_id');
      
      const jobIds = jobs.map(job => job._id);
      query.jobId = { $in: jobIds };
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const applications = await Application.find(query)
      .populate({
        path: 'jobId',
        select: 'title company location jobType experienceLevel salary source postedDate'
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const total = await Application.countDocuments(query);

    // Get statistics
    const stats = await Application.aggregate([
      { $match: { userId: req.user.id, archived: false } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Format stats
    const statusStats = {};
    stats.forEach(stat => {
      statusStats[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        },
        stats: statusStats
      }
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
});

// @desc    Get application by ID
// @route   GET /api/applications/:id
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate({
      path: 'jobId',
      populate: {
        path: 'autofillCompatibility.connector'
      }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching application',
      error: error.message
    });
  }
});

// @desc    Create new application
// @route   POST /api/applications
// @access  Private
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      jobId,
      method = 'automated',
      applicationData = {},
      priority = 'medium'
    } = req.body;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      userId: req.user.id,
      jobId: jobId
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this job'
      });
    }

    // Create application
    const application = new Application({
      userId: req.user.id,
      jobId,
      method,
      applicationData,
      priority,
      timeline: [{
        event: 'application_started',
        description: 'Application created',
        timestamp: new Date()
      }]
    });

    await application.save();

    // Increment job application count
    await job.incrementApplications();

    // Populate job data for response
    await application.populate('jobId');

    res.status(201).json({
      success: true,
      message: 'Application created successfully',
      data: application
    });
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating application',
      error: error.message
    });
  }
});

// @desc    Get application analytics
// @route   GET /api/applications/analytics/overview
// @access  Private
router.get('/analytics/overview', authenticate, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    const analytics = await Application.aggregate([
      {
        $match: {
          userId: req.user.id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $facet: {
          statusBreakdown: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            }
          ],
          dailyApplications: [
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: '%Y-%m-%d',
                    date: '$createdAt'
                  }
                },
                count: { $sum: 1 }
              }
            },
            { $sort: { '_id': 1 } }
          ],
          responseRate: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                responded: {
                  $sum: {
                    $cond: [
                      {
                        $in: ['$status', ['under_review', 'interview_scheduled', 'interviewed', 'offer_received', 'accepted', 'rejected']]
                      },
                      1,
                      0
                    ]
                  }
                }
              }
            }
          ]
        }
      }
    ]);

    res.json({
      success: true,
      data: analytics[0]
    });
  } catch (error) {
    console.error('Error fetching application analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching application analytics',
      error: error.message
    });
  }
});

module.exports = router;
