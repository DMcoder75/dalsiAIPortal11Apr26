import { supabase } from './supabase'
import bcrypt from 'bcryptjs'

/**
 * Hash password using bcrypt
 * More secure than SHA-256 with built-in salting
 * 
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Bcrypt hashed password
 */
export const hashPassword = async (password) => {
  try {
    // Generate salt with cost factor of 10 (good balance of security and performance)
    const salt = await bcrypt.genSalt(10)
    
    // Hash password with salt
    const hashedPassword = await bcrypt.hash(password, salt)
    
    console.log('✅ Password hashed with bcrypt')
    return hashedPassword
  } catch (error) {
    console.error('❌ Error hashing password:', error)
    throw new Error('Failed to hash password')
  }
}

/**
 * Verify password against bcrypt hash
 * 
 * @param {string} password - Plain text password to verify
 * @param {string} hashedPassword - Bcrypt hashed password from database
 * @returns {Promise<boolean>} - True if password matches
 */
export const verifyPassword = async (password, hashedPassword) => {
  try {
    // Compare password with hash
    const isMatch = await bcrypt.compare(password, hashedPassword)
    
    if (isMatch) {
      console.log('✅ Password verified successfully')
    } else {
      console.log('❌ Password verification failed')
    }
    
    return isMatch
  } catch (error) {
    console.error('❌ Error verifying password:', error)
    return false
  }
}

// Generate session token
export const generateSessionToken = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Create user session
export const createSession = async (userId) => {
  const sessionToken = generateSessionToken()
  
  const { data, error } = await supabase
    .from('user_sessions')
    .insert([{
      user_id: userId,
      session_token: sessionToken,
      ip_address: '0.0.0.0', // Would be actual IP in production
      user_agent: navigator.userAgent,
      device_info: {
        platform: navigator.platform,
        language: navigator.language
      },
      is_active: true
    }])
    .select()
    .single()

  if (error) throw error
  
  // Store session in localStorage
  localStorage.setItem('session_token', sessionToken)
  localStorage.setItem('user_id', userId)
  
  return data
}

// Get current session
export const getCurrentSession = async () => {
  const sessionToken = localStorage.getItem('session_token')
  const userId = localStorage.getItem('user_id')
  
  if (!sessionToken || !userId) return null
  
  // Check if session exists and is active
  const { data: sessionData, error: sessionError } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('session_token', sessionToken)
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()
  
  if (sessionError || !sessionData) return null
  
  // Fetch user data separately
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (userError || !userData) return null
  
  return {
    ...sessionData,
    users: userData
  }
}

// Logout
export const logout = async () => {
  const sessionToken = localStorage.getItem('session_token')
  
  if (sessionToken) {
    await supabase
      .from('user_sessions')
      .update({ 
        is_active: false,
        logout_time: new Date().toISOString()
      })
      .eq('session_token', sessionToken)
  }
  
  localStorage.removeItem('session_token')
  localStorage.removeItem('user_id')
}

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('session_token')
}
