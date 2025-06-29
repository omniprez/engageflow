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
        
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('❌ Error getting session:', error)
          if (mounted) {
            setLoading(false)
          }
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
        if (mounted) {
          setLoading(false)
        }
      }
    }

    const handleUserProfile = async (authUser: SupabaseUser) => {
      try {
        console.log('👤 Handling user profile for:', authUser.email)
        
        // Try to fetch real profile first
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (!error && data && mounted) {
          console.log('✅ Profile fetched successfully:', data.email, 'Points:', data.points)
          setUser(data)
          setLoading(false)
          return
        }

        console.log('⚠️ Profile not found, creating fallback user')
        
        // Create fallback user if profile doesn't exist
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

        if (mounted) {
          setUser(fallbackUser)
          setLoading(false)
        }

      } catch (error) {
        console.error('💥 Error in handleUserProfile:', error)
        if (mounted) {
          setLoading(false)
        }
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
        return data
      } else {
        console.error('❌ Profile refresh error:', error)
        
        // Try to sync points if profile fetch fails
        try {
          const { data: syncData } = await supabase.rpc('sync_user_points', {
            target_user_id: supabaseUser.id
          })
          
          if (syncData && syncData.length > 0) {
            console.log('✅ Points synced during refresh:', syncData[0])
            
            // Try fetching profile again after sync
            const { data: syncedData, error: syncedError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', supabaseUser.id)
              .single()
              
            if (!syncedError && syncedData) {
              console.log('✅ User profile refreshed after sync:', syncedData)
              setUser(syncedData)
              return syncedData
            }
          }
        } catch (syncError) {
          console.error('❌ Error syncing points during refresh:', syncError)
        }
      }
    } catch (error) {
      console.error('❌ Error refreshing user:', error)
    }
    
    return null
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
      throw error
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