import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { createDemoUsers } from '../lib/createDemoUsers'

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
      // Don't navigate here - let the useEffect handle it after user state updates
    } catch (error: any) {
      console.error('Login error:', error)
      if (error.message?.includes('Invalid login credentials')) {
        toast.error('Invalid email or password. Please check your credentials or create demo users first.')
      } else {
        toast.error(error.message || 'Failed to sign in')
      }
    } finally {
      setLoading(false) // Set loading to false regardless of success or failure
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

  // Show loading spinner while checking auth state or during login
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Don't render login form if user is already authenticated
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        <div>
          <div className="mx-auto h-12 w-12 bg-primary-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">EF</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Sign in to EngageFlow
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Sign in'}
            </button>
          </div>

          <div className="text-center space-y-4">
            <div>
              <p className="text-sm text-gray-600">
                Demo accounts:
              </p>
              <div className="mt-2 space-y-1 text-xs text-gray-500">
                <p>Employee: employee@demo.com / password</p>
                <p>Manager: manager@demo.com / password</p>
                <p>Admin: admin@demo.com / password</p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCreateDemoUsers}
                disabled={creatingDemoUsers}
                className="w-full flex justify-center py-2 px-4 border border-primary-600 text-sm font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingDemoUsers ? <LoadingSpinner size="sm" /> : 'Create Demo Users'}
              </button>
              <p className="mt-2 text-xs text-gray-500">
                Click this button if demo accounts don't exist yet
              </p>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  )
}