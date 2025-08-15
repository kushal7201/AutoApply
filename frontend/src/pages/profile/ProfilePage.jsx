import React, { useState, useRef, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { 
  UserCircleIcon, 
  DocumentTextIcon, 
  BriefcaseIcon, 
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline'
import {
  useProfile,
  useUpdatePersonalInfo,
  useUpdateSkills,
  useResumes,
  useUploadResume,
  useSetDefaultResume,
  useDeleteResume,
  useAddWorkExperience,
  useUpdateWorkExperience,
  useDeleteWorkExperience,
  useAddEducation,
  useUpdateEducation,
  useDeleteEducation,
  useUpdateJobPreferences
} from '../../hooks/useProfile'
import profileService from '../../services/profileService'
import toast from 'react-hot-toast'

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('personal')
  const [newSkill, setNewSkill] = useState('')
  const [editingExperience, setEditingExperience] = useState(null)
  const [editingEducation, setEditingEducation] = useState(null)

  // Fetch profile data
  const { data: profile, isLoading: profileLoading, error: profileError } = useProfile()
  const { data: resumes, isLoading: resumesLoading } = useResumes()

  // Mutations
  const updatePersonalInfoMutation = useUpdatePersonalInfo()
  const updateSkillsMutation = useUpdateSkills()
  const uploadResumeMutation = useUploadResume()
  const setDefaultResumeMutation = useSetDefaultResume()
  const deleteResumeMutation = useDeleteResume()
  const addWorkExperienceMutation = useAddWorkExperience()
  const updateWorkExperienceMutation = useUpdateWorkExperience()
  const deleteWorkExperienceMutation = useDeleteWorkExperience()
  const addEducationMutation = useAddEducation()
  const updateEducationMutation = useUpdateEducation()
  const deleteEducationMutation = useDeleteEducation()
  const updateJobPreferencesMutation = useUpdateJobPreferences()

  // Local state for form data
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedIn: '',
    github: '',
    summary: ''
  })

  const [skills, setSkills] = useState([])
  const [jobPreferences, setJobPreferences] = useState({
    preferredTitles: [],
    preferredLocations: [],
    jobType: 'full-time',
    experienceLevel: 'mid-level',
    salaryMin: '',
    salaryMax: '',
    remotePreference: 'no-preference'
  })

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setPersonalInfo({
        firstName: profile.personalInfo?.firstName || '',
        lastName: profile.personalInfo?.lastName || '',
        email: profile.personalInfo?.email || '',
        phone: profile.personalInfo?.phone || '',
        location: profile.personalInfo?.location || '',
        website: profile.personalInfo?.website || '',
        linkedIn: profile.personalInfo?.linkedIn || '',
        github: profile.personalInfo?.github || '',
        summary: profile.personalInfo?.summary || ''
      })
      
      setSkills(profile.skills || [])
      
      setJobPreferences({
        preferredTitles: profile.jobPreferences?.preferredTitles || [],
        preferredLocations: profile.jobPreferences?.preferredLocations || [],
        jobType: profile.jobPreferences?.jobType || 'full-time',
        experienceLevel: profile.jobPreferences?.experienceLevel || 'mid-level',
        salaryMin: profile.jobPreferences?.salaryRange?.min || '',
        salaryMax: profile.jobPreferences?.salaryRange?.max || '',
        remotePreference: profile.jobPreferences?.remotePreference || 'no-preference'
      })
    }
  }, [profile])

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      const formData = new FormData()
      formData.append('resume', file)
      formData.append('name', file.name.split('.')[0])
      
      uploadResumeMutation.mutate(formData)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  })

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      const updatedSkills = [...skills, newSkill.trim()]
      setSkills(updatedSkills)
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove) => {
    const updatedSkills = skills.filter(skill => skill !== skillToRemove)
    setSkills(updatedSkills)
  }

  const handleSavePersonalInfo = () => {
    updatePersonalInfoMutation.mutate(personalInfo)
  }

  const handleSaveSkills = () => {
    updateSkillsMutation.mutate(skills)
  }

  const handleSaveJobPreferences = () => {
    const preferences = {
      ...jobPreferences,
      salaryRange: {
        min: parseInt(jobPreferences.salaryMin) || null,
        max: parseInt(jobPreferences.salaryMax) || null
      }
    }
    delete preferences.salaryMin
    delete preferences.salaryMax
    
    updateJobPreferencesMutation.mutate(preferences)
  }

  const handleSetDefaultResume = (resumeId) => {
    setDefaultResumeMutation.mutate(resumeId)
  }

  const handleDeleteResume = (resumeId) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      deleteResumeMutation.mutate(resumeId)
    }
  }

  const handleDownloadResume = async (resumeId) => {
    try {
      await profileService.downloadResume(resumeId)
      // Don't show success toast since download happens automatically
    } catch (error) {
      console.error('Download error:', error)
      toast.error(error.message || 'Failed to download resume')
    }
  }

  const handleAddExperience = () => {
    setEditingExperience({
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    })
  }

  const handleSaveExperience = () => {
    if (editingExperience._id) {
      updateWorkExperienceMutation.mutate({
        experienceId: editingExperience._id,
        experience: editingExperience
      })
    } else {
      addWorkExperienceMutation.mutate(editingExperience)
    }
    setEditingExperience(null)
  }

  const handleDeleteExperience = (experienceId) => {
    if (window.confirm('Are you sure you want to delete this work experience?')) {
      deleteWorkExperienceMutation.mutate(experienceId)
    }
  }

  const handleAddEducation = () => {
    setEditingEducation({
      degree: '',
      school: '',
      location: '',
      graduationDate: '',
      gpa: ''
    })
  }

  const handleSaveEducation = () => {
    if (editingEducation._id) {
      updateEducationMutation.mutate({
        educationId: editingEducation._id,
        education: editingEducation
      })
    } else {
      addEducationMutation.mutate(editingEducation)
    }
    setEditingEducation(null)
  }

  const handleDeleteEducation = (educationId) => {
    if (window.confirm('Are you sure you want to delete this education entry?')) {
      deleteEducationMutation.mutate(educationId)
    }
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (profileError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-600">Error loading profile: {profileError.message}</p>
      </div>
    )
  }

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: UserCircleIcon },
    { id: 'resumes', label: 'Resumes', icon: DocumentTextIcon },
    { id: 'experience', label: 'Experience', icon: BriefcaseIcon },
    { id: 'preferences', label: 'Job Preferences', icon: MapPinIcon }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="mt-2 text-gray-600">
          Manage your resume, personal information, and job preferences.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={personalInfo.firstName}
                    onChange={(e) => setPersonalInfo({...personalInfo, firstName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={personalInfo.lastName}
                    onChange={(e) => setPersonalInfo({...personalInfo, lastName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={personalInfo.location}
                    onChange={(e) => setPersonalInfo({...personalInfo, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={personalInfo.website}
                    onChange={(e) => setPersonalInfo({...personalInfo, website: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    value={personalInfo.linkedIn}
                    onChange={(e) => setPersonalInfo({...personalInfo, linkedIn: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GitHub
                  </label>
                  <input
                    type="url"
                    value={personalInfo.github}
                    onChange={(e) => setPersonalInfo({...personalInfo, github: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professional Summary
                </label>
                <textarea
                  rows={4}
                  value={personalInfo.summary}
                  onChange={(e) => setPersonalInfo({...personalInfo, summary: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Write a brief summary of your professional background..."
                />
              </div>

              {/* Skills Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-primary-600 hover:text-primary-800"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    placeholder="Add a skill..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    onClick={addSkill}
                    disabled={updateSkillsMutation.isPending}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
                <div className="flex justify-end mt-4">
                  <button 
                    onClick={handleSaveSkills}
                    disabled={updateSkillsMutation.isPending}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {updateSkillsMutation.isPending ? 'Saving...' : 'Save Skills'}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={handleSavePersonalInfo}
                  disabled={updatePersonalInfoMutation.isPending}
                  className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatePersonalInfoMutation.isPending ? 'Saving...' : 'Save Personal Info'}
                </button>
              </div>
            </div>
          )}

          {/* Resumes Tab */}
          {activeTab === 'resumes' && (
            <div className="space-y-6">
              {/* Upload Area */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-primary-400 bg-primary-50'
                    : 'border-gray-300 hover:border-primary-400'
                }`}
              >
                <input {...getInputProps()} />
                <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {isDragActive ? 'Drop your resume here' : 'Upload a new resume'}
                </p>
                <p className="text-gray-600">
                  Drag and drop your resume, or click to browse
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Supported formats: PDF, DOC, DOCX
                </p>
              </div>

              {/* Existing Resumes */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Your Resumes</h3>
                {resumesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {resumes && resumes.length > 0 ? (
                      resumes.map((resume) => (
                        <div
                          key={resume._id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleDownloadResume(resume._id)}
                        >
                          <div className="flex items-center space-x-3">
                            <DocumentTextIcon className="h-8 w-8 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">{resume.filename || resume.name}</p>
                              <p className="text-sm text-gray-500">
                                Uploaded on {resume.uploadDate ? new Date(resume.uploadDate).toLocaleDateString() : 'Unknown'}
                              </p>
                            </div>
                            {resume.isDefault && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                            {!resume.isDefault && (
                              <button 
                                onClick={() => handleSetDefaultResume(resume._id)}
                                disabled={setDefaultResumeMutation.isPending}
                                className="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded hover:bg-primary-200 disabled:opacity-50"
                              >
                                Set Default
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeleteResume(resume._id)}
                              disabled={deleteResumeMutation.isPending}
                              className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-50"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No resumes uploaded yet</p>
                        <p className="text-sm text-gray-400">Upload your first resume above to get started</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Experience Tab */}
          {activeTab === 'experience' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Work Experience</h3>
                <button 
                  onClick={handleAddExperience}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Experience
                </button>
              </div>

              <div className="space-y-4">
                {profile?.workExperience && profile.workExperience.length > 0 ? (
                  profile.workExperience.map((exp) => (
                    <div key={exp._id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900">{exp.title}</h4>
                          <p className="text-primary-600 font-medium">{exp.company}</p>
                          <p className="text-gray-500">{exp.location}</p>
                          <p className="text-sm text-gray-500">
                            {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                          </p>
                          <p className="mt-3 text-gray-700">{exp.description}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => setEditingExperience(exp)}
                            className="p-2 text-gray-400 hover:text-gray-600"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteExperience(exp._id)}
                            disabled={deleteWorkExperienceMutation.isPending}
                            className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-50"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No work experience added yet</p>
                    <p className="text-sm text-gray-400">Add your first job to get started</p>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Education</h3>
                  <button 
                    onClick={handleAddEducation}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Education
                  </button>
                </div>

                <div className="space-y-4">
                  {profile?.education && profile.education.length > 0 ? (
                    profile.education.map((edu) => (
                      <div key={edu._id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">{edu.degree}</h4>
                            <p className="text-primary-600 font-medium">{edu.school}</p>
                            <p className="text-gray-500">{edu.location}</p>
                            <p className="text-sm text-gray-500">Graduated: {edu.graduationDate}</p>
                            {edu.gpa && <p className="text-sm text-gray-500">GPA: {edu.gpa}</p>}
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => setEditingEducation(edu)}
                              className="p-2 text-gray-400 hover:text-gray-600"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteEducation(edu._id)}
                              disabled={deleteEducationMutation.isPending}
                              className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-50"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <UserCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No education added yet</p>
                      <p className="text-sm text-gray-400">Add your education to get started</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Job Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Job Titles
                  </label>
                  <textarea
                    rows={3}
                    value={jobPreferences.preferredTitles.join(', ')}
                    onChange={(e) => setJobPreferences({
                      ...jobPreferences, 
                      preferredTitles: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                    })}
                    placeholder="Software Engineer, Full Stack Developer, Backend Engineer..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Locations
                  </label>
                  <textarea
                    rows={3}
                    value={jobPreferences.preferredLocations.join(', ')}
                    onChange={(e) => setJobPreferences({
                      ...jobPreferences, 
                      preferredLocations: e.target.value.split(',').map(l => l.trim()).filter(l => l)
                    })}
                    placeholder="San Francisco, CA; New York, NY; Remote..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Type
                  </label>
                  <select 
                    value={jobPreferences.jobType}
                    onChange={(e) => setJobPreferences({...jobPreferences, jobType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="freelance">Freelance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level
                  </label>
                  <select 
                    value={jobPreferences.experienceLevel}
                    onChange={(e) => setJobPreferences({...jobPreferences, experienceLevel: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="entry-level">Entry Level</option>
                    <option value="mid-level">Mid Level</option>
                    <option value="senior-level">Senior Level</option>
                    <option value="lead-principal">Lead/Principal</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary Range (Annual)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={jobPreferences.salaryMin}
                      onChange={(e) => setJobPreferences({...jobPreferences, salaryMin: e.target.value})}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={jobPreferences.salaryMax}
                      onChange={(e) => setJobPreferences({...jobPreferences, salaryMax: e.target.value})}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remote Work Preference
                  </label>
                  <select 
                    value={jobPreferences.remotePreference}
                    onChange={(e) => setJobPreferences({...jobPreferences, remotePreference: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="remote-only">Remote Only</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="on-site">On-site</option>
                    <option value="no-preference">No Preference</option>
                  </select>
                </div>

              </div>

              <div className="flex justify-end">
                <button 
                  onClick={handleSaveJobPreferences}
                  disabled={updateJobPreferencesMutation.isPending}
                  className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {updateJobPreferencesMutation.isPending ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
