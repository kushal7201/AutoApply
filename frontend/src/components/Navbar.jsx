import { Link, useLocation } from 'react-router-dom'
import { cn } from '../utils/cn'

const Navbar = () => {
  const location = useLocation()
  const isAuth = location.pathname === '/login' || location.pathname === '/signup'
  
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', requiresAuth: true },
    { name: 'Profile', path: '/profile', requiresAuth: true },
  ]

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

          {/* Auth Buttons - Far Right */}
          <div className="flex items-center space-x-4">
            {location.pathname === '/' ? (
              <>
                <Link to="/login" className="btn btn-outline btn-sm">
                  Login
                </Link>
                <Link to="/signup" className="btn btn-primary btn-sm">
                  Get Started
                </Link>
              </>
            ) : isAuth ? (
              <Link to="/" className="btn btn-outline btn-sm">
                Back to Home
              </Link>
            ) : (
              <>
                {/* Navigation Links for dashboard pages */}
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
                <button className="btn btn-outline btn-sm">
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
