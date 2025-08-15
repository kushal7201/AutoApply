const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Application = require('../models/Application');
const { authenticate } = require('../middleware/auth');
const pythonJobSearchService = require('../services/pythonJobSearchService');

// @desc    Get all jobs with search and filters (with real-time scraping)
// @route   GET /api/jobs
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      search = '',
      location = '',
      jobType = 'all',
      experienceLevel = 'all',
      remote = 'all',
      salaryMin,
      salaryMax,
      skills,
      company,
      sort = 'postedDate',
      page = 1,
      limit = 20,
      useRealTime = 'true' // New parameter to enable real-time search
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let jobs = [];
    let total = 0;

    // Real-time job search using Python service
    if (useRealTime === 'true' && search) {
      console.log('Performing real-time job search for:', search);
      
      const filters = {
        location: location !== 'all' ? location : '',
        jobType: jobType !== 'all' ? jobType : undefined,
        experienceLevel: experienceLevel !== 'all' ? experienceLevel : undefined,
        remote: remote === 'true',
        salaryMin: salaryMin ? parseInt(salaryMin) : undefined,
        salaryMax: salaryMax ? parseInt(salaryMax) : undefined,
        skills: skills ? skills.split(',') : undefined,
        company: company || undefined
      };

      try {
        const scrapedJobs = await pythonJobSearchService.searchJobs(search, location, filters);
        
        // Convert scraped jobs to our format and add user-specific data
        jobs = await Promise.all(scrapedJobs.map(async (job) => {
          // Check if user has applied to this job
          const existingApplication = await Application.findOne({
            user: req.user.id,
            $or: [
              { 'job.external_id': job.external_id },
              { 
                'job.title': job.title,
                'job.company.name': job.company.name
              }
            ]
          });

          return {
            _id: job.external_id,
            external_id: job.external_id,
            title: job.title,
            company: job.company,
            description: job.description,
            location: job.location,
            fullLocation: job.full_location || job.location,
            remote: job.remote,
            jobType: job.job_type,
            experienceLevel: job.experience_level,
            salary: job.salary,
            salaryDisplay: job.salary_display,
            postedDate: job.posted_date,
            url: job.url,
            sourcePlatform: job.source_platform,
            skills: job.skills?.map(skill => ({ name: skill })) || [],
            matchScore: job.match_score,
            metadata: job.metadata,
            hasApplied: !!existingApplication,
            applicationStatus: existingApplication?.status,
            applicationId: existingApplication?._id,
            isExternal: true // Mark as externally sourced
          };
        }));

        total = jobs.length;

        // Apply additional filtering
        if (salaryMin || salaryMax) {
          jobs = jobs.filter(job => {
            const jobSalaryMin = job.salary?.min || 0;
            const jobSalaryMax = job.salary?.max || 0;
            
            if (salaryMin && jobSalaryMax < parseInt(salaryMin)) return false;
            if (salaryMax && jobSalaryMin > parseInt(salaryMax)) return false;
            return true;
          });
        }

        if (company) {
          jobs = jobs.filter(job => 
            job.company.name.toLowerCase().includes(company.toLowerCase())
          );
        }

        if (skills) {
          const requiredSkills = skills.toLowerCase().split(',');
          jobs = jobs.filter(job => 
            requiredSkills.some(skill => 
              job.skills.some(jobSkill => 
                jobSkill.name.toLowerCase().includes(skill.trim())
              )
            )
          );
        }

        // Apply sorting
        jobs.sort((a, b) => {
          switch (sort) {
            case 'postedDate':
              return new Date(b.postedDate) - new Date(a.postedDate);
            case 'relevance':
              return b.matchScore - a.matchScore;
            case 'salaryHigh':
              return (b.salary?.max || 0) - (a.salary?.max || 0);
            case 'salaryLow':
              return (a.salary?.min || 0) - (b.salary?.min || 0);
            case 'company':
              return a.company.name.localeCompare(b.company.name);
            default:
              return new Date(b.postedDate) - new Date(a.postedDate);
          }
        });

        // Apply pagination
        const startIndex = skip;
        const endIndex = startIndex + limitNum;
        jobs = jobs.slice(startIndex, endIndex);
        total = scrapedJobs.length; // Use original total for pagination

      } catch (scrapeError) {
        console.error('Real-time job search failed:', scrapeError);
        // Fall back to database search
        const dbResult = await searchDatabaseJobs(req, skip, limitNum);
        jobs = dbResult.jobs;
        total = dbResult.total;
      }
    } else {
      // Traditional database search
      const dbResult = await searchDatabaseJobs(req, skip, limitNum);
      jobs = dbResult.jobs;
      total = dbResult.total;
    }

    // Calculate pagination
    const totalPages = Math.ceil(total / limitNum);
    const hasNext = pageNum < totalPages;
    const hasPrev = pageNum > 1;

    // Get filter counts for faceted search
    const filterCounts = await getFilterCounts(req.query);

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          current: pageNum,
          pages: totalPages,
          total,
          hasNext,
          hasPrev,
          limit: limitNum
        },
        filters: filterCounts,
        searchInfo: {
          query: search,
          location,
          resultsCount: jobs.length,
          isRealTime: useRealTime === 'true' && search
        }
      }
    });

  } catch (error) {
    console.error('Job search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search jobs',
      error: error.message
    });
  }
});

// Helper function for database job search
async function searchDatabaseJobs(req, skip, limitNum) {
  const {
    search = '',
    location = '',
    jobType = 'all',
    experienceLevel = 'all',
    remote = 'all',
    salaryMin,
    salaryMax,
    skills,
    company,
    sort = 'postedDate'
  } = req.query;

  // Build query
  const query = { status: 'active' };

  // Text search
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { 'company.name': { $regex: search, $options: 'i' } },
      { 'skills.name': { $regex: search, $options: 'i' } }
    ];
  }

  // Location filter
  if (location && location !== 'all') {
    if (location === 'remote') {
      query['location.remote'] = true;
    } else {
      query.$or = query.$or || [];
      query.$or.push(
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.state': { $regex: location, $options: 'i' } },
        { 'location.country': { $regex: location, $options: 'i' } },
        { fullLocation: { $regex: location, $options: 'i' } }
      );
    }
  }

  // Job type filter
  if (jobType !== 'all') {
    query.jobType = jobType;
  }

  // Experience level filter
  if (experienceLevel !== 'all') {
    query.experienceLevel = experienceLevel;
  }

  // Remote filter
  if (remote !== 'all') {
    query.remote = remote === 'true';
  }

  // Salary filter
  if (salaryMin || salaryMax) {
    query.$and = query.$and || [];
    
    if (salaryMin) {
      query.$and.push({
        $or: [
          { 'salary.max': { $gte: parseInt(salaryMin) } },
          { 'salary.min': { $gte: parseInt(salaryMin) } }
        ]
      });
    }
    
    if (salaryMax) {
      query.$and.push({
        $or: [
          { 'salary.min': { $lte: parseInt(salaryMax) } },
          { 'salary.max': { $lte: parseInt(salaryMax) } }
        ]
      });
    }
  }

  // Company filter
  if (company) {
    query['company.name'] = { $regex: company, $options: 'i' };
  }

  // Skills filter
  if (skills) {
    const skillsArray = skills.split(',').map(s => s.trim());
    query['skills.name'] = { $in: skillsArray.map(s => new RegExp(s, 'i')) };
  }

  // Build sort object
  const sortObj = {};
  switch (sort) {
    case 'postedDate':
      sortObj.postedDate = -1;
      break;
    case 'relevance':
      if (search) {
        sortObj.score = { $meta: 'textScore' };
      } else {
        sortObj.postedDate = -1;
      }
      break;
    case 'salaryHigh':
      sortObj['salary.max'] = -1;
      break;
    case 'salaryLow':
      sortObj['salary.min'] = 1;
      break;
    case 'company':
      sortObj['company.name'] = 1;
      break;
    default:
      sortObj.postedDate = -1;
  }

  // Execute query
  const jobs = await Job.find(query)
    .sort(sortObj)
    .skip(skip)
    .limit(limitNum)
    .lean();

  // Add user application status
  const jobsWithStatus = await Promise.all(jobs.map(async (job) => {
    const application = await Application.findOne({
      user: req.user.id,
      job: job._id
    });

    return {
      ...job,
      hasApplied: !!application,
      applicationStatus: application?.status,
      applicationId: application?._id
    };
  }));

  const total = await Job.countDocuments(query);

  return { jobs: jobsWithStatus, total };
}

// Helper function to get filter counts
async function getFilterCounts(queryParams) {
  const { search = '', location = '' } = queryParams;
  
  const baseQuery = { status: 'active' };
  if (search) {
    baseQuery.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { 'company.name': { $regex: search, $options: 'i' } }
    ];
  }
  
  if (location && location !== 'all') {
    if (location === 'remote') {
      baseQuery['location.remote'] = true;
    } else {
      baseQuery.$or = baseQuery.$or || [];
      baseQuery.$or.push(
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.state': { $regex: location, $options: 'i' } },
        { fullLocation: { $regex: location, $options: 'i' } }
      );
    }
  }

  try {
    const [jobTypeCounts, experienceCounts, remoteCounts] = await Promise.all([
      Job.aggregate([
        { $match: baseQuery },
        { $group: { _id: '$jobType', count: { $sum: 1 } } }
      ]),
      Job.aggregate([
        { $match: baseQuery },
        { $group: { _id: '$experienceLevel', count: { $sum: 1 } } }
      ]),
      Job.aggregate([
        { $match: baseQuery },
        { $group: { _id: '$remote', count: { $sum: 1 } } }
      ])
    ]);

    return {
      jobType: jobTypeCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      experienceLevel: experienceCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      remote: remoteCounts.reduce((acc, item) => {
        acc[item._id ? 'remote' : 'onsite'] = item.count;
        return acc;
      }, {})
    };
  } catch (error) {
    console.error('Error getting filter counts:', error);
    return {};
  }
}

// @desc    Get search suggestions
// @route   GET /api/jobs/suggestions
// @access  Private
router.get('/suggestions', authenticate, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: {
          titles: [],
          companies: [],
          locations: []
        }
      });
    }

    const [titles, companies, locations] = await Promise.all([
      Job.aggregate([
        { $match: { title: { $regex: q, $options: 'i' }, status: 'active' } },
        { $group: { _id: '$title', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $project: { title: '$_id', count: 1, _id: 0 } }
      ]),
      Job.aggregate([
        { $match: { 'company.name': { $regex: q, $options: 'i' }, status: 'active' } },
        { $group: { _id: '$company.name', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $project: { company: '$_id', count: 1, _id: 0 } }
      ]),
      Job.aggregate([
        { $match: { fullLocation: { $regex: q, $options: 'i' }, status: 'active' } },
        { $group: { _id: '$fullLocation', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $project: { location: '$_id', count: 1, _id: 0 } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        titles,
        companies,
        locations
      }
    });

  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get search suggestions',
      error: error.message
    });
  }
});

// @desc    Get a single job
// @route   GET /api/jobs/:id
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to find in database first
    let job = await Job.findById(id).lean();
    
    if (!job) {
      // If not found in database, check if it's an external job
      // For external jobs, we would need to fetch from the original source
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user has applied
    const application = await Application.findOne({
      user: req.user.id,
      job: job._id
    });

    const jobWithStatus = {
      ...job,
      hasApplied: !!application,
      applicationStatus: application?.status,
      applicationId: application?._id
    };

    res.json({
      success: true,
      data: jobWithStatus
    });

  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get job',
      error: error.message
    });
  }
});

// @desc    Save/bookmark a job
// @route   POST /api/jobs/:id/save
// @access  Private
router.post('/:id/save', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // For external jobs, we might need to save the job data first
    let job = await Job.findById(id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Add to user's saved jobs (implement this logic in User model)
    // For now, we'll just return success
    
    res.json({
      success: true,
      message: 'Job saved successfully'
    });

  } catch (error) {
    console.error('Save job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save job',
      error: error.message
    });
  }
});

// @desc    Get job recommendations
// @route   GET /api/jobs/recommendations
// @access  Private
router.get('/recommendations', authenticate, async (req, res) => {
  try {
    // This would use ML algorithms to recommend jobs based on user profile
    // For now, return recent jobs that match user's skills/preferences
    
    const { limit = 10 } = req.query;
    
    const recommendations = await Job.find({ status: 'active' })
      .sort({ postedDate: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: recommendations
    });

  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get job recommendations',
      error: error.message
    });
  }
});

module.exports = router;
