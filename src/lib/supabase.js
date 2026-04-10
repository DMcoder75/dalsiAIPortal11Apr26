import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uhgypnlikwtfxnkixjzp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoZ3lwbmxpa3d0Znhua2l4anpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0NDM0NTAsImV4cCI6MjA3NTAxOTQ1MH0.AYgnsycrrRTwR56B7HJSgKGg6Hjf4G04ytFm2OGziO0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Function to set JWT token for authenticated requests
export const setSupabaseJWT = (token) => {
  if (token) {
    console.log('🔐 Setting Supabase JWT token for authenticated requests')
    try {
      // Create a new client with the token
      const authenticatedClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      })
      // Update the existing client's headers
      supabase.rest.headers['Authorization'] = `Bearer ${token}`
      console.log('✅ JWT token set successfully')
      return true
    } catch (error) {
      console.error('❌ Error setting Supabase JWT:', error)
      return false
    }
  }
}

// Clear JWT token
export const clearSupabaseJWT = () => {
  try {
    delete supabase.rest.headers['Authorization']
    console.log('✅ JWT token cleared')
  } catch (error) {
    console.error('❌ Error clearing JWT:', error)
  }
}
