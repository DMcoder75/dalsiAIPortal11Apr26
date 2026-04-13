/**
 * Guest Migration Service
 * Handles migrating guest conversations to registered user account
 */

import logger from './logger'
import { getAllGuestConversations, clearAllGuestConversations } from './guestConversationService'
import { createConversation, saveMessage } from './conversationServiceEnhanced'

const API_BASE = '/proxy'

/**
 * Migrate all guest conversations to registered user
 * @param {string} userId - New registered user ID
 * @param {string} token - Auth token for API calls
 * @returns {Object} - Migration result with statistics
 */
export async function migrateGuestConversations(userId, token) {
  try {
    logger.info('🔄 [MIGRATION] Starting guest conversation migration for user:', userId)

    // Get all guest conversations from sessionStorage
    const guestConversations = getAllGuestConversations()
    logger.info('📋 [MIGRATION] Found guest conversations:', guestConversations.length)

    if (guestConversations.length === 0) {
      logger.info('ℹ️ [MIGRATION] No guest conversations to migrate')
      return {
        success: true,
        migratedCount: 0,
        totalMessages: 0,
        conversations: []
      }
    }

    const migratedConversations = []
    let totalMessages = 0
    let errorCount = 0

    // Migrate each conversation
    for (const guestConversation of guestConversations) {
      try {
        logger.info('🔄 [MIGRATION] Migrating conversation:', guestConversation.title)

        // Create new conversation for registered user
        const newConversation = await createConversation(
          userId,
          token,
          guestConversation.title
        )

        if (!newConversation) {
          logger.error('❌ [MIGRATION] Failed to create conversation:', guestConversation.title)
          errorCount++
          continue
        }

        logger.info('✅ [MIGRATION] Conversation created:', newConversation.id)

        // Migrate all messages from guest conversation
        const messages = guestConversation.messages || []
        logger.info('📨 [MIGRATION] Migrating messages:', messages.length)

        for (const message of messages) {
          try {
            await saveMessage(
              newConversation.id,
              userId,
              token,
              message.content,
              message.role
            )
            totalMessages++
          } catch (msgError) {
            logger.error('❌ [MIGRATION] Error migrating message:', msgError)
            errorCount++
          }
        }

        migratedConversations.push({
          id: newConversation.id,
          title: newConversation.title,
          messageCount: messages.length,
          createdAt: newConversation.created_at
        })

        logger.info('✅ [MIGRATION] Conversation migrated with messages:', messages.length)
      } catch (error) {
        logger.error('❌ [MIGRATION] Error migrating conversation:', error)
        errorCount++
      }
    }

    // Clear guest conversations from sessionStorage after successful migration
    clearAllGuestConversations()
    logger.info('🗑️ [MIGRATION] Guest conversations cleared from session')

    const result = {
      success: errorCount === 0,
      migratedCount: migratedConversations.length,
      totalMessages,
      errorCount,
      conversations: migratedConversations
    }

    logger.info('✅ [MIGRATION] Migration complete:', result)
    return result
  } catch (error) {
    logger.error('❌ [MIGRATION] Fatal error during migration:', error)
    return {
      success: false,
      migratedCount: 0,
      totalMessages: 0,
      errorCount: 1,
      error: error.message,
      conversations: []
    }
  }
}

/**
 * Get migration status - check if there are guest conversations to migrate
 * @returns {Object} - Migration status
 */
export function getMigrationStatus() {
  try {
    const guestConversations = getAllGuestConversations()
    const hasConversations = guestConversations.length > 0

    let totalMessages = 0
    for (const conversation of guestConversations) {
      totalMessages += (conversation.messages || []).length
    }

    return {
      hasPendingMigration: hasConversations,
      conversationCount: guestConversations.length,
      messageCount: totalMessages,
      conversations: guestConversations
    }
  } catch (error) {
    logger.error('❌ [MIGRATION] Error getting migration status:', error)
    return {
      hasPendingMigration: false,
      conversationCount: 0,
      messageCount: 0,
      conversations: []
    }
  }
}

/**
 * Show migration notification to user
 * @returns {string} - Notification message
 */
export function getMigrationMessage(migrationResult) {
  if (!migrationResult || migrationResult.migratedCount === 0) {
    return null
  }

  const conversationText = migrationResult.migratedCount === 1 ? 'conversation' : 'conversations'
  const messageText = migrationResult.totalMessages === 1 ? 'message' : 'messages'

  return `✅ Migrated ${migrationResult.migratedCount} ${conversationText} with ${migrationResult.totalMessages} ${messageText} from your previous session.`
}

export default {
  migrateGuestConversations,
  getMigrationStatus,
  getMigrationMessage
}
