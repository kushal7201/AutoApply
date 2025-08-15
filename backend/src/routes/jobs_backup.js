const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Application = require('../models/Application');
const { authenticate } = require('../middleware/auth');

// @desc    Get all jobs with search and filters
// @route   GET /api/jobs
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      search,
      location,
      jobType,
      experienceLevel,
      salaryMin,
      salaryMax,
      remote,
      companySize,
      industry,
      postedWithin,
      skills,
      page = 1,
      limit = 20,
      sort = 'postedDate'
    } = req.query;

    // Build search query
    let query = { status: 'active' };

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Location filter
    if (location && location !== 'all') {
      if (location === 'remote') {
        query['location.remote'] = true;
      } else {
        query.$or = [
          { 'location.city': new RegExp(location, 'i') },
          { 'location.state': new RegExp(location, 'i') },
          { 'location.country': new RegExp(location, 'i') }
        ];
      }
    }

    // Job type filter
    if (jobType && jobType !== 'all') {
      if (Array.isArray(jobType)) {
        query.jobType = { $in: jobType };
      } else {
        query.jobType = jobType;
      }
    }

    // Experience level filter
    if (experienceLevel && experienceLevel !== 'all') {
      if (Array.isArray(experienceLevel)) {
        query.experienceLevel = { $in: experienceLevel };
      } else {
        query.experienceLevel = experienceLevel;
      }
    }

    // Salary range filter
    if (salaryMin || salaryMax) {
      query['salary.disclosed'] = true;
      if (salaryMin) {
        query['salary.min'] = { $gte: parseInt(salaryMin) };
      }
      if (salaryMax) {
        query['salary.max'] = { $lte: parseInt(salaryMax) };
      }
    }

    // Remote work filter
    if (remote === 'true') {
      query['location.remote'] = true;
    } else if (remote === 'false') {
      query['location.remote'] = false;
    }

    // Company size filter
    if (companySize && companySize !== 'all') {
      if (Array.isArray(companySize)) {
        query['company.size'] = { $in: companySize };
      } else {
        query['company.size'] = companySize;
      }
    }

    // Industry filter
    if (industry && industry !== 'all') {
      query['company.industry'] = new RegExp(industry, 'i');
    }

    // Posted within filter
    if (postedWithin) {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(postedWithin));
      query.postedDate = { $gte: daysAgo };
    }

    // Skills filter
    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : skills.split(',');
      query['skills.name'] = { $in: skillsArray.map(skill => new RegExp(skill.trim(), 'i')) };
    }

    // Sorting
    let sortOption = {};
    switch (sort) {
      case 'postedDate':
        sortOption = { postedDate: -1 };
        break;
      case 'relevance':
        if (search) {
          sortOption = { score: { $meta: 'textScore' } };
        } else {
          sortOption = { postedDate: -1 };
        }
        break;
      case 'salaryHigh':
        sortOption = { 'salary.max': -1, postedDate: -1 };
        break;
      case 'salaryLow':
        sortOption = { 'salary.min': 1, postedDate: -1 };
        break;
      case 'company':
        sortOption = { 'company.name': 1 };
        break;
      default:
        sortOption = { postedDate: -1 };
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const jobs = await Job.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('autofillCompatibility.connector')
      .lean();

    // Get total count for pagination
    const total = await Job.countDocuments(query);

    // Get user's applications for these jobs
    const jobIds = jobs.map(job => job._id);
    const userApplications = await Application.find({
      userId: req.user.id,
      jobId: { $in: jobIds }
    }).select('jobId status').lean();

    // Create a map for quick lookup
    const applicationMap = {};
    userApplications.forEach(app => {
      applicationMap[app.jobId.toString()] = app.status;
    });

    // Add application status to jobs
    const jobsWithApplicationStatus = jobs.map(job => ({
      ...job,
      applicationStatus: applicationMap[job._id.toString()] || null,
      hasApplied: !!applicationMap[job._id.toString()]
    }));

    // Get filter counts for faceted search
    const filterCounts = await getFilterCounts(query);

    res.json({
      success: true,
      data: {
        jobs: jobsWithApplicationStatus,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        },
        filters: filterCounts
      }
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs',
      error: error.message
    });
  }
});

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('autofillCompatibility.connector');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Increment view count
    await job.incrementViews();

    // Check if user has applied
    const application = await Application.findOne({
      userId: req.user.id,
      jobId: job._id
    });

    // Get similar jobs
    const similarJobs = await Job.findSimilar(job._id, 5);

    res.json({
      success: true,
      data: {
        job: {
          ...job.toObject(),
          applicationStatus: application?.status || null,
          hasApplied: !!application
        },
        similarJobs
      }
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job',
      error: error.message
    });
  }
});

// @desc    Get job search suggestions
// @route   GET /api/jobs/search/suggestions
// @access  Private
router.get('/search/suggestions', authenticate, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: {
          titles: [],
          companies: [],
          locations: [],
          skills: []
        }
      });
    }

    // Get suggestions using aggregation
    const suggestions = await Job.aggregate([
      { $match: { status: 'active' } },
      {
        $facet: {
          titles: [
            { $match: { title: new RegExp(q, 'i') } },
            { $group: { _id: '$title', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            { $project: { title: '$_id', count: 1, _id: 0 } }
          ],
          companies: [
            { $match: { 'company.name': new RegExp(q, 'i') } },
            { $group: { _id: '$company.name', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            { $project: { company: '$_id', count: 1, _id: 0 } }
          ],
          locations: [
            {
              $match: {
                $or: [
                  { 'location.city': new RegExp(q, 'i') },
                  { 'location.state': new RegExp(q, 'i') }
                ]
              }
            },
            {
              $group: {
                _id: {
                  city: '$location.city',
                  state: '$location.state'
                },
                count: { $sum: 1 }
              }
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
              $project: {
                location: {
                  $concat: ['$_id.city', ', ', '$_id.state']
                },
                count: 1,
                _id: 0
              }
            }
          ],
          skills: [
            { $unwind: '$skills' },
            { $match: { 'skills.name': new RegExp(q, 'i') } },
            { $group: { _id: '$skills.name', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            { $project: { skill: '$_id', count: 1, _id: 0 } }
          ]
        }
      }
    ]);

    res.json({
      success: true,
      data: suggestions[0]
    });
  } catch (error) {
    console.error('Error getting search suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting search suggestions',
      error: error.message
    });
  }
});

// @desc    Save/unsave a job
// @route   POST /api/jobs/:id/save
// @access  Private
router.post('/:id/save', authenticate, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if already saved (implement SavedJob model if needed)
    // For now, we'll just increment the save count
    await job.incrementSaves();

    res.json({
      success: true,
      message: 'Job saved successfully'
    });
  } catch (error) {
    console.error('Error saving job:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving job',
      error: error.message
    });
  }
});

// Helper function to get filter counts
async function getFilterCounts(baseQuery) {
  try {
    const counts = await Job.aggregate([
      { $match: baseQuery },
      {
        $facet: {
          jobTypes: [
            { $group: { _id: '$jobType', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          experienceLevels: [
            { $group: { _id: '$experienceLevel', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          companySizes: [
            { $group: { _id: '$company.size', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          locations: [
            {
              $group: {
                _id: {
                  city: '$location.city',
                  state: '$location.state'
                },
                count: { $sum: 1 }
              }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ],
          remote: [
            { $group: { _id: '$location.remote', count: { $sum: 1 } } }
          ]
        }
      }
    ]);

    return counts[0];
  } catch (error) {
    console.error('Error getting filter counts:', error);
    return {};
  }
}

module.exports = router;
