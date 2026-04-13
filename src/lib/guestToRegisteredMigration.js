/**
 * Guest to Registered User Migration Service
 * Handles migrating all guest data (conversations, messages) to registered user
 * Updates existing database records instead of creating new ones
 */

import logger from './logger'

const API_BASE = '/proxy'

/**
 * Migrate all guest data to registered user
 * This updates existing guest records in the database to use the new user's email/ID
 * 
 * @param {string} guestUserId - The guest user ID (from sessionStorage)
 * @param {string} registeredUserId - The new registered user ID
 * @param {string} registeredEmail - The new registered user email
 * @param {string} token - Auth token for API calls
 * @returns {Promise<Object>} - Migration result
 */
export async function migrateGuestDataToRegistered(
  guestUserId,
  registeredUserId,
  registeredEmail,
  token
) {
  try {
    logger.info('🔄 [GUEST_MIGRATION] Starting guest-to-registered migration')
    logger.info('👤 [GUEST_MIGRATION] Guest ID:', guestUserId)
    logger.info('👤 [GUEST_MIGRATION] Registered User ID:', registeredUserId)
    logger.info('📧 [GUEST_MIGRATION] Registered Email:', registeredEmail)

    if (!guestUserId || !registeredUserId || !registeredEmail) {
      throw new Error('Missing required migration parameters')
    }

    // Call backend API to migrate guest data
    const response = await fetch(`${API_BASE}/api/auth/migrate-guest-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        guest_user_id: guestUserId,
        registered_user_id: registeredUserId,
        registered_email: registeredEmail
      })
    })

    const data = await response.json()

    if (!response.ok) {
      logger.error('❌ [GUEST_MIGRATION] Migration failed:', data)
      throw new Error(data.error || 'Migration failed')
    }

    logger.info('✅ [GUEST_MIGRATION] Migration successful')
    logger.info('📊 [GUEST_MIGRATION] Result:', data)

    return {
      success: true,
      conversationsMigrated: data.conversations_migrated || 0,
      messagesMigrated: data.messages_migrated || 0,
      data: data
    }
  } catch (error) {
    logger.error('❌ [GUEST_MIGRATION] Error:', error)
    return {
      success: false,
      error: error.message,
      conversationsMigrated: 0,
      messagesMigrated: 0
    }
  }
}

/**
 * Get guest data before migration (for preview/confirmation)
 * 
 * @param {string} guestUserId - The guest user ID
 * @param {string} guestApiKey - The guest API key
 * @returns {Promise<Object>} - Guest data summary
 */
export async function getGuestDataSummary(guestUserId, guestApiKey) {
  try {
    logger.info('📋 [GUEST_MIGRATION] Fetching guest data summary')

    const response = await fetch(`${API_BASE}/api/guest/data-summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Guest-ID': guestUserId,
        'X-Guest-Key': guestApiKey
      }
    })

    const data = await response.json()

    if (!response.ok) {
      logger.warn('⚠️ [GUEST_MIGRATION] Could not fetch guest data summary:', data)
      return {
        success: false,
        conversationCount: 0,
        messageCount: 0
      }
    }

    logger.info('✅ [GUEST_MIGRATION] Guest data summary:', data)

    return {
      success: true,
      conversationCount: data.conversation_count || 0,
      messageCount: data.message_count || 0,
      data: data
    }
  } catch (error) {
    logger.error('❌ [GUEST_MIGRATION] Error fetching summary:', error)
    return {
      success: false,
      conversationCount: 0,
      messageCount: 0,
      error: error.message
    }
  }
}

/**
 * Clear guest session after successful migration
 */
export function clearGuestSessionAfterMigration() {
  try {
    sessionStorage.removeItem('dalsi_guest_user_id')
    sessionStorage.removeItem('dalsi_guest_key')
    sessionStorage.removeItem('dalsi_guest_limits')
    localStorage.removeItem('api_key')
    localStorage.removeItem('guest_user_id')
    
    logger.info('🗑️ [GUEST_MIGRATION] Guest session cleared')
  } catch (error) {
    logger.error('❌ [GUEST_MIGRATION] Error clearing guest session:', error)
  }
}

export default {
  migrateGuestDataToRegistered,
  getGuestDataSummary,
  clearGuestSessionAfterMigration
}
