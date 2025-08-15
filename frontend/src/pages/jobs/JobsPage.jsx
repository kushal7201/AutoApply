import React, { useState, useEffect } from 'react'
import { 
  MagnifyingGlassIcon,
  MapPinIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  ClockIcon,
  BuildingOfficeIcon,
  FunnelIcon,
  ChevronDownIcon,
  BookmarkIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid'
import { useJobs, useSearchSuggestions, useSaveJob } from '../../hooks/useJobs'
import { useCreateApplication } from '../../hooks/useApplications'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

const JobsPage = () => {
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    jobType: 'all',
    experienceLevel: 'all',
    remote: 'all',
    salaryMin: '',
    salaryMax: '',
    page: 1,
    limit: 20,
    sort: 'postedDate'
  })

  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Hooks
  const { data: jobsData, isLoading, error } = useJobs(filters)
  const { data: suggestions } = useSearchSuggestions(searchQuery)
  const saveJobMutation = useSaveJob()
  const createApplicationMutation = useCreateApplication()

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault()
    setFilters(prev => ({ ...prev, search: searchQuery, page: 1 }))
    setShowSuggestions(false)
  }

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  // Handle pagination
  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }))
    window.scrollTo(0, 0)
  }

  // Handle quick apply
  const handleQuickApply = async (jobId) => {
    try {
      await createApplicationMutation.mutateAsync({
        jobId,
        method: 'automated',
        priority: 'medium'
      })
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  const jobs = jobsData?.data?.jobs || []
  const pagination = jobsData?.data?.pagination || {}
  const filterCounts = jobsData?.data?.filters || {}

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Next Job</h1>
          <p className="text-gray-600">Discover opportunities that match your skills and preferences</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Job title, keywords, or company"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowSuggestions(true)
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              {/* Search Suggestions */}
              {showSuggestions && suggestions?.data && searchQuery.length >= 2 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
                  {suggestions.data.titles?.length > 0 && (
                    <div className="p-2">
                      <div className="text-xs font-medium text-gray-500 mb-1">Job Titles</div>
                      {suggestions.data.titles.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSearchQuery(item.title)
                            setShowSuggestions(false)
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded"
                        >
                          {item.title}
                        </button>
                      ))}
                    </div>
                  )}
                  {suggestions.data.companies?.length > 0 && (
                    <div className="p-2 border-t">
                      <div className="text-xs font-medium text-gray-500 mb-1">Companies</div>
                      {suggestions.data.companies.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSearchQuery(item.company)
                            setShowSuggestions(false)
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded"
                        >
                          {item.company}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 relative">
              <MapPinIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Location or 'Remote'"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Search Jobs
            </button>
          </form>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden text-gray-500"
                >
                  <FunnelIcon className="h-5 w-5" />
                </button>
              </div>

              <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Job Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                  <select
                    value={filters.jobType}
                    onChange={(e) => handleFilterChange('jobType', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="temporary">Temporary</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>

                {/* Experience Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                  <select
                    value={filters.experienceLevel}
                    onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Levels</option>
                    <option value="entry">Entry Level</option>
                    <option value="junior">Junior</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior</option>
                    <option value="lead">Lead</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>

                {/* Remote Work */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Work Arrangement</label>
                  <select
                    value={filters.remote}
                    onChange={(e) => handleFilterChange('remote', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Arrangements</option>
                    <option value="true">Remote Only</option>
                    <option value="false">On-site Only</option>
                  </select>
                </div>

                {/* Salary Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.salaryMin}
                      onChange={(e) => handleFilterChange('salaryMin', e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.salaryMax}
                      onChange={(e) => handleFilterChange('salaryMax', e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={filters.sort}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="postedDate">Most Recent</option>
                    <option value="relevance">Most Relevant</option>
                    <option value="salaryHigh">Salary: High to Low</option>
                    <option value="salaryLow">Salary: Low to High</option>
                    <option value="company">Company A-Z</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Job Listings */}
          <div className="lg:w-3/4">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-gray-600">
                  {pagination.total || 0} jobs found
                  {filters.search && ` for "${filters.search}"`}
                </p>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                Failed to load jobs. Please try again.
              </div>
            )}

            {/* Job Cards */}
            {!isLoading && !error && (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <JobCard
                    key={job._id}
                    job={job}
                    onSave={() => saveJobMutation.mutate(job._id)}
                    onQuickApply={() => handleQuickApply(job._id)}
                    isApplying={createApplicationMutation.isPending}
                  />
                ))}

                {jobs.length === 0 && (
                  <div className="text-center py-12">
                    <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Try adjusting your search criteria or filters.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-8 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.current - 1)}
                    disabled={pagination.current === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                    const page = i + 1
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          pagination.current === page
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.current + 1)}
                    disabled={pagination.current === pagination.pages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Job Card Component
const JobCard = ({ job, onSave, onQuickApply, isApplying }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'interview_scheduled':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-3">
            {job.company?.logo && (
              <img
                src={job.company.logo}
                alt={job.company.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
            )}
            <div>
              <Link
                to={`/jobs/${job._id}`}
                className="text-lg font-semibold text-gray-900 hover:text-blue-600"
              >
                {job.title}
              </Link>
              <p className="text-gray-600">{job.company?.name}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center">
              <MapPinIcon className="h-4 w-4 mr-1" />
              {job.fullLocation || 'Location not specified'}
            </div>
            <div className="flex items-center">
              <BriefcaseIcon className="h-4 w-4 mr-1" />
              {job.jobType?.replace('-', ' ') || 'Not specified'}
            </div>
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-4 w-4 mr-1" />
              {job.salaryDisplay || 'Salary not disclosed'}
            </div>
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-1" />
              {job.postedDate ? formatDistanceToNow(new Date(job.postedDate), { addSuffix: true }) : 'Recently posted'}
            </div>
          </div>

          <p className="text-gray-700 mb-4 line-clamp-3">
            {job.description}
          </p>

          {job.skills && job.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {job.skills.slice(0, 5).map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs"
                >
                  {skill.name || skill}
                </span>
              ))}
              {job.skills.length > 5 && (
                <span className="text-gray-500 text-xs">+{job.skills.length - 5} more</span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end space-y-2 ml-4">
          {job.hasApplied && job.applicationStatus && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.applicationStatus)}`}>
              {job.applicationStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          )}

          <button
            onClick={onSave}
            className="text-gray-400 hover:text-blue-600 transition-colors"
          >
            <BookmarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center">
            <EyeIcon className="h-4 w-4 mr-1" />
            {job.metadata?.views || 0} views
          </div>
          <div className="flex items-center">
            <BuildingOfficeIcon className="h-4 w-4 mr-1" />
            {job.metadata?.applications || 0} applications
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to={`/jobs/${job._id}`}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            View Details
          </Link>
          {!job.hasApplied && (
            <button
              onClick={onQuickApply}
              disabled={isApplying}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isApplying ? 'Applying...' : 'Quick Apply'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default JobsPage
