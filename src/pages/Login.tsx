import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { createDemoUsers } from '../lib/createDemoUsers'
import { Zap, Mail, Lock, Users, Shield, Star } from 'lucide-react'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [creatingDemoUsers, setCreatingDemoUsers] = useState(false)
  const { signIn, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      console.log('User is already logged in, redirecting to dashboard')
      navigate('/dashboard', { replace: true })
    }
  }, [user, authLoading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await signIn(email, password)
      toast.success('Welcome back!')
    } catch (error: any) {
      console.error('Login error:', error)
      if (error.message?.includes('Invalid login credentials')) {
        toast.error('Invalid email or password. Please check your credentials or create demo users first.')
      } else {
        toast.error(error.message || 'Failed to sign in')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDemoUsers = async () => {
    setCreatingDemoUsers(true)
    try {
      await createDemoUsers()
      toast.success('Demo users created successfully! You can now log in with the demo accounts.')
    } catch (error) {
      toast.error('Failed to create demo users')
    } finally {
      setCreatingDemoUsers(false)
    }
  }

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword('password')
  }

  // Show loading spinner while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-neutral-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Don't render login form if user is already authenticated
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-neutral-600">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-12 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32"></div>
        
        <div className="relative z-10 max-w-md">
          <div className="flex items-center space-x-3 mb-8">
            <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">EngageFlow</h1>
              <p className="text-primary-100">Employee Engagement Platform</p>
            </div>
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            Transform Your Workplace Engagement
          </h2>
          
          <p className="text-xl text-primary-100 mb-8 leading-relaxed">
            Empower your team with goal tracking, gamification, and meaningful recognition that drives real results.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-primary-100">
              <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Star className="h-4 w-4" />
              </div>
              <span>Goal tracking and progress monitoring</span>
            </div>
            <div className="flex items-center space-x-3 text-primary-100">
              <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4" />
              </div>
              <span>Team collaboration and leaderboards</span>
            </div>
            <div className="flex items-center space-x-3 text-primary-100">
              <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Shield className="h-4 w-4" />
              </div>
              <span>Secure and enterprise-ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-neutral-50 via-white to-primary-50/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full space-y-8"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl flex items-center justify-center shadow-soft mb-4">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">EngageFlow</h1>
            <p className="text-neutral-600 mt-1">Employee Engagement Platform</p>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-neutral-900 mb-2">
              Welcome back
            </h2>
            <p className="text-neutral-600">
              Sign in to your account to continue your journey
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="label">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="label">
                  <Lock className="h-4 w-4 inline mr-2" />
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <LoadingSpinner size="sm" />
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-sm text-neutral-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
              >
                Create one here
              </Link>
            </p>
          </div>

          {/* Demo accounts section */}
          <div className="border-t border-neutral-200 pt-6">
            <div className="text-center mb-4">
              <h3 className="text-sm font-semibold text-neutral-700 mb-2">Try Demo Accounts</h3>
              <p className="text-xs text-neutral-500">
                Click on any account below to auto-fill the login form
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('employee@demo.com')}
                className="flex items-center justify-between p-3 bg-neutral-50 hover:bg-neutral-100 rounded-xl border border-neutral-200 transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Employee Demo</p>
                    <p className="text-xs text-neutral-500">employee@demo.com</p>
                  </div>
                </div>
                <span className="text-xs text-neutral-400">Click to use</span>
              </button>
              
              <button
                type="button"
                onClick={() => handleDemoLogin('manager@demo.com')}
                className="flex items-center justify-between p-3 bg-neutral-50 hover:bg-neutral-100 rounded-xl border border-neutral-200 transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-secondary-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-4 w-4 text-secondary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Manager Demo</p>
                    <p className="text-xs text-neutral-500">manager@demo.com</p>
                  </div>
                </div>
                <span className="text-xs text-neutral-400">Click to use</span>
              </button>
              
              <button
                type="button"
                onClick={() => handleDemoLogin('admin@demo.com')}
                className="flex items-center justify-between p-3 bg-neutral-50 hover:bg-neutral-100 rounded-xl border border-neutral-200 transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-accent-100 rounded-lg flex items-center justify-center">
                    <Star className="h-4 w-4 text-accent-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Admin Demo</p>
                    <p className="text-xs text-neutral-500">admin@demo.com</p>
                  </div>
                </div>
                <span className="text-xs text-neutral-400">Click to use</span>
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={handleCreateDemoUsers}
                disabled={creatingDemoUsers}
                className="btn-secondary w-full"
              >
                {creatingDemoUsers ? (
                  <div className="flex items-center justify-center space-x-2">
                    <LoadingSpinner size="sm" />
                    <span>Creating demo users...</span>
                  </div>
                ) : (
                  'Create Demo Users'
                )}
              </button>
              <p className="mt-2 text-xs text-neutral-500">
                Click this if demo accounts don't exist yet
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}