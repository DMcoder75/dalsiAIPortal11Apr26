/**
 * Intelligent API Caller
 * Handles API calls with smart continuation detection
 * Only passes chat_id when it's actually a continuation request
 */

import * as dalsiAPI from './dalsiAPI'
import { isContinuationKeyword, extractChatIdFromResponse } from './chatManagementService'
import logger from './logger'

/**
 * Store chat_id per conversation
 * Map: conversationId -> chatId
 */
const conversationChatIds = new Map()

/**
 * Store last response per conversation for metadata
 * Map: conversationId -> lastResponse
 */
const conversationLastResponses = new Map()

/**
 * Determine if this is a continuation request
 * @param {string} message - User message
 * @param {string} conversationId - Conversation ID
 * @returns {boolean} True if this is a continuation
 */
const isContinuationRequest = (message, conversationId) => {
  // Check if message is a continuation keyword
  if (isContinuationKeyword(message)) {
    console.log('🔄 [INTELLIGENT_API] Continuation keyword detected in message:', message)
    return true
  }

  // Check if message contains continuation keywords in follow-up questions format
  const continuationPatterns = [
    /continue.*explaining/i,
    /tell me more/i,
    /go on/i,
    /keep going/i,
    /more details/i,
    /elaborate/i,
    /expand on/i,
    /further explain/i,
    /what about.*next/i,
    /and then/i,
    /what comes next/i,
    /proceed with/i,
    /carry on/i,
    /continue with/i,
    /next step/i,
    /further information/i
  ]

  const messageToCheck = message.toLowerCase()
  if (continuationPatterns.some(pattern => pattern.test(messageToCheck))) {
    console.log('🔄 [INTELLIGENT_API] Continuation pattern detected in follow-up question:', message)
    return true
  }

  // Check if we have a stored chat_id for this conversation
  const chatId = conversationChatIds.get(conversationId)
  if (!chatId) {
    console.log('📝 [INTELLIGENT_API] No stored chat_id, treating as new message')
    return false
  }

  // If chat_id exists and message is not a continuation keyword, it's still a new message
  console.log('📝 [INTELLIGENT_API] New message in existing conversation (not continuation)')
  return false
}

/**
 * Call AI API with intelligent continuation handling
 * @param {string} message - User message
 * @param {string} conversationId - Conversation ID
 * @param {string} modelId - Model ID (general, education, healthcare, etc.)
 * @param {string} serviceType - Service type (general, edu, healthcare, weathersense)
 * @param {Function} onToken - Callback for streaming tokens
 * @param {Function} onComplete - Callback when complete
 * @param {Function} onError - Callback for errors
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} API response with metadata
 */
export const callAIWithIntelligentContinuation = async (
  message,
  conversationId,
  modelId = 'general',
  serviceType = 'general',
  onToken,
  onComplete,
  onError,
  options = {}
) => {
  const {
    maxLength = 2048,
    abortSignal = null,
    gradeLevel = null,
    imageDataUrl = null
  } = options

  try {
    console.log('\n🚀 [INTELLIGENT_API] Starting API call')
    console.log('📋 [INTELLIGENT_API] Conversation:', conversationId)
    console.log('📋 [INTELLIGENT_API] Service Type:', serviceType)
    console.log('📋 [INTELLIGENT_API] Message:', message.substring(0, 50) + '...')

    // Determine if this is a continuation
    const isContinuation = isContinuationRequest(message, conversationId)
    let chatId = null

    if (isContinuation) {
      // Get stored chat_id for continuation
      chatId = conversationChatIds.get(conversationId)
      console.log('✅ [INTELLIGENT_API] Continuation detected')
      console.log('🔑 [INTELLIGENT_API] Using chat_id:', chatId)
    } else {
      // New message - don't pass chat_id
      console.log('✅ [INTELLIGENT_API] New message (no continuation)')
      console.log('🔑 [INTELLIGENT_API] chat_id will NOT be passed')
    }

    // Create wrapper for onToken to handle streaming
    const wrappedOnToken = (token) => {
      if (onToken) {
        onToken(token)
      }
    }

    // Create wrapper for onComplete to store metadata
    const wrappedOnComplete = (content, sources, fullResponse) => {
      // Extract and store chat_id for future continuation
      if (fullResponse?.chat_id) {
        conversationChatIds.set(conversationId, fullResponse.chat_id)
        conversationLastResponses.set(conversationId, fullResponse)
        
        console.log('💾 [INTELLIGENT_API] Stored chat_id for continuation')
        console.log('🔑 [INTELLIGENT_API] chat_id:', fullResponse.chat_id)
        console.log('🔄 [INTELLIGENT_API] is_continuation:', fullResponse.is_continuation)
      }

      // Call original onComplete
      if (onComplete) {
        onComplete(content, sources, fullResponse)
      }
    }

    // Create wrapper for onError
    const wrappedOnError = (error) => {
      console.error('❌ [INTELLIGENT_API] API call failed:', error)
      if (onError) {
        onError(error)
      }
    }

    // Call appropriate API based on streaming preference
    const response = await dalsiAPI.streamGenerateText(
      message,
      imageDataUrl,
      wrappedOnToken,
      wrappedOnComplete,
      wrappedOnError,
      modelId,
      maxLength,
      abortSignal,
      chatId, // Only pass if continuation
      serviceType,
      gradeLevel
    )

    return response
  } catch (error) {
    console.error('❌ [INTELLIGENT_API] Error in callAIWithIntelligentContinuation:', error)
    if (onError) {
      onError(error)
    }
    throw error
  }
}

/**
 * Get stored chat_id for a conversation
 * @param {string} conversationId - Conversation ID
 * @returns {string|null} chat_id or null
 */
export const getChatIdForConversation = (conversationId) => {
  return conversationChatIds.get(conversationId) || null
}

/**
 * Get last response metadata for a conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Object|null} Last response or null
 */
export const getLastResponseMetadata = (conversationId) => {
  return conversationLastResponses.get(conversationId) || null
}

/**
 * Clear chat_id for a conversation (e.g., when starting new chat)
 * @param {string} conversationId - Conversation ID
 */
export const clearConversationChatId = (conversationId) => {
  conversationChatIds.delete(conversationId)
  conversationLastResponses.delete(conversationId)
  console.log('🗑️ [INTELLIGENT_API] Cleared chat_id for conversation:', conversationId)
}

/**
 * Clear all stored chat_ids (e.g., on logout)
 */
export const clearAllChatIds = () => {
  conversationChatIds.clear()
  conversationLastResponses.clear()
  console.log('🗑️ [INTELLIGENT_API] Cleared all chat_ids')
}

/**
 * Get conversation statistics
 * @param {string} conversationId - Conversation ID
 * @returns {Object} Statistics
 */
export const getConversationStats = (conversationId) => {
  const chatId = conversationChatIds.get(conversationId)
  const lastResponse = conversationLastResponses.get(conversationId)

  return {
    conversationId,
    hasChatId: !!chatId,
    chatId,
    lastResponseModel: lastResponse?.model,
    lastResponseService: lastResponse?.service,
    lastResponseTime: lastResponse?.timestamp,
    isComplete: lastResponse?.is_complete,
    completenessScore: lastResponse?.completeness_score
  }
}

/**
 * Log API call details for debugging
 * @param {string} conversationId - Conversation ID
 */
export const logConversationDebug = (conversationId) => {
  const stats = getConversationStats(conversationId)
  console.log('\n📊 [INTELLIGENT_API] Conversation Debug Info:')
  console.log('  Conversation ID:', stats.conversationId)
  console.log('  Has Chat ID:', stats.hasChatId)
  console.log('  Chat ID:', stats.chatId)
  console.log('  Last Model:', stats.lastResponseModel)
  console.log('  Last Service:', stats.lastResponseService)
  console.log('  Last Response Time:', stats.lastResponseTime)
  console.log('  Is Complete:', stats.isComplete)
  console.log('  Completeness Score:', stats.completenessScore)
}

export default {
  callAIWithIntelligentContinuation,
  getChatIdForConversation,
  getLastResponseMetadata,
  clearConversationChatId,
  clearAllChatIds,
  getConversationStats,
  logConversationDebug,
  isContinuationRequest
}
