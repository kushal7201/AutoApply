import React from 'react'

const JobsPage = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">Job Search</h1>
        <p className="mt-2 text-gray-600">
          Find and apply to jobs that match your profile.
        </p>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Job Search Coming Soon</h3>
          <p className="text-gray-600">
            We're building an intelligent job search engine that will help you find the perfect opportunities.
          </p>
        </div>
      </div>
    </div>
  )
}

export default JobsPage
