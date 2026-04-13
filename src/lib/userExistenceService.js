/**
 * User Existence Service
 * Check if a user already exists in the system
 */

import logger from './logger'

const API_BASE = '/proxy'

/**
 * Check if user exists by email
 * @param {string} email - User email to check
 * @returns {Object} - { exists: boolean, user: userObject or null }
 */
export async function checkUserExists(email) {
  try {
    logger.info('🔍 [USER_CHECK] Checking if user exists:', email)

    const response = await fetch(
      `${API_BASE}/api/auth/check-user?email=${encodeURIComponent(email)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      logger.warn('⚠️ [USER_CHECK] Failed to check user existence:', response.status)
      return { exists: false, user: null }
    }

    const data = await response.json()
    logger.info('✅ [USER_CHECK] User check result:', data.exists ? 'EXISTS' : 'NEW USER')

    return {
      exists: data.exists || false,
      user: data.user || null
    }
  } catch (error) {
    logger.error('❌ [USER_CHECK] Error checking user existence:', error)
    return { exists: false, user: null }
  }
}

/**
 * Check if user exists by Google ID
 * @param {string} googleId - Google ID from OAuth
 * @returns {Object} - { exists: boolean, user: userObject or null }
 */
export async function checkUserExistsByGoogleId(googleId) {
  try {
    logger.info('🔍 [USER_CHECK] Checking if user exists by Google ID:', googleId)

    const response = await fetch(
      `${API_BASE}/api/auth/check-google-user?google_id=${encodeURIComponent(googleId)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      logger.warn('⚠️ [USER_CHECK] Failed to check Google user existence:', response.status)
      return { exists: false, user: null }
    }

    const data = await response.json()
    logger.info('✅ [USER_CHECK] Google user check result:', data.exists ? 'EXISTS' : 'NEW USER')

    return {
      exists: data.exists || false,
      user: data.user || null
    }
  } catch (error) {
    logger.error('❌ [USER_CHECK] Error checking Google user existence:', error)
    return { exists: false, user: null }
  }
}

export default {
  checkUserExists,
  checkUserExistsByGoogleId
}
