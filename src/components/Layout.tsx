import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Target, 
  Trophy, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  Zap,
  Bell,
  Search
} from 'lucide-react'
import { useState } from 'react'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Goals', href: '/goals', icon: Target },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: 'Team', href: '/team', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const getPageTitle = () => {
    const currentPath = location.pathname
    const currentNav = navigation.find(nav => nav.href === currentPath)
    return currentNav?.name || 'EngageFlow'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-neutral-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl lg:hidden"
      >
        <div className="flex h-full flex-col">
          {/* Mobile header */}
          <div className="flex h-20 items-center justify-between px-6 border-b border-neutral-200">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center shadow-soft">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold gradient-text">EngageFlow</h1>
                <p className="text-xs text-neutral-500">Employee Engagement</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={isActive ? 'nav-link-active' : 'nav-link-inactive'}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-primary-600' : 'text-neutral-400 group-hover:text-neutral-600'}`} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Mobile user section */}
          <div className="p-4 border-t border-neutral-200">
            <div className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-xl">
              <div className="avatar h-10 w-10">
                <span className="text-sm">
                  {user?.full_name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-900 truncate">{user?.full_name}</p>
                <p className="text-xs text-neutral-500 truncate">{user?.role}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-neutral-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-neutral-200/50 shadow-soft">
          {/* Desktop header */}
          <div className="flex items-center h-20 px-6 border-b border-neutral-200/50">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center shadow-soft">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">EngageFlow</h1>
                <p className="text-xs text-neutral-500">Employee Engagement Platform</p>
              </div>
            </div>
          </div>

          {/* Desktop navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={isActive ? 'nav-link-active' : 'nav-link-inactive'}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-primary-600' : 'text-neutral-400 group-hover:text-neutral-600'}`} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Desktop user section */}
          <div className="p-4 border-t border-neutral-200/50">
            <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-neutral-50 to-primary-50/50 rounded-xl border border-neutral-200/50">
              <div className="avatar h-12 w-12">
                <span className="text-sm">
                  {user?.full_name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-900 truncate">{user?.full_name}</p>
                <p className="text-xs text-neutral-500 truncate capitalize">{user?.role}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center space-x-1 text-xs text-primary-600">
                    <Trophy className="h-3 w-3" />
                    <span>Level {user?.level}</span>
                  </div>
                  <div className="text-xs text-neutral-400">•</div>
                  <div className="text-xs text-secondary-600 font-medium">
                    {user?.points} pts
                  </div>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-neutral-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-neutral-200/50 shadow-soft">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">{getPageTitle()}</h2>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Search button */}
              <button className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                <Search className="h-5 w-5" />
              </button>
              
              {/* Notifications */}
              <button className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-error-500 rounded-full"></span>
              </button>

              {/* User stats */}
              <div className="hidden sm:flex items-center space-x-4 px-4 py-2 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl border border-primary-200/50">
                <div className="flex items-center space-x-2 text-sm">
                  <Trophy className="h-4 w-4 text-primary-600" />
                  <span className="font-semibold text-primary-700">Level {user?.level}</span>
                </div>
                <div className="w-px h-4 bg-neutral-300"></div>
                <div className="text-sm font-semibold text-secondary-700">
                  {user?.points} points
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}