import React from 'react'
import { useAuth } from '@/providers/AuthProvider'

const DashboardPage = () => {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="mt-2 text-gray-600">
          Here's an overview of your job application activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl">{stat.icon}</div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Applications</h2>
          <div className="space-y-4">
            {recentApplications.map((application, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="text-sm font-medium text-gray-900">{application.jobTitle}</p>
                  <p className="text-sm text-gray-500">{application.company}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  application.status === 'success' 
                    ? 'bg-green-100 text-green-800'
                    : application.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {application.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <button className="w-full bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors">
              🚀 Start RapidApply
            </button>
            <button className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
              💼 Browse Jobs
            </button>
            <button className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
              📄 Update Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const stats = [
  { name: 'Total Applications', value: '23', icon: '📝' },
  { name: 'Success Rate', value: '78%', icon: '✅' },
  { name: 'Jobs Saved', value: '45', icon: '⭐' },
  { name: 'Profile Score', value: '85%', icon: '📊' },
]

const recentApplications = [
  { jobTitle: 'Senior Frontend Developer', company: 'TechCorp Inc.', status: 'success' },
  { jobTitle: 'React Developer', company: 'StartupXYZ', status: 'pending' },
  { jobTitle: 'Full Stack Engineer', company: 'BigTech Co.', status: 'success' },
  { jobTitle: 'UI/UX Developer', company: 'Design Studio', status: 'failed' },
]

export default DashboardPage
