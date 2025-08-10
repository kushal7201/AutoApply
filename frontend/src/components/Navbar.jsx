import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { cn } from '../utils/cn'

const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, logout, user, loading } = useAuth()
  
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'
  
  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Profile', path: '/profile' },
  ]

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (loading) {
    return (
      <nav className="bg-white border-b border-gray-200">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AA</span>
                </div>
                <span className="font-bold text-xl text-gray-900">AutoApply</span>
              </Link>
            </div>
            <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Far Left */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AA</span>
              </div>
              <span className="font-bold text-xl text-gray-900">AutoApply</span>
            </Link>
          </div>

          {/* Navigation and Auth Buttons - Far Right */}
          <div className="flex items-center space-x-4">
            {!isAuthenticated ? (
              // Show login/signup for non-authenticated users
              location.pathname === '/' ? (
                <>
                  <Link to="/login" className="btn btn-outline btn-sm">
                    Login
                  </Link>
                  <Link to="/signup" className="btn btn-primary btn-sm">
                    Get Started
                  </Link>
                </>
              ) : isAuthPage ? (
                <Link to="/" className="btn btn-outline btn-sm">
                  Back to Home
                </Link>
              ) : null
            ) : (
              // Show navigation and logout for authenticated users
              <>
                {/* Navigation Links for authenticated users */}
                <div className="hidden md:flex items-center space-x-4 mr-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={cn(
                        'nav-link',
                        location.pathname === item.path && 'nav-link-active'
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>

                {/* User Info and Logout */}
                <div className="flex items-center space-x-3">
                  {user && (
                    <span className="text-sm text-gray-700 hidden sm:block">
                      Welcome, {user.name.split(' ')[0]}
                    </span>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="btn btn-outline btn-sm hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
