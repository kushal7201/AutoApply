import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  MagnifyingGlassIcon, 
  AdjustmentsHorizontalIcon,
  PlayIcon,
  PauseIcon,
  DocumentTextIcon,
  MapPinIcon,
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

const Dashboard = () => {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [isRapidApplyActive, setIsRapidApplyActive] = useState(false)

  // Mock data
  const stats = [
    { label: 'Applications Sent', value: '47', change: '+12', color: 'text-green-600' },
    { label: 'Success Rate', value: '94%', change: '+2%', color: 'text-green-600' },
    { label: 'Pending Reviews', value: '8', change: '-3', color: 'text-red-600' },
    { label: 'Interviews Scheduled', value: '3', change: '+1', color: 'text-green-600' }
  ]

  const recentJobs = [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      salary: '$120k - $160k',
      posted: '2 hours ago',
      status: 'pending',
      confidence: 95
    },
    {
      id: 2,
      title: 'Full Stack Engineer',
      company: 'StartupXYZ',
      location: 'Remote',
      salary: '$100k - $140k',
      posted: '5 hours ago',
      status: 'applied',
      confidence: 87
    },
    {
      id: 3,
      title: 'React Developer',
      company: 'InnovateLabs',
      location: 'New York, NY',
      salary: '$110k - $150k',
      posted: '1 day ago',
      status: 'failed',
      confidence: 76
    }
  ]

  const recentApplications = [
    {
      id: 1,
      job: 'Senior React Developer at Google',
      status: 'success',
      appliedAt: '2 hours ago',
      portal: 'LinkedIn'
    },
    {
      id: 2,
      job: 'Frontend Engineer at Meta',
      status: 'pending',
      appliedAt: '4 hours ago',
      portal: 'Company Website'
    },
    {
      id: 3,
      job: 'Software Engineer at Apple',
      status: 'failed',
      appliedAt: '6 hours ago',
      portal: 'Indeed',
      error: 'CAPTCHA required'
    }
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'failed':
        return <XCircleIcon className="w-5 h-5 text-red-500" />
      case 'pending':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    switch (status) {
      case 'success':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'applied':
        return `${baseClasses} bg-blue-100 text-blue-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back{user ? `, ${user.name.split(' ')[0]}` : ''}!
              </h1>
              <p className="text-gray-600 mt-2">Manage your job applications and track your progress</p>
            </div>
            {user && (
              <div className="text-right">
                <p className="text-sm text-gray-500">Last login</p>
                <p className="text-sm font-medium text-gray-900">Today at 2:30 PM</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="card">
              <div className="card-content">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`text-sm font-medium ${stat.color}`}>
                    {stat.change}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Job Search */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-gray-900">Quick Job Search</h2>
              </div>
              <div className="card-content">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search for jobs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input pl-10"
                      />
                    </div>
                  </div>
                  <button className="btn btn-outline">
                    <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" />
                    Filters
                  </button>
                  <button className="btn btn-primary">
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RapidApply Control */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">RapidApply</h2>
            </div>
            <div className="card-content">
              <div className="text-center">
                <div className="mb-4">
                  <span className="text-2xl font-bold text-gray-900">25</span>
                  <span className="text-gray-600 ml-1">jobs queued</span>
                </div>
                <button 
                  onClick={() => setIsRapidApplyActive(!isRapidApplyActive)}
                  className={`btn w-full ${isRapidApplyActive ? 'btn-secondary' : 'btn-primary'}`}
                >
                  {isRapidApplyActive ? (
                    <>
                      <PauseIcon className="w-5 h-5 mr-2" />
                      Pause RapidApply
                    </>
                  ) : (
                    <>
                      <PlayIcon className="w-5 h-5 mr-2" />
                      Start RapidApply
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Job Opportunities */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Recent Job Opportunities</h2>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                {recentJobs.map((job) => (
                  <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                        <p className="text-gray-600">{job.company}</p>
                      </div>
                      <span className={getStatusBadge(job.status)}>
                        {job.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 space-x-4 mb-3">
                      <div className="flex items-center">
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        {job.location}
                      </div>
                      <div className="flex items-center">
                        <BanknotesIcon className="w-4 h-4 mr-1" />
                        {job.salary}
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {job.posted}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Confidence: {job.confidence}%
                      </div>
                      <div className="flex space-x-2">
                        <button className="btn btn-outline btn-sm">Save</button>
                        <button className="btn btn-primary btn-sm">Apply Now</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Applications */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Recent Applications</h2>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                {recentApplications.map((app) => (
                  <div key={app.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{app.job}</h3>
                        <p className="text-sm text-gray-600">via {app.portal}</p>
                      </div>
                      {getStatusIcon(app.status)}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Applied {app.appliedAt}</span>
                      {app.error && (
                        <span className="text-red-600 text-xs">
                          {app.error}
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-3 flex space-x-2">
                      <button className="btn btn-outline btn-sm">
                        <DocumentTextIcon className="w-4 h-4 mr-1" />
                        View Details
                      </button>
                      {app.status === 'failed' && (
                        <button className="btn btn-primary btn-sm">
                          Retry
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <button className="btn btn-outline">
                  View All Applications
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
