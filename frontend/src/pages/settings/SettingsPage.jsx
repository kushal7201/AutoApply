import React, { useState } from 'react'
import { 
  CogIcon, 
  BellIcon, 
  ShieldCheckIcon, 
  CreditCardIcon,
  UserGroupIcon,
  ComputerDesktopIcon,
  KeyIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState({
    // General Settings
    autoApply: true,
    maxApplicationsPerDay: 10,
    applicationDelay: 30,
    requireManualReview: false,
    
    // Notifications
    emailNotifications: true,
    browserNotifications: true,
    applicationSuccess: true,
    applicationFailure: true,
    dailySummary: true,
    weeklyReport: false,
    
    // Automation Settings
    enableCoverLetter: true,
    customizePerJob: true,
    followUpEmails: false,
    saveApplicationHistory: true,
    autoWithdrawRejected: false,
    
    // Privacy & Security
    twoFactorAuth: false,
    dataRetention: '1year',
    shareAnalytics: true,
    publicProfile: false
  })

  const [apiKeys, setApiKeys] = useState([
    { id: 1, name: 'LinkedIn API', created: '2024-01-15', lastUsed: '2024-01-20' },
    { id: 2, name: 'Indeed API', created: '2024-01-10', lastUsed: '2024-01-19' }
  ])

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const tabs = [
    { id: 'general', label: 'General', icon: CogIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'automation', label: 'Automation', icon: ComputerDesktopIcon },
    { id: 'privacy', label: 'Privacy & Security', icon: ShieldCheckIcon },
    { id: 'billing', label: 'Billing', icon: CreditCardIcon },
    { id: 'integrations', label: 'Integrations', icon: KeyIcon }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">
          Configure your account preferences and automation settings.
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
          {/* General Settings Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Application Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">Auto Apply</label>
                      <p className="text-sm text-gray-500">Automatically apply to jobs that match your criteria</p>
                    </div>
                    <button
                      onClick={() => updateSetting('autoApply', !settings.autoApply)}
                      className={`${
                        settings.autoApply ? 'bg-primary-600' : 'bg-gray-200'
                      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                    >
                      <span
                        className={`${
                          settings.autoApply ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Applications Per Day
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={settings.maxApplicationsPerDay}
                      onChange={(e) => updateSetting('maxApplicationsPerDay', parseInt(e.target.value))}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">Recommended: 5-15 applications per day</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delay Between Applications (seconds)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="300"
                      value={settings.applicationDelay}
                      onChange={(e) => updateSetting('applicationDelay', parseInt(e.target.value))}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">Helps avoid being flagged as a bot</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">Require Manual Review</label>
                      <p className="text-sm text-gray-500">Review applications before they are submitted</p>
                    </div>
                    <button
                      onClick={() => updateSetting('requireManualReview', !settings.requireManualReview)}
                      className={`${
                        settings.requireManualReview ? 'bg-primary-600' : 'bg-gray-200'
                      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                    >
                      <span
                        className={`${
                          settings.requireManualReview ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">Email Notifications</label>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <button
                      onClick={() => updateSetting('emailNotifications', !settings.emailNotifications)}
                      className={`${
                        settings.emailNotifications ? 'bg-primary-600' : 'bg-gray-200'
                      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                    >
                      <span
                        className={`${
                          settings.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">Browser Notifications</label>
                      <p className="text-sm text-gray-500">Show desktop notifications</p>
                    </div>
                    <button
                      onClick={() => updateSetting('browserNotifications', !settings.browserNotifications)}
                      className={`${
                        settings.browserNotifications ? 'bg-primary-600' : 'bg-gray-200'
                      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                    >
                      <span
                        className={`${
                          settings.browserNotifications ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      />
                    </button>
                  </div>

                  <div className="ml-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-700">Application Success</label>
                      <input
                        type="checkbox"
                        checked={settings.applicationSuccess}
                        onChange={(e) => updateSetting('applicationSuccess', e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-700">Application Failure</label>
                      <input
                        type="checkbox"
                        checked={settings.applicationFailure}
                        onChange={(e) => updateSetting('applicationFailure', e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-700">Daily Summary</label>
                      <input
                        type="checkbox"
                        checked={settings.dailySummary}
                        onChange={(e) => updateSetting('dailySummary', e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-700">Weekly Report</label>
                      <input
                        type="checkbox"
                        checked={settings.weeklyReport}
                        onChange={(e) => updateSetting('weeklyReport', e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Automation Tab */}
          {activeTab === 'automation' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Automation Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">Enable Cover Letter</label>
                      <p className="text-sm text-gray-500">Automatically include cover letters in applications</p>
                    </div>
                    <button
                      onClick={() => updateSetting('enableCoverLetter', !settings.enableCoverLetter)}
                      className={`${
                        settings.enableCoverLetter ? 'bg-primary-600' : 'bg-gray-200'
                      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                    >
                      <span
                        className={`${
                          settings.enableCoverLetter ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">Customize Per Job</label>
                      <p className="text-sm text-gray-500">Tailor applications based on job description</p>
                    </div>
                    <button
                      onClick={() => updateSetting('customizePerJob', !settings.customizePerJob)}
                      className={`${
                        settings.customizePerJob ? 'bg-primary-600' : 'bg-gray-200'
                      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                    >
                      <span
                        className={`${
                          settings.customizePerJob ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">Follow-up Emails</label>
                      <p className="text-sm text-gray-500">Send follow-up emails after applications</p>
                    </div>
                    <button
                      onClick={() => updateSetting('followUpEmails', !settings.followUpEmails)}
                      className={`${
                        settings.followUpEmails ? 'bg-primary-600' : 'bg-gray-200'
                      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                    >
                      <span
                        className={`${
                          settings.followUpEmails ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">Save Application History</label>
                      <p className="text-sm text-gray-500">Keep detailed logs of all applications</p>
                    </div>
                    <button
                      onClick={() => updateSetting('saveApplicationHistory', !settings.saveApplicationHistory)}
                      className={`${
                        settings.saveApplicationHistory ? 'bg-primary-600' : 'bg-gray-200'
                      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                    >
                      <span
                        className={`${
                          settings.saveApplicationHistory ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">Auto-withdraw Rejected</label>
                      <p className="text-sm text-gray-500">Automatically withdraw from jobs that reject you</p>
                    </div>
                    <button
                      onClick={() => updateSetting('autoWithdrawRejected', !settings.autoWithdrawRejected)}
                      className={`${
                        settings.autoWithdrawRejected ? 'bg-primary-600' : 'bg-gray-200'
                      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                    >
                      <span
                        className={`${
                          settings.autoWithdrawRejected ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Privacy & Security Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy & Security</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">Two-Factor Authentication</label>
                      <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                    </div>
                    <button
                      onClick={() => updateSetting('twoFactorAuth', !settings.twoFactorAuth)}
                      className={`${
                        settings.twoFactorAuth ? 'bg-primary-600' : 'bg-gray-200'
                      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                    >
                      <span
                        className={`${
                          settings.twoFactorAuth ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data Retention Period
                    </label>
                    <select 
                      value={settings.dataRetention}
                      onChange={(e) => updateSetting('dataRetention', e.target.value)}
                      className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="6months">6 Months</option>
                      <option value="1year">1 Year</option>
                      <option value="2years">2 Years</option>
                      <option value="indefinite">Indefinite</option>
                    </select>
                    <p className="text-sm text-gray-500 mt-1">How long to keep your application history</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">Share Anonymous Analytics</label>
                      <p className="text-sm text-gray-500">Help us improve by sharing usage data</p>
                    </div>
                    <button
                      onClick={() => updateSetting('shareAnalytics', !settings.shareAnalytics)}
                      className={`${
                        settings.shareAnalytics ? 'bg-primary-600' : 'bg-gray-200'
                      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                    >
                      <span
                        className={`${
                          settings.shareAnalytics ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">Public Profile</label>
                      <p className="text-sm text-gray-500">Allow others to view your profile</p>
                    </div>
                    <button
                      onClick={() => updateSetting('publicProfile', !settings.publicProfile)}
                      className={`${
                        settings.publicProfile ? 'bg-primary-600' : 'bg-gray-200'
                      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                    >
                      <span
                        className={`${
                          settings.publicProfile ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      />
                    </button>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5" />
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-red-800">Danger Zone</h4>
                      <p className="text-sm text-red-700 mt-1">
                        These actions cannot be undone. Please be careful.
                      </p>
                      <div className="mt-4 space-y-2">
                        <button className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50">
                          <TrashIcon className="h-4 w-4 mr-2" />
                          Delete All Application Data
                        </button>
                        <br />
                        <button className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50">
                          <TrashIcon className="h-4 w-4 mr-2" />
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Subscription & Billing</h3>
                
                <div className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-primary-900">Pro Plan</h4>
                      <p className="text-primary-700">500 applications per month</p>
                      <p className="text-sm text-primary-600 mt-1">Next billing date: February 15, 2024</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-primary-900">$29</p>
                      <p className="text-primary-700">/month</p>
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-3">
                    <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                      Upgrade Plan
                    </button>
                    <button className="px-4 py-2 border border-primary-600 text-primary-600 rounded-md hover:bg-primary-50">
                      Cancel Subscription
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Payment Method</h4>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold mr-3">
                          VISA
                        </div>
                        <div>
                          <p className="font-medium">•••• •••• •••• 4242</p>
                          <p className="text-sm text-gray-500">Expires 12/26</p>
                        </div>
                      </div>
                      <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                        Update
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Billing History</h4>
                  <div className="border border-gray-200 rounded-lg">
                    <div className="divide-y divide-gray-200">
                      {[
                        { date: 'Jan 15, 2024', amount: '$29.00', status: 'Paid' },
                        { date: 'Dec 15, 2023', amount: '$29.00', status: 'Paid' },
                        { date: 'Nov 15, 2023', amount: '$29.00', status: 'Paid' }
                      ].map((invoice, index) => (
                        <div key={index} className="p-4 flex items-center justify-between">
                          <div>
                            <p className="font-medium">{invoice.date}</p>
                            <p className="text-sm text-gray-500">Pro Plan</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{invoice.amount}</p>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {invoice.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">API Keys & Integrations</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-md font-medium text-gray-900">API Keys</h4>
                      <p className="text-sm text-gray-500">Manage your API keys for external integrations</p>
                    </div>
                    <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
                      <KeyIcon className="h-4 w-4 mr-2" />
                      Generate New Key
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-lg">
                    <div className="divide-y divide-gray-200">
                      {apiKeys.map((key) => (
                        <div key={key.id} className="p-4 flex items-center justify-between">
                          <div>
                            <p className="font-medium">{key.name}</p>
                            <p className="text-sm text-gray-500">
                              Created: {new Date(key.created).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500">
                              Last used: {new Date(key.lastUsed).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button className="text-gray-400 hover:text-gray-600">
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button className="text-gray-400 hover:text-red-600">
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Connected Services</h4>
                  <div className="space-y-3">
                    {[
                      { name: 'LinkedIn', connected: true, description: 'Sync your LinkedIn profile and apply to jobs' },
                      { name: 'Indeed', connected: true, description: 'Access Indeed job listings and apply automatically' },
                      { name: 'Glassdoor', connected: false, description: 'Get salary insights and company reviews' },
                      { name: 'AngelList', connected: false, description: 'Apply to startup jobs on AngelList' }
                    ].map((service, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-gray-500">{service.description}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            service.connected 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {service.connected ? 'Connected' : 'Not Connected'}
                          </span>
                          <button className={`px-3 py-1 text-sm rounded ${
                            service.connected
                              ? 'text-red-600 hover:text-red-700'
                              : 'text-primary-600 hover:text-primary-700'
                          }`}>
                            {service.connected ? 'Disconnect' : 'Connect'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
