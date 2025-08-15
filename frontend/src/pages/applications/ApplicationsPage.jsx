import React, { useState } from 'react'
import {
  BriefcaseIcon,
  CalendarIcon,
  ClockIcon,
  ChevronDownIcon,
  EllipsisVerticalIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import { useApplications, useUpdateApplication, useDeleteApplication } from '../../hooks/useApplications'
import { Link } from 'react-router-dom'
import { formatDistanceToNow, format } from 'date-fns'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import toast from 'react-hot-toast'

const ApplicationsPage = () => {
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    dateRange: 'all',
    sort: 'updatedAt',
    page: 1,
    limit: 20
  })

  const [selectedApplications, setSelectedApplications] = useState([])
  const [showBulkActions, setShowBulkActions] = useState(false)

  const { data: applicationsData, isLoading, error } = useApplications(filters)
  const updateApplicationMutation = useUpdateApplication()
  const deleteApplicationMutation = useDeleteApplication()

  const applications = applicationsData?.data?.applications || []
  const pagination = applicationsData?.data?.pagination || {}
  const summary = applicationsData?.data?.summary || {}

  const statusOptions = [
    { value: 'all', label: 'All Applications' },
    { value: 'draft', label: 'Draft' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'pending', label: 'Pending Review' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'phone_screening', label: 'Phone Screening' },
    { value: 'assessment', label: 'Assessment' },
    { value: 'interview_scheduled', label: 'Interview Scheduled' },
    { value: 'interview_completed', label: 'Interview Completed' },
    { value: 'final_round', label: 'Final Round' },
    { value: 'offer_received', label: 'Offer Received' },
    { value: 'offer_accepted', label: 'Offer Accepted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'withdrawn', label: 'Withdrawn' }
  ]

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' }
  ]

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      await updateApplicationMutation.mutateAsync({
        id: applicationId,
        status: newStatus
      })
      toast.success('Application status updated')
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleBulkStatusUpdate = async (status) => {
    if (selectedApplications.length === 0) return

    try {
      await Promise.all(
        selectedApplications.map(id =>
          updateApplicationMutation.mutateAsync({ id, status })
        )
      )
      toast.success(`Updated ${selectedApplications.length} applications`)
      setSelectedApplications([])
      setShowBulkActions(false)
    } catch (error) {
      toast.error('Failed to update applications')
    }
  }

  const handleDelete = async (applicationId) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await deleteApplicationMutation.mutateAsync(applicationId)
        toast.success('Application deleted')
      } catch (error) {
        toast.error('Failed to delete application')
      }
    }
  }

  const toggleApplicationSelection = (applicationId) => {
    setSelectedApplications(prev =>
      prev.includes(applicationId)
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    )
  }

  const selectAllApplications = () => {
    if (selectedApplications.length === applications.length) {
      setSelectedApplications([])
    } else {
      setSelectedApplications(applications.map(app => app._id))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Applications</h1>
              <p className="text-gray-600">Track and manage your job applications</p>
            </div>
            <Link
              to="/jobs"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Apply to New Jobs
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3">
                <BriefcaseIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{summary.total || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 rounded-lg p-3">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{summary.pending || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Interviews</p>
                <p className="text-2xl font-bold text-gray-900">{summary.interviews || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-lg p-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">{summary.thisWeek || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="updatedAt">Recently Updated</option>
                <option value="createdAt">Recently Applied</option>
                <option value="jobTitle">Job Title</option>
                <option value="company">Company</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedApplications.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-blue-800 font-medium">
                  {selectedApplications.length} application(s) selected
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Menu as="div" className="relative">
                  <Menu.Button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                    Update Status
                    <ChevronDownIcon className="h-4 w-4 ml-2" />
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      {statusOptions.slice(1).map(option => (
                        <Menu.Item key={option.value}>
                          {({ active }) => (
                            <button
                              onClick={() => handleBulkStatusUpdate(option.value)}
                              className={`${
                                active ? 'bg-gray-50' : ''
                              } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                            >
                              {option.label}
                            </button>
                          )}
                        </Menu.Item>
                      ))}
                    </Menu.Items>
                  </Transition>
                </Menu>
                <button
                  onClick={() => setSelectedApplications([])}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Applications List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedApplications.length === applications.length && applications.length > 0}
                onChange={selectAllApplications}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-sm font-medium text-gray-700">
                Select All ({applications.length})
              </span>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-4">
                    <div className="h-4 w-4 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-6">
              <div className="text-center text-red-600">
                Failed to load applications. Please try again.
              </div>
            </div>
          )}

          {/* Applications */}
          {!isLoading && !error && applications.length > 0 && (
            <div className="divide-y divide-gray-200">
              {applications.map((application) => (
                <ApplicationRow
                  key={application._id}
                  application={application}
                  isSelected={selectedApplications.includes(application._id)}
                  onSelect={() => toggleApplicationSelection(application._id)}
                  onStatusUpdate={handleStatusUpdate}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && applications.length === 0 && (
            <div className="p-12 text-center">
              <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filters.status === 'all' 
                  ? "You haven't applied to any jobs yet."
                  : "No applications match your current filters."
                }
              </p>
              <div className="mt-6">
                <Link
                  to="/jobs"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Find Jobs to Apply
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-6 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleFilterChange('page', pagination.current - 1)}
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
                    onClick={() => handleFilterChange('page', page)}
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
                onClick={() => handleFilterChange('page', pagination.current + 1)}
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
  )
}

// Application Row Component
const ApplicationRow = ({ application, isSelected, onSelect, onStatusUpdate, onDelete }) => {
  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      under_review: 'bg-indigo-100 text-indigo-800',
      phone_screening: 'bg-purple-100 text-purple-800',
      assessment: 'bg-orange-100 text-orange-800',
      interview_scheduled: 'bg-green-100 text-green-800',
      interview_completed: 'bg-teal-100 text-teal-800',
      final_round: 'bg-cyan-100 text-cyan-800',
      offer_received: 'bg-emerald-100 text-emerald-800',
      offer_accepted: 'bg-green-200 text-green-900',
      rejected: 'bg-red-100 text-red-800',
      withdrawn: 'bg-gray-100 text-gray-600'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'text-red-600',
      medium: 'text-yellow-600',
      low: 'text-green-600'
    }
    return colors[priority] || 'text-gray-600'
  }

  return (
    <div className="px-6 py-4 hover:bg-gray-50">
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        
        <div className="ml-4 flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {application.job?.company?.logo && (
                <img
                  src={application.job.company.logo}
                  alt={application.job.company.name}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              )}
              <div>
                <Link
                  to={`/applications/${application._id}`}
                  className="text-lg font-medium text-gray-900 hover:text-blue-600"
                >
                  {application.job?.title || 'Unknown Position'}
                </Link>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                    {application.job?.company?.name || 'Unknown Company'}
                  </div>
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {application.job?.fullLocation || 'Location not specified'}
                  </div>
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    Applied {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                {application.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
              
              <span className={`text-sm font-medium ${getPriorityColor(application.priority)}`}>
                {application.priority?.charAt(0).toUpperCase() + application.priority?.slice(1)} Priority
              </span>

              <Menu as="div" className="relative">
                <Menu.Button className="text-gray-400 hover:text-gray-600">
                  <EllipsisVerticalIcon className="h-5 w-5" />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to={`/applications/${application._id}`}
                          className={`${active ? 'bg-gray-50' : ''} flex items-center px-4 py-2 text-sm text-gray-700`}
                        >
                          <EyeIcon className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to={`/applications/${application._id}/edit`}
                          className={`${active ? 'bg-gray-50' : ''} flex items-center px-4 py-2 text-sm text-gray-700`}
                        >
                          <PencilIcon className="h-4 w-4 mr-2" />
                          Edit Application
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => onDelete(application._id)}
                          className={`${active ? 'bg-gray-50' : ''} flex items-center w-full px-4 py-2 text-sm text-red-700`}
                        >
                          <TrashIcon className="h-4 w-4 mr-2" />
                          Delete
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>

          {/* Additional Info */}
          {(application.notes?.length > 0 || application.nextFollowUp) && (
            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
              {application.notes?.length > 0 && (
                <div className="flex items-center">
                  <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                  {application.notes.length} note(s)
                </div>
              )}
              {application.nextFollowUp && (
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  Follow up {format(new Date(application.nextFollowUp), 'MMM d')}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ApplicationsPage
