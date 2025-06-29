import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner } from './LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'employee' | 'manager' | 'admin'
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading, refreshUser } = useAuth()
  const location = useLocation()

  console.log('ProtectedRoute - loading:', loading, 'user:', user?.email, 'path:', location.pathname)

  // Refresh user data when route changes
  useEffect(() => {
    if (user && !loading) {
      refreshUser().catch(err => {
        console.error('Error refreshing user in ProtectedRoute:', err)
      })
    }
  }, [location.pathname])

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if no user
  if (!user) {
    console.log('No user found, redirecting to login')
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check role permissions
  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    console.log('Insufficient permissions, redirecting to dashboard')
    return <Navigate to="/dashboard" replace />
  }

  console.log('User authenticated, rendering protected content')
  return <>{children}</>
}