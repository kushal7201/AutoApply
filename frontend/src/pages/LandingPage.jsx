import { Link } from 'react-router-dom'
import { 
  BoltIcon, 
  ShieldCheckIcon, 
  ChartBarIcon, 
  ClockIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  CursorArrowRaysIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline'

const LandingPage = () => {
  const features = [
    {
      icon: DocumentTextIcon,
      title: 'Smart Resume Parsing',
      description: 'Upload your resume once and let our AI extract and structure your information for consistent applications.'
    },
    {
      icon: MagnifyingGlassIcon,
      title: 'Unified Job Search',
      description: 'Search across multiple job portals with advanced filters for location, salary, experience, and more.'
    },
    {
      icon: CursorArrowRaysIcon,
      title: 'Auto-Fill Applications',
      description: 'Automatically fill job applications using your profile data with high accuracy and consistency.'
    },
    {
      icon: BoltIcon,
      title: 'RapidApply Mode',
      description: 'Apply to multiple jobs in batch mode with configurable limits and intelligent prioritization.'
    },
    {
      icon: ListBulletIcon,
      title: 'Application Dashboard',
      description: 'Track every application with detailed logs, screenshots, and status updates in one place.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Privacy & Security',
      description: 'Your data is encrypted and secure. Full control over what gets submitted and when.'
    }
  ]

  const stats = [
    { label: 'Applications Automated', value: '10,000+' },
    { label: 'Time Saved (Hours)', value: '5,000+' },
    { label: 'Success Rate', value: '94%' },
    { label: 'Active Users', value: '1,200+' }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Automate Your
            <span className="text-primary-600 block">Job Applications</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Save hours every day by automating repetitive job applications. 
            Upload your resume once, set your preferences, and let AutoApply 
            handle the rest while maintaining full transparency and control.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="btn btn-primary btn-lg">
              Start Applying Now
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Land Your Dream Job
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to streamline your job search and maximize your application success rate.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card">
                <div className="card-content">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How AutoApply Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in minutes and transform your job search process
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Upload Your Profile
              </h3>
              <p className="text-gray-600">
                Upload your resume and fill out your profile. Our AI will parse and structure your information.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Search & Select Jobs
              </h3>
              <p className="text-gray-600">
                Use our unified search to find relevant positions across multiple job boards and company sites.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Auto-Apply & Track
              </h3>
              <p className="text-gray-600">
                Let AutoApply fill and submit applications automatically while you track progress in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Job Search?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of job seekers who have automated their application process 
            and landed their dream jobs faster.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="btn bg-white text-primary-600 hover:bg-gray-100 btn-lg">
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AA</span>
                </div>
                <span className="font-bold text-xl">AutoApply</span>
              </div>
              <p className="text-gray-400">
                Automating job applications with transparency and control.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 AutoApply. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
