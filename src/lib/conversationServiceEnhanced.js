/**
 * Enhanced Conversation Service
 * Handles all conversation operations including migration and cascade delete
 * Backend handles all database operations
 */

import logger from './logger'

import API_BASE from './apiConfig';

/**
 * Get all conversations for authenticated user
 */
export async function getUserConversations(userId, token) {
  try {
    logger.info('📋 [CONV_SERVICE] Fetching user conversations...')
    
    const response = await fetch(`${API_BASE}/api/conversations?user_id=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch conversations: ${response.status}`)
    }

    const data = await response.json()
    logger.info('✅ [CONV_SERVICE] Conversations fetched:', data.conversations?.length || 0)
    return data.conversations || []
  } catch (error) {
    logger.error('❌ [CONV_SERVICE] Error fetching conversations:', error)
    return []
  }
}

/**
 * Get messages for a specific conversation
 */
export async function getConversationMessages(conversationId, token) {
  try {
    logger.info('📨 [CONV_SERVICE] Fetching messages for conversation:', conversationId)
    
    const response = await fetch(`${API_BASE}/api/conversations/${conversationId}/messages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.status}`)
    }

    const data = await response.json()
    logger.info('✅ [CONV_SERVICE] Messages fetched:', data.messages?.length || 0)
    return data.messages || []
  } catch (error) {
    logger.error('❌ [CONV_SERVICE] Error fetching messages:', error)
    return []
  }
}

/**
 * Create new conversation with title
 */
export async function createConversation(userId, token, title = 'New Conversation') {
  try {
    logger.info('📝 [CONV_SERVICE] Creating conversation:', title)
    
    const response = await fetch(`${API_BASE}/api/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        user_id: userId,
        title: title
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to create conversation: ${response.status}`)
    }

    const data = await response.json()
    logger.info('✅ [CONV_SERVICE] Conversation created:', data.conversation?.id)
    return data.conversation
  } catch (error) {
    logger.error('❌ [CONV_SERVICE] Error creating conversation:', error)
    return null
  }
}

/**
 * Update conversation title
 */
export async function updateConversationTitle(conversationId, token, title) {
  try {
    logger.info('✏️ [CONV_SERVICE] Updating conversation title:', title)
    
    const response = await fetch(`${API_BASE}/api/conversations/${conversationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: title
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to update conversation: ${response.status}`)
    }

    const data = await response.json()
    logger.info('✅ [CONV_SERVICE] Conversation updated')
    return data.conversation
  } catch (error) {
    logger.error('❌ [CONV_SERVICE] Error updating conversation:', error)
    return null
  }
}

/**
 * Delete conversation with cascade delete of all messages
 */
export async function deleteConversation(conversationId, token) {
  try {
    logger.info('🗑️ [CONV_SERVICE] Deleting conversation:', conversationId)
    
    const response = await fetch(`${API_BASE}/api/conversations/${conversationId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to delete conversation: ${response.status}`)
    }

    logger.info('✅ [CONV_SERVICE] Conversation deleted with cascade')
    return true
  } catch (error) {
    logger.error('❌ [CONV_SERVICE] Error deleting conversation:', error)
    return false
  }
}

/**
 * Save message to conversation
 */
export async function saveMessage(conversationId, userId, token, message, role = 'user') {
  try {
    logger.info('💬 [CONV_SERVICE] Saving message to conversation:', conversationId)
    
    const response = await fetch(`${API_BASE}/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        user_id: userId,
        role: role,
        content: message,
        created_at: new Date().toISOString()
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to save message: ${response.status}`)
    }

    const data = await response.json()
    logger.info('✅ [CONV_SERVICE] Message saved')
    return data.message
  } catch (error) {
    logger.error('❌ [CONV_SERVICE] Error saving message:', error)
    return null
  }
}

/**
 * Migrate guest conversations to registered user
 */
export async function migrateGuestConversations(userId, token, guestConversations) {
  try {
    logger.info('🔄 [CONV_SERVICE] Migrating guest conversations:', guestConversations.length)
    
    const response = await fetch(`${API_BASE}/api/conversations/migrate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        user_id: userId,
        guest_conversations: guestConversations
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to migrate conversations: ${response.status}`)
    }

    const data = await response.json()
    logger.info('✅ [CONV_SERVICE] Conversations migrated:', data.migrated_count)
    return {
      success: true,
      migratedCount: data.migrated_count,
      conversations: data.conversations || []
    }
  } catch (error) {
    logger.error('❌ [CONV_SERVICE] Error migrating conversations:', error)
    return {
      success: false,
      migratedCount: 0,
      conversations: []
    }
  }
}

/**
 * Generate conversation title from first message
 */
export function generateConversationTitle(message) {
  try {
    // Remove special characters and extra whitespace
    let title = message
      .replace(/[*#_`\[\]()]/g, '') // Remove markdown characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()

    // Take first 50 characters
    if (title.length > 50) {
      title = title.substring(0, 50).trim()
      // Remove incomplete words
      const lastSpace = title.lastIndexOf(' ')
      if (lastSpace > 0) {
        title = title.substring(0, lastSpace)
      }
      title += '...'
    }

    return title || 'New Conversation'
  } catch (error) {
    logger.error('❌ [CONV_SERVICE] Error generating title:', error)
    return 'New Conversation'
  }
}

/**
 * Format conversation for display
 */
export function formatConversation(conversation) {
  return {
    id: conversation.id,
    title: conversation.title || 'Untitled',
    messageCount: conversation.message_count || 0,
    createdAt: conversation.created_at,
    updatedAt: conversation.updated_at,
    preview: conversation.preview || ''
  }
}

/**
 * Format message for display
 */
export function formatMessage(message) {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    timestamp: message.created_at,
    tokensUsed: message.tokens_used || 0,
    references: message.references || [],
    followups: message.followups || []
  }
}

export default {
  getUserConversations,
  getConversationMessages,
  createConversation,
  updateConversationTitle,
  deleteConversation,
  saveMessage,
  migrateGuestConversations,
  generateConversationTitle,
  formatConversation,
  formatMessage
}
