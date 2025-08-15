const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const { authenticate } = require('../middleware/auth');

// @desc    Get dashboard overview data
// @route   GET /api/dashboard/overview
// @access  Private
router.get('/overview', authenticate, async (req, res) => {
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

    // Get basic stats
    const totalApplications = await Application.countDocuments({
      userId: req.user.id,
      createdAt: { $gte: startDate }
    });

    const pendingApplications = await Application.countDocuments({
      userId: req.user.id,
      status: { $in: ['submitted', 'pending', 'under_review'] },
      createdAt: { $gte: startDate }
    });

    const interviewsScheduled = await Application.countDocuments({
      userId: req.user.id,
      status: 'interview_scheduled',
      createdAt: { $gte: startDate }
    });

    const offersReceived = await Application.countDocuments({
      userId: req.user.id,
      status: 'offer_received',
      createdAt: { $gte: startDate }
    });

    // Get application trends
    const applicationTrends = await Application.aggregate([
      {
        $match: {
          userId: req.user.id,
          createdAt: { $gte: startDate }
        }
      },
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
    ]);

    // Get status breakdown
    const statusBreakdown = await Application.aggregate([
      {
        $match: {
          userId: req.user.id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent activity
    const recentApplications = await Application.find({
      userId: req.user.id
    })
    .populate({
      path: 'jobId',
      select: 'title company location'
    })
    .sort({ updatedAt: -1 })
    .limit(5)
    .lean();

    // Get top companies applied to
    const topCompanies = await Application.aggregate([
      {
        $match: {
          userId: req.user.id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: '$job' },
      {
        $group: {
          _id: '$job.company.name',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Get response rate
    const responseStats = await Application.aggregate([
      {
        $match: {
          userId: req.user.id,
          createdAt: { $gte: startDate }
        }
      },
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
          },
          interviews: {
            $sum: {
              $cond: [
                { $in: ['$status', ['interview_scheduled', 'interviewed']] },
                1,
                0
              ]
            }
          },
          offers: {
            $sum: {
              $cond: [
                { $in: ['$status', ['offer_received', 'accepted']] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const responseRate = responseStats[0] ? 
      (responseStats[0].responded / responseStats[0].total * 100).toFixed(1) : 0;
    const interviewRate = responseStats[0] ? 
      (responseStats[0].interviews / responseStats[0].total * 100).toFixed(1) : 0;
    const offerRate = responseStats[0] ? 
      (responseStats[0].offers / responseStats[0].total * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalApplications,
          pendingApplications,
          interviewsScheduled,
          offersReceived,
          responseRate: parseFloat(responseRate),
          interviewRate: parseFloat(interviewRate),
          offerRate: parseFloat(offerRate)
        },
        trends: {
          applications: applicationTrends,
          statusBreakdown: statusBreakdown.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {})
        },
        recentActivity: recentApplications,
        insights: {
          topCompanies: topCompanies.map(item => ({
            company: item._id,
            applications: item.count
          }))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard overview',
      error: error.message
    });
  }
});

// @desc    Get job market insights
// @route   GET /api/dashboard/market-insights
// @access  Private
router.get('/market-insights', authenticate, async (req, res) => {
  try {
    // Get trending job titles
    const trendingTitles = await Job.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$title',
          count: { $sum: 1 },
          avgSalaryMin: { $avg: '$salary.min' },
          avgSalaryMax: { $avg: '$salary.max' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get top hiring companies
    const topHiringCompanies = await Job.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$company.name',
          jobCount: { $sum: 1 },
          industry: { $first: '$company.industry' }
        }
      },
      { $sort: { jobCount: -1 } },
      { $limit: 10 }
    ]);

    // Get salary trends by experience level
    const salaryTrends = await Job.aggregate([
      { 
        $match: { 
          status: 'active',
          'salary.disclosed': true,
          'salary.min': { $exists: true }
        } 
      },
      {
        $group: {
          _id: '$experienceLevel',
          avgSalary: { $avg: '$salary.min' },
          count: { $sum: 1 }
        }
      },
      { $sort: { avgSalary: -1 } }
    ]);

    // Get location insights
    const locationInsights = await Job.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: {
            city: '$location.city',
            state: '$location.state',
            remote: '$location.remote'
          },
          jobCount: { $sum: 1 },
          avgSalary: { $avg: '$salary.min' }
        }
      },
      { $sort: { jobCount: -1 } },
      { $limit: 15 }
    ]);

    // Get industry distribution
    const industryDistribution = await Job.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$company.industry',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        trendingTitles: trendingTitles.map(item => ({
          title: item._id,
          jobCount: item.count,
          avgSalaryRange: item.avgSalaryMin && item.avgSalaryMax ? 
            `$${Math.round(item.avgSalaryMin/1000)}k - $${Math.round(item.avgSalaryMax/1000)}k` : 
            'Not disclosed'
        })),
        topHiringCompanies: topHiringCompanies.map(item => ({
          company: item._id,
          jobCount: item.jobCount,
          industry: item.industry || 'Not specified'
        })),
        salaryTrends: salaryTrends.map(item => ({
          experienceLevel: item._id,
          avgSalary: Math.round(item.avgSalary),
          jobCount: item.count
        })),
        locationInsights: locationInsights.map(item => ({
          location: item._id.remote ? 'Remote' : `${item._id.city}, ${item._id.state}`,
          jobCount: item.jobCount,
          avgSalary: item.avgSalary ? Math.round(item.avgSalary) : null
        })),
        industryDistribution: industryDistribution.map(item => ({
          industry: item._id || 'Not specified',
          jobCount: item.count
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching market insights:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching market insights',
      error: error.message
    });
  }
});

// @desc    Get application recommendations
// @route   GET /api/dashboard/recommendations
// @access  Private
router.get('/recommendations', authenticate, async (req, res) => {
  try {
    // Get user's skills and preferences
    const CandidateProfile = require('../models/CandidateProfile');
    const profile = await CandidateProfile.findOne({ userId: req.user.id });

    if (!profile) {
      return res.json({
        success: true,
        data: {
          recommendedJobs: [],
          suggestions: ['Complete your profile to get personalized recommendations']
        }
      });
    }

    // Get user's applied job IDs to exclude them
    const appliedJobs = await Application.find({ userId: req.user.id }).select('jobId');
    const appliedJobIds = appliedJobs.map(app => app.jobId);

    // Build recommendation query based on user profile
    let recommendationQuery = {
      status: 'active',
      _id: { $nin: appliedJobIds }
    };

    // Match by skills
    if (profile.skills && profile.skills.length > 0) {
      recommendationQuery['skills.name'] = { 
        $in: profile.skills.map(skill => new RegExp(skill, 'i')) 
      };
    }

    // Match by job preferences
    if (profile.jobPreferences) {
      if (profile.jobPreferences.jobType) {
        recommendationQuery.jobType = profile.jobPreferences.jobType;
      }
      if (profile.jobPreferences.experienceLevel) {
        recommendationQuery.experienceLevel = profile.jobPreferences.experienceLevel;
      }
      if (profile.jobPreferences.preferredLocations && profile.jobPreferences.preferredLocations.length > 0) {
        recommendationQuery.$or = profile.jobPreferences.preferredLocations.map(location => ({
          $or: [
            { 'location.city': new RegExp(location, 'i') },
            { 'location.state': new RegExp(location, 'i') }
          ]
        }));
      }
    }

    // Get recommended jobs
    const recommendedJobs = await Job.find(recommendationQuery)
      .sort({ postedDate: -1 })
      .limit(10)
      .lean();

    // Get general suggestions based on user activity
    const suggestions = [];
    
    const recentApplicationsCount = await Application.countDocuments({
      userId: req.user.id,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    if (recentApplicationsCount === 0) {
      suggestions.push('You haven\'t applied to any jobs this week. Consider setting a daily application goal.');
    }

    if (!profile.resumes || profile.resumes.length === 0) {
      suggestions.push('Upload your resume to improve your application success rate.');
    }

    if (!profile.skills || profile.skills.length < 5) {
      suggestions.push('Add more skills to your profile to get better job matches.');
    }

    const pendingFollowUps = await Application.countDocuments({
      userId: req.user.id,
      status: { $in: ['submitted', 'pending'] },
      createdAt: { $lt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) }
    });

    if (pendingFollowUps > 0) {
      suggestions.push(`You have ${pendingFollowUps} applications pending for over 2 weeks. Consider following up.`);
    }

    res.json({
      success: true,
      data: {
        recommendedJobs,
        suggestions
      }
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recommendations',
      error: error.message
    });
  }
});

module.exports = router;
