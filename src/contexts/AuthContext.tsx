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
        
        // Get initial session with improved error handling
        try {
          const { data: { session }, error } = await supabase.auth.getSession()

          if (error) {
            console.error('❌ Error getting session:', error)
            // Don't throw here, just log and continue with no session
            if (mounted) {
              setSupabaseUser(null)
              setUser(null)
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
        } catch (sessionError) {
          console.error('💥 Session retrieval failed:', sessionError)
          // Gracefully handle session timeout/failure
          if (mounted) {
            setSupabaseUser(null)
            setUser(null)
            setLoading(false)
          }
        }
      } catch (error) {
        console.error('💥 Error in initializeAuth:', error)
        if (mounted) {
          setSupabaseUser(null)
          setUser(null)
          setLoading(false)
        }
      }
    }

    const handleUserProfile = async (authUser: SupabaseUser) => {
      try {
        console.log('👤 Handling user profile for:', authUser.email)
        
        // Try to fetch the real profile with retries
        let profileData = null
        let attempts = 0
        const maxAttempts = 3

        while (!profileData && attempts < maxAttempts && mounted) {
          attempts++
          console.log(`📡 Profile fetch attempt ${attempts}/${maxAttempts}`)
          
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', authUser.id)
              .single()

            if (!error && data) {
              profileData = data
              console.log('✅ Profile fetched successfully:', data.email, 'Points:', data.points)
            } else if (error) {
              console.error('❌ Profile fetch error:', error)
              break // Don't retry on database errors
            }
          } catch (fetchError: any) {
            console.log(`⚠️ Profile fetch attempt ${attempts} failed:`, fetchError.message)
            if (attempts < maxAttempts) {
              // Wait before retrying
              await new Promise(resolve => setTimeout(resolve, 1000 * attempts))
            }
          }
        }

        if (mounted) {
          if (profileData) {
            // Use the real profile data
            setUser(profileData)
          } else {
            // Create a basic fallback but try to sync points
            console.log('⚠️ Using fallback profile, attempting point sync...')
            
            const fallbackUser: User = {
              id: authUser.id,
              email: authUser.email || '',
              full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
              role: (authUser.user_metadata?.role as 'employee' | 'manager' | 'admin') || 'employee',
              department: authUser.user_metadata?.department || 'General',
              points: 0, // Will be updated by sync
              level: 1,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }

            setUser(fallbackUser)

            // Try to sync points in the background
            try {
              console.log('🔄 Attempting background point sync...')
              const { data: syncResult } = await supabase.rpc('sync_user_points', {
                target_user_id: authUser.id
              })
              
              if (syncResult && syncResult.length > 0) {
                const syncedPoints = syncResult[0].new_points
                console.log('✅ Points synced successfully:', syncedPoints)
                
                setUser(prev => prev ? { ...prev, points: syncedPoints } : null)
              }
            } catch (syncError) {
              console.log('⚠️ Background point sync failed:', syncError)
            }
          }
          
          setLoading(false)
        }

      } catch (error) {
        console.error('💥 Error in handleUserProfile:', error)
        if (mounted) {
          // Set a basic fallback user to prevent auth loops
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
          setUser(fallbackUser)
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
      
      // First try to sync points
      try {
        console.log('🔄 Syncing points before refresh...')
        await supabase.rpc('sync_user_points', {
          target_user_id: supabaseUser.id
        })
      } catch (syncError) {
        console.log('⚠️ Point sync failed during refresh:', syncError)
      }
      
      // Then fetch the updated profile with retries
      let attempts = 0
      const maxAttempts = 3
      
      while (attempts < maxAttempts) {
        attempts++
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', supabaseUser.id)
            .single()

          if (!error && data) {
            console.log('✅ User profile refreshed:', data.email, 'Points:', data.points)
            setUser(data)
            return
          } else if (error) {
            console.error('❌ Profile refresh error:', error)
            break
          }
        } catch (fetchError: any) {
          console.log(`⚠️ Refresh attempt ${attempts} failed:`, fetchError.message)
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
        }
      }
      
      console.log('⚠️ Profile refresh failed after all attempts')
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