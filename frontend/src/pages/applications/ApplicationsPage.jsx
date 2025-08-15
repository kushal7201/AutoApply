import React from 'react'

const ApplicationsPage = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        <p className="mt-2 text-gray-600">
          Track and manage all your job applications in one place.
        </p>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Application Tracking Coming Soon</h3>
          <p className="text-gray-600">
            We're building a comprehensive dashboard to track all your application statuses and progress.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ApplicationsPage
