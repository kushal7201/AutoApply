import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { 
  UserCircleIcon,
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

const Profile = () => {
  const [activeTab, setActiveTab] = useState('personal')
  const [uploadedResumes, setUploadedResumes] = useState([
    {
      id: 1,
      name: 'John_Doe_Resume_2025.pdf',
      uploadedAt: '2025-01-15',
      isPrimary: true,
      parsed: true
    },
    {
      id: 2,
      name: 'John_Doe_Resume_Technical.pdf',
      uploadedAt: '2025-01-10',
      isPrimary: false,
      parsed: true
    }
  ])

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      linkedin: 'https://linkedin.com/in/johndoe',
      github: 'https://github.com/johndoe',
      portfolio: 'https://johndoe.dev'
    }
  })

  const onSubmit = (data) => {
    console.log('Profile data:', data)
    // Handle profile update logic here
  }

  const tabs = [
    { id: 'personal', name: 'Personal Info', icon: UserCircleIcon },
    { id: 'resumes', name: 'Resumes', icon: DocumentTextIcon },
    { id: 'preferences', name: 'Preferences', icon: PencilIcon }
  ]

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Mock file upload
      const newResume = {
        id: Date.now(),
        name: file.name,
        uploadedAt: new Date().toISOString().split('T')[0],
        isPrimary: uploadedResumes.length === 0,
        parsed: false
      }
      setUploadedResumes([newResume, ...uploadedResumes])
    }
  }

  const deleteResume = (id) => {
    setUploadedResumes(uploadedResumes.filter(resume => resume.id !== id))
  }

  const setPrimaryResume = (id) => {
    setUploadedResumes(uploadedResumes.map(resume => ({
      ...resume,
      isPrimary: resume.id === id
    })))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">Manage your personal information and application preferences</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'personal' && (
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
              <p className="text-gray-600">Update your personal details used for job applications</p>
            </div>
            <div className="card-content">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      {...register('firstName', { required: 'First name is required' })}
                      type="text"
                      className="input"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      {...register('lastName', { required: 'Last name is required' })}
                      type="text"
                      className="input"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: 'Please enter a valid email'
                        }
                      })}
                      type="email"
                      className="input"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      {...register('phone')}
                      type="tel"
                      className="input"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    {...register('location')}
                    type="text"
                    className="input"
                    placeholder="City, State"
                  />
                </div>

                {/* Social Links */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Professional Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        LinkedIn Profile
                      </label>
                      <input
                        {...register('linkedin')}
                        type="url"
                        className="input"
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        GitHub Profile
                      </label>
                      <input
                        {...register('github')}
                        type="url"
                        className="input"
                        placeholder="https://github.com/yourusername"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Portfolio Website
                    </label>
                    <input
                      {...register('portfolio')}
                      type="url"
                      className="input"
                      placeholder="https://yourportfolio.com"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'resumes' && (
          <div className="space-y-6">
            {/* Upload Section */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-gray-900">Upload Resume</h2>
                <p className="text-gray-600">Upload your resume files (PDF, DOCX supported)</p>
              </div>
              <div className="card-content">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Drop files here or click to browse
                      </span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept=".pdf,.docx,.doc"
                        onChange={handleFileUpload}
                      />
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      PDF, DOCX files up to 10MB
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Resume List */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-gray-900">Your Resumes</h2>
                <p className="text-gray-600">Manage your uploaded resume files</p>
              </div>
              <div className="card-content">
                <div className="space-y-4">
                  {uploadedResumes.map((resume) => (
                    <div key={resume.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <DocumentTextIcon className="w-8 h-8 text-gray-400" />
                          <div>
                            <h3 className="text-sm font-medium text-gray-900 flex items-center">
                              {resume.name}
                              {resume.isPrimary && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                                  Primary
                                </span>
                              )}
                            </h3>
                            <div className="flex items-center mt-1 text-xs text-gray-500">
                              <span>Uploaded {resume.uploadedAt}</span>
                              {resume.parsed ? (
                                <div className="flex items-center ml-4">
                                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-1" />
                                  Parsed successfully
                                </div>
                              ) : (
                                <div className="flex items-center ml-4">
                                  <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500 mr-1" />
                                  Parsing in progress
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!resume.isPrimary && (
                            <button 
                              onClick={() => setPrimaryResume(resume.id)}
                              className="btn btn-outline btn-sm"
                            >
                              Set as Primary
                            </button>
                          )}
                          <button className="btn btn-outline btn-sm">
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteResume(resume.id)}
                            className="btn btn-outline btn-sm text-red-600 hover:text-red-700"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Application Preferences</h2>
              <p className="text-gray-600">Configure your application settings and automation preferences</p>
            </div>
            <div className="card-content">
              <form className="space-y-6">
                {/* Application Settings */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Application Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-900">
                          Auto-create accounts
                        </label>
                        <p className="text-sm text-gray-500">
                          Allow AutoApply to create accounts on job portals when needed
                        </p>
                      </div>
                      <input type="checkbox" className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-900">
                          Daily application limit
                        </label>
                        <p className="text-sm text-gray-500">
                          Maximum number of applications to send per day
                        </p>
                      </div>
                      <select className="input w-24">
                        <option>25</option>
                        <option>50</option>
                        <option>75</option>
                        <option>100</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-900">
                          Pause on errors
                        </label>
                        <p className="text-sm text-gray-500">
                          Pause RapidApply when encountering CAPTCHAs or 2FA
                        </p>
                      </div>
                      <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                    </div>
                  </div>
                </div>

                {/* Notification Settings */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-900">
                          Email notifications
                        </label>
                        <p className="text-sm text-gray-500">
                          Receive email updates about application status
                        </p>
                      </div>
                      <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-900">
                          Browser notifications
                        </label>
                        <p className="text-sm text-gray-500">
                          Show desktop notifications for important updates
                        </p>
                      </div>
                      <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button type="submit" className="btn btn-primary">
                    Save Preferences
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
