import { supabase } from './supabase'

export async function createDemoUsers() {
  const demoUsers = [
    {
      email: 'employee@demo.com',
      password: 'password',
      userData: {
        full_name: 'Demo Employee',
        role: 'employee',
        department: 'Engineering'
      }
    },
    {
      email: 'manager@demo.com',
      password: 'password',
      userData: {
        full_name: 'Demo Manager',
        role: 'manager',
        department: 'Engineering'
      }
    },
    {
      email: 'admin@demo.com',
      password: 'password',
      userData: {
        full_name: 'Demo Admin',
        role: 'admin',
        department: 'Administration'
      }
    }
  ]

  for (const user of demoUsers) {
    try {
      const { error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: user.userData
        }
      })
      
      if (error && !error.message.includes('already registered')) {
        throw error
      }
    } catch (error) {
      console.error(`Error creating user ${user.email}:`, error)
    }
  }
}