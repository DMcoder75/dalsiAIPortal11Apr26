/**
 * Authentication Service
 * Handles guest key generation, user login, JWT verification
 * Production-grade with error handling and logging
 */

import logger from './logger'

const API_BASE_URL = '/proxy'

/**
 * Generate unique session ID for browser fingerprinting
 */
const generateSessionId = () => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  return `${timestamp}-${random}`
}

/**
 * Get or create guest API key
 * @returns {Promise<Object>} { api_key, user_id, limits, subscription_tier }
 */
export const getGuestApiKey = async () => {
  try {
    logger.info('🔑 [AUTH_SERVICE] Fetching guest API key...')
    
    // Check if guest key already exists in localStorage
    const existingKey = localStorage.getItem('dalsi_guest_key')
    if (existingKey) {
      logger.info('✅ [AUTH_SERVICE] Using existing guest key from localStorage')
      return JSON.parse(existingKey)
    }

    // Generate session ID for browser fingerprinting
    const sessionId = generateSessionId()
    logger.debug('📍 [AUTH_SERVICE] Generated session ID:', sessionId)
    
    // Store session ID in localStorage BEFORE sending to backend
    // This ensures we have it for OAuth callback later (persists across page reloads)
    localStorage.setItem('dalsi_guest_session_id', sessionId)
    logger.debug('📑 [AUTH_SERVICE] Stored session ID in localStorage:', sessionId)

    // Call guest key endpoint
    const response = await fetch(`${API_BASE_URL}/api/auth/guest-key`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ session_id: sessionId })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `Guest key generation failed: ${response.status}`)
    }

    const data = await response.json()

    if (!data.success || !data.api_key) {
      throw new Error('Invalid response from guest key endpoint')
    }

    logger.info('✅ [AUTH_SERVICE] Guest key generated successfully')
    logger.debug('🔑 [AUTH_SERVICE] Guest user ID:', data.user_id)
    logger.debug('📊 [AUTH_SERVICE] Guest limits:', data.limits)

    // Store in localStorage (persists across page reloads)
    localStorage.setItem('dalsi_guest_key', JSON.stringify(data))
    localStorage.setItem('dalsi_guest_user_id', data.user_id)
    localStorage.setItem('dalsi_guest_limits', JSON.stringify(data.limits))

    return data

  } catch (error) {
    logger.error('❌ [AUTH_SERVICE] Error getting guest API key:', error)
    throw error
  }
}

/**
 * Verify JWT token validity
 * @param {string} token - JWT token to verify
 * @returns {Promise<Object>} { valid, user }
 */
export const verifyJWT = async (token) => {
  try {
    logger.info('🔍 [AUTH_SERVICE] Verifying JWT token...')

    const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      logger.warn('⚠️ [AUTH_SERVICE] JWT verification failed:', response.status)
      return { valid: false, user: null }
    }

    const data = await response.json()
    
    if (data.valid && data.user) {
      logger.info('✅ [AUTH_SERVICE] JWT token is valid')
      return { valid: true, user: data.user }
    }

    return { valid: false, user: null }

  } catch (error) {
    logger.error('❌ [AUTH_SERVICE] Error verifying JWT:', error)
    return { valid: false, user: null }
  }
}

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} { success, token, user }
 */
export const loginUser = async (email, password) => {
  try {
    logger.info('🔐 [AUTH_SERVICE] Logging in user:', email)

    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Login failed')
    }

    const data = await response.json()

    if (!data.success || !data.token || !data.user) {
      throw new Error('Invalid response from login endpoint')
    }

    logger.info('✅ [AUTH_SERVICE] User logged in successfully')
    logger.debug('👤 [AUTH_SERVICE] User:', data.user.email)
    logger.debug('🎯 [AUTH_SERVICE] Subscription tier:', data.user.subscription_tier)

    // Store JWT and user info
    localStorage.setItem('jwt_token', data.token)
    localStorage.setItem('user_info', JSON.stringify(data.user))
    
    // Clear guest key from session
    sessionStorage.removeItem('dalsi_guest_key')
    sessionStorage.removeItem('dalsi_guest_user_id')
    sessionStorage.removeItem('dalsi_guest_limits')

    logger.info('💾 [AUTH_SERVICE] JWT and user info stored in localStorage')

    return {
      success: true,
      token: data.token,
      user: data.user
    }

  } catch (error) {
    logger.error('❌ [AUTH_SERVICE] Login error:', error)
    throw error
  }
}

/**
 * Logout user
 */
export const logoutUser = () => {
  try {
    logger.info('🚪 [AUTH_SERVICE] Logging out user...')

    localStorage.removeItem('jwt_token')
    localStorage.removeItem('user_info')
    
    logger.info('✅ [AUTH_SERVICE] User logged out successfully')
  } catch (error) {
    logger.error('❌ [AUTH_SERVICE] Logout error:', error)
  }
}

/**
 * Get current authentication status
 * @returns {Promise<Object>} { isAuthenticated, user, apiKey, isGuest }
 */
export const getAuthStatus = async () => {
  try {
    // Check for JWT first
    const jwtToken = localStorage.getItem('jwt_token')
    
    if (jwtToken) {
      logger.info('🔍 [AUTH_SERVICE] Checking JWT token...')
      const { valid, user } = await verifyJWT(jwtToken)
      
      if (valid && user) {
        logger.info('✅ [AUTH_SERVICE] User is authenticated via JWT')
        return {
          isAuthenticated: true,
          user,
          apiKey: null,
          isGuest: false,
          authType: 'jwt'
        }
      } else {
        logger.warn('⚠️ [AUTH_SERVICE] JWT token is invalid, clearing...')
        localStorage.removeItem('jwt_token')
        localStorage.removeItem('user_info')
      }
    }

    // Check for guest API key
    const guestKey = sessionStorage.getItem('dalsi_guest_key')
    
    if (guestKey) {
      logger.info('✅ [AUTH_SERVICE] User is guest with API key')
      return {
        isAuthenticated: false,
        user: null,
        apiKey: JSON.parse(guestKey).api_key,
        isGuest: true,
        authType: 'guest'
      }
    }

    // No authentication found
    logger.info('ℹ️ [AUTH_SERVICE] No authentication found, user is unauthenticated guest')
    return {
      isAuthenticated: false,
      user: null,
      apiKey: null,
      isGuest: true,
      authType: 'none'
    }

  } catch (error) {
    logger.error('❌ [AUTH_SERVICE] Error getting auth status:', error)
    return {
      isAuthenticated: false,
      user: null,
      apiKey: null,
      isGuest: true,
      authType: 'error'
    }
  }
}

/**
 * Get API key for requests (JWT or guest key)
 * @returns {Promise<Object>} { type: 'bearer'|'api-key', value: string }
 */
export const getApiKeyForRequest = async () => {
  try {
    const jwtToken = localStorage.getItem('jwt_token')
    
    if (jwtToken) {
      logger.debug('🔑 [AUTH_SERVICE] Using JWT token for API request')
      return {
        type: 'bearer',
        value: jwtToken
      }
    }

    // Get or create guest key
    let guestKeyData = sessionStorage.getItem('dalsi_guest_key')
    
    if (!guestKeyData) {
      logger.info('🔑 [AUTH_SERVICE] Guest key not found, creating new one...')
      guestKeyData = await getGuestApiKey()
    } else {
      guestKeyData = JSON.parse(guestKeyData)
    }

    logger.debug('🔑 [AUTH_SERVICE] Using guest API key for request')
    return {
      type: 'api-key',
      value: guestKeyData.api_key
    }

  } catch (error) {
    logger.error('❌ [AUTH_SERVICE] Error getting API key for request:', error)
    throw error
  }
}

export default {
  getGuestApiKey,
  verifyJWT,
  loginUser,
  logoutUser,
  getAuthStatus,
  getApiKeyForRequest
}
