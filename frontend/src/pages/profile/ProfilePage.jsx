import React from 'react'

const ProfilePage = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="mt-2 text-gray-600">
          Manage your resume, personal information, and job preferences.
        </p>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👤</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Management Coming Soon</h3>
          <p className="text-gray-600">
            We're building tools to help you create and manage multiple resume variants and profiles.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
