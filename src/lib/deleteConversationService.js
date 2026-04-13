/**
 * Delete Conversation Service
 * Handles cascade deletion of conversations and all related messages
 */

import logger from './logger'
import { supabase } from './supabase'

const API_BASE = '/proxy'

/**
 * Delete conversation with cascade delete of all messages
 * First deletes all messages, then deletes the conversation
 */
export async function deleteConversationWithCascade(conversationId, token) {
  try {
    logger.info('🗑️ [DELETE_SERVICE] Starting cascade delete for conversation:', conversationId)

    // Step 1: Get all messages for this conversation
    logger.info('📋 [DELETE_SERVICE] Fetching all messages for conversation...')
    const messagesResponse = await fetch(
      `${API_BASE}/api/conversations/${conversationId}/messages`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    )

    if (!messagesResponse.ok) {
      logger.warn('⚠️ [DELETE_SERVICE] Could not fetch messages, proceeding with conversation delete')
    } else {
      const messagesData = await messagesResponse.json()
      const messages = messagesData.messages || []
      logger.info('📨 [DELETE_SERVICE] Found messages to delete:', messages.length)

      // Step 2: Delete each message
      if (messages.length > 0) {
        logger.info('🗑️ [DELETE_SERVICE] Deleting all messages...')
        for (const message of messages) {
          try {
            const deleteResponse = await fetch(
              `${API_BASE}/api/conversations/${conversationId}/messages/${message.id}`,
              {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                }
              }
            )

            if (deleteResponse.ok) {
              logger.debug('✅ [DELETE_SERVICE] Message deleted:', message.id)
            } else {
              logger.warn('⚠️ [DELETE_SERVICE] Failed to delete message:', message.id)
            }
          } catch (error) {
            logger.error('❌ [DELETE_SERVICE] Error deleting message:', error)
          }
        }
        logger.info('✅ [DELETE_SERVICE] All messages deleted')
      }
    }

    // Step 3: Delete the conversation
    logger.info('🗑️ [DELETE_SERVICE] Deleting conversation...')
    const conversationResponse = await fetch(
      `${API_BASE}/api/conversations/${conversationId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    )

    if (!conversationResponse.ok) {
      throw new Error(`Failed to delete conversation: ${conversationResponse.status}`)
    }

    logger.info('✅ [DELETE_SERVICE] Conversation deleted with cascade')
    return {
      success: true,
      conversationId,
      messagesDeleted: messagesData?.messages?.length || 0
    }
  } catch (error) {
    logger.error('❌ [DELETE_SERVICE] Error in cascade delete:', error)
    return {
      success: false,
      conversationId,
      error: error.message
    }
  }
}

/**
 * Delete single message from conversation
 */
export async function deleteMessage(conversationId, messageId, token) {
  try {
    logger.info('🗑️ [DELETE_SERVICE] Deleting message:', messageId)

    const response = await fetch(
      `${API_BASE}/api/conversations/${conversationId}/messages/${messageId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to delete message: ${response.status}`)
    }

    logger.info('✅ [DELETE_SERVICE] Message deleted')
    return true
  } catch (error) {
    logger.error('❌ [DELETE_SERVICE] Error deleting message:', error)
    return false
  }
}

/**
 * Delete all conversations for a user
 * Useful for account deletion or data cleanup
 */
export async function deleteAllUserConversations(userId, token) {
  try {
    logger.info('🗑️ [DELETE_SERVICE] Deleting all conversations for user:', userId)

    // Get all conversations
    const conversationsResponse = await fetch(
      `${API_BASE}/api/conversations?user_id=${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    )

    if (!conversationsResponse.ok) {
      throw new Error(`Failed to fetch conversations: ${conversationsResponse.status}`)
    }

    const conversationsData = await conversationsResponse.json()
    const conversations = conversationsData.conversations || []

    logger.info('📋 [DELETE_SERVICE] Found conversations to delete:', conversations.length)

    let deletedCount = 0
    let errorCount = 0

    // Delete each conversation with cascade
    for (const conversation of conversations) {
      const result = await deleteConversationWithCascade(conversation.id, token)
      if (result.success) {
        deletedCount++
      } else {
        errorCount++
      }
    }

    logger.info('✅ [DELETE_SERVICE] Deleted conversations:', deletedCount, 'Errors:', errorCount)
    return {
      success: errorCount === 0,
      deletedCount,
      errorCount,
      totalConversations: conversations.length
    }
  } catch (error) {
    logger.error('❌ [DELETE_SERVICE] Error deleting all conversations:', error)
    return {
      success: false,
      deletedCount: 0,
      errorCount: 0,
      error: error.message
    }
  }
}

export default {
  deleteConversationWithCascade,
  deleteMessage,
  deleteAllUserConversations
}
