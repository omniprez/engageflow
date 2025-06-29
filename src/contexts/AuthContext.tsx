import React, { createContext, useContext, useEffect, useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { User } from '../types'

interface AuthContextType {
  user: User | null
  supabaseUser: SupabaseUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing auth...')
        
        // Get initial session with a timeout
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 5000)
        )

        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any

        if (error) {
          console.error('❌ Error getting session:', error)
          if (mounted) setLoading(false)
          return
        }

        console.log('📋 Initial session:', session?.user?.email || 'No session')
        
        if (mounted) {
          setSupabaseUser(session?.user ?? null)
          
          if (session?.user) {
            await handleUserProfile(session.user)
          } else {
            setLoading(false)
          }
        }
      } catch (error) {
        console.error('💥 Error in initializeAuth:', error)
        if (mounted) setLoading(false)
      }
    }

    const handleUserProfile = async (authUser: SupabaseUser) => {
      try {
        console.log('👤 Handling user profile for:', authUser.email)
        
        // Create fallback user immediately to avoid delays
        const fallbackUser: User = {
          id: authUser.id,
          email: authUser.email || '',
          full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
          role: (authUser.user_metadata?.role as 'employee' | 'manager' | 'admin') || 'employee',
          department: authUser.user_metadata?.department || 'General',
          points: 0,
          level: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        // Set fallback user first to stop loading immediately
        if (mounted) {
          setUser(fallbackUser)
          setLoading(false)
        }

        // Try to fetch real profile in background (non-blocking)
        try {
          const { data, error } = await Promise.race([
            supabase.from('profiles').select('*').eq('id', authUser.id).single(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Profile timeout')), 3000))
          ]) as any

          if (!error && data && mounted) {
            console.log('✅ Profile fetched successfully:', data.email, 'Points:', data.points)
            setUser(data)
          }
        } catch (profileError) {
          console.log('⚠️ Profile fetch failed, using fallback:', profileError)
          // Fallback user is already set, so we continue
        }

      } catch (error) {
        console.error('💥 Error in handleUserProfile:', error)
        // Fallback user should already be set
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.email || 'No user')
      
      if (!mounted) return
      
      setSupabaseUser(session?.user ?? null)
      
      if (session?.user) {
        await handleUserProfile(session.user)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const refreshUser = async () => {
    if (!supabaseUser) return

    try {
      console.log('🔄 Refreshing user profile...')
      
      // Fetch the updated profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single()

      if (!error && data) {
        console.log('✅ User profile refreshed:', data.email, 'Points:', data.points)
        setUser(data)
      }
    } catch (error) {
      console.error('❌ Error refreshing user:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Attempting to sign in:', email)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      console.error('❌ Sign in error:', error)
      throw error
    }
    
    console.log('✅ Sign in successful for:', data.user?.email)
  }

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.full_name,
          role: userData.role,
          department: userData.department
        }
      }
    })
    
    if (error) throw error
  }

  const signOut = async () => {
    console.log('🚪 Signing out...')
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    setUser(null)
    setSupabaseUser(null)
    setLoading(false)
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)

      if (error) throw error
      setUser({ ...user, ...updates })
    } catch (error) {
      console.error('Error updating profile:', error)
      setUser({ ...user, ...updates })
    }
  }

  const value = {
    user,
    supabaseUser,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}