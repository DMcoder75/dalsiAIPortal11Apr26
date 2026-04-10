/**
 * Chat API Service
 * Handles all API calls for chat/conversation management
 * Includes caching for conversations and messages
 */

const API_BASE_URL = 'https://api.neodalsi.com'

// Cache storage
const cache = {
  conversations: {},
  messages: {}
}

/**
 * Get all conversations for authenticated user
 * @param {string} token - JWT token
 * @returns {Promise<Array>} List of conversations
 */
export const fetchConversations = async (token) => {
  try {
    console.log('[CHAT_API] Fetching conversations with token:', token ? 'present' : 'missing')
    
    const response = await fetch(`${API_BASE_URL}/api/chats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    console.log('[CHAT_API] Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[CHAT_API] Error response:', errorText)
      throw new Error(`Failed to fetch conversations: ${response.status}`)
    }

    const data = await response.json()
    console.log('[CHAT_API] Response data:', data)
    
    // Cache the conversations - API returns { chats: [...], count, success }
    if (data.success && data.chats) {
      cache.conversations = data.chats
      console.log('[CHAT_API] Conversations cached:', data.chats.length)
      return data.chats
    }

    return []
  } catch (error) {
    console.error('[CHAT_API] Error fetching conversations:', error)
    // Return cached conversations if available
    return Object.values(cache.conversations)
  }
}

/**
 * Get messages for a specific conversation
 * @param {string} chatId - Chat/Conversation ID
 * @param {string} token - JWT token
 * @returns {Promise<Array>} List of messages
 */
export const fetchConversationMessages = async (chatId, token) => {
  try {
    // Check cache first
    if (cache.messages[chatId]) {
      console.log('[CHAT_API] Messages retrieved from cache:', chatId)
      return cache.messages[chatId]
    }

    const response = await fetch(`${API_BASE_URL}/api/chats/${chatId}/messages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    console.log('[CHAT_API] Messages response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[CHAT_API] Messages error response:', errorText)
      throw new Error(`Failed to fetch messages: ${response.status}`)
    }

    const data = await response.json()
    console.log('[CHAT_API] Messages response data:', data)
    
    // Cache the messages - API returns { messages: [...], count, chat_id, success }
    if (data.success && data.messages) {
      cache.messages[chatId] = data.messages
      console.log('[CHAT_API] Messages cached:', chatId, data.messages.length)
      return data.messages
    }

    return []
  } catch (error) {
    console.error('[CHAT_API] Error fetching messages:', error)
    // Return cached messages if available
    return cache.messages[chatId] || []
  }
}

/**
 * Delete a conversation
 * @param {string} chatId - Chat/Conversation ID
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Deletion result
 */
export const deleteConversationAPI = async (chatId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chats/${chatId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to delete conversation: ${response.status}`)
    }

    const data = await response.json()
    
    // Remove from cache
    if (cache.messages[chatId]) {
      delete cache.messages[chatId]
    }
    if (cache.conversations[chatId]) {
      delete cache.conversations[chatId]
    }

    console.log('[CHAT_API] Conversation deleted:', chatId)
    return data
  } catch (error) {
    console.error('[CHAT_API] Error deleting conversation:', error)
    throw error
  }
}

/**
 * Invalidate cache for conversations
 */
export const invalidateConversationsCache = () => {
  cache.conversations = {}
  console.log('[CHAT_API] Conversations cache cleared')
}

/**
 * Invalidate cache for specific conversation messages
 * @param {string} chatId - Chat ID (optional, if not provided clears all)
 */
export const invalidateMessagesCache = (chatId = null) => {
  if (chatId) {
    delete cache.messages[chatId]
    console.log('[CHAT_API] Messages cache cleared for:', chatId)
  } else {
    cache.messages = {}
    console.log('[CHAT_API] All messages cache cleared')
  }
}

/**
 * Get cached conversations
 * @returns {Array} Cached conversations
 */
export const getCachedConversations = () => {
  return Object.values(cache.conversations)
}

/**
 * Get cached messages for a conversation
 * @param {string} chatId - Chat ID
 * @returns {Array} Cached messages
 */
export const getCachedMessages = (chatId) => {
  return cache.messages[chatId] || []
}
