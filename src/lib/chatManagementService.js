/**
 * Chat Management Service
 * Handles chat_id tracking, message storage, and API integration
 * Stores all required data for seamless system integration
 */

import { supabase } from './supabase'

/**
 * Store chat metadata including chat_id from API
 */
export const storeChatMetadata = async (conversationId, chatId, endpoint, serviceType) => {
  try {
    const { data, error } = await supabase
      .from('chats')
      .update({
        metadata: {
          api_chat_id: chatId,
          endpoint: endpoint,
          service_type: serviceType,
          last_updated: new Date().toISOString()
        }
      })
      .eq('id', conversationId)
      .select()

    if (error) {
      console.error('Error storing chat metadata:', error)
      return null
    }

    return data?.[0]
  } catch (error) {
    console.error('Error in storeChatMetadata:', error)
    return null
  }
}

/**
 * Get chat_id for continuation requests
 */
export const getChatId = async (conversationId) => {
  try {
    const { data, error } = await supabase
      .from('chats')
      .select('metadata')
      .eq('id', conversationId)
      .single()

    if (error) {
      console.error('Error getting chat metadata:', error)
      return null
    }

    return data?.metadata?.api_chat_id || null
  } catch (error) {
    console.error('Error in getChatId:', error)
    return null
  }
}

/**
 * Save message with comprehensive metadata for database integration
 * Stores all data needed for seamless system operation
 */
export const saveMessageWithMetadata = async (
  conversationId,
  sender,
  content,
  apiResponse = {}
) => {
  try {
    const messageData = {
      chat_id: conversationId,
      sender: sender, // 'user' or 'ai'
      content: content,
      content_type: 'text',
      message_type: 'text',
      timestamp: new Date().toISOString(),
      
      // API Response Metadata
      metadata: {
        api_chat_id: apiResponse.chat_id,
        is_continuation: apiResponse.is_continuation || false,
        completeness_score: apiResponse.completeness_score,
        is_complete: apiResponse.is_complete,
        missing_elements: apiResponse.missing_elements,
        model: apiResponse.model,
        service: apiResponse.service,
        response_timestamp: apiResponse.timestamp,
        followup_questions: apiResponse.followup_questions || [],
        references: apiResponse.references || []
      },
      
      // Context Data for continuation tracking
      context_data: {
        conversation_flow: 'active',
        continuation_keywords: ['continue', 'next', 'more', 'go on', 'keep going'],
        last_api_response: apiResponse.chat_id ? true : false,
        endpoint: apiResponse.service ? `/api/${apiResponse.service}/generate` : null
      },
      
      // Performance Metrics
      token_count: apiResponse.tokens_used || 0,
      tokens_used: apiResponse.tokens_used || 0,
      processing_time_ms: apiResponse.processing_time_ms || 0,
      response_time_ms: apiResponse.response_time_ms || 0,
      
      // Model Information
      model_used: apiResponse.model || 'DalsiAI',
      service_type: apiResponse.service || 'general',
      
      // User Feedback Ready
      feedback_score: null,
      is_flagged: false,
      user_rating: null,
      feedback_text: null,
      
      // Edit Tracking
      is_edited: false,
      edited_at: null
    }

    const { data, error } = await supabase
      .from('messages')
      .insert([messageData])
      .select()

    if (error) {
      console.error('Error saving message:', error)
      return null
    }

    console.log('✅ Message saved with metadata:', {
      id: data?.[0]?.id,
      chat_id: data?.[0]?.chat_id,
      api_chat_id: data?.[0]?.metadata?.api_chat_id,
      is_continuation: data?.[0]?.metadata?.is_continuation
    })

    return data?.[0]
  } catch (error) {
    console.error('Error in saveMessageWithMetadata:', error)
    return null
  }
}

/**
 * Get conversation messages with metadata for context
 */
export const getConversationContext = async (conversationId, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', conversationId)
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error getting conversation context:', error)
      return []
    }

    return data?.reverse() || []
  } catch (error) {
    console.error('Error in getConversationContext:', error)
    return []
  }
}

/**
 * Update message with user feedback
 */
export const updateMessageFeedback = async (messageId, feedback) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .update({
        feedback_score: feedback.score, // -1, 0, or 1
        user_rating: feedback.rating, // 1-5
        feedback_text: feedback.text,
        is_flagged: feedback.flagged || false
      })
      .eq('id', messageId)
      .select()

    if (error) {
      console.error('Error updating feedback:', error)
      return null
    }

    return data?.[0]
  } catch (error) {
    console.error('Error in updateMessageFeedback:', error)
    return null
  }
}

/**
 * Get chat statistics for conversation
 */
export const getChatStatistics = async (conversationId) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('tokens_used, response_time_ms, service_type')
      .eq('chat_id', conversationId)

    if (error) {
      console.error('Error getting chat stats:', error)
      return null
    }

    const stats = {
      total_messages: data?.length || 0,
      total_tokens: data?.reduce((sum, msg) => sum + (msg.tokens_used || 0), 0) || 0,
      avg_response_time: data?.length > 0 
        ? data.reduce((sum, msg) => sum + (msg.response_time_ms || 0), 0) / data.length 
        : 0,
      services_used: [...new Set(data?.map(msg => msg.service_type) || [])]
    }

    return stats
  } catch (error) {
    console.error('Error in getChatStatistics:', error)
    return null
  }
}

/**
 * Build continuation request payload with chat_id
 */
export const buildContinuationPayload = (message, chatId, endpoint, gradeLevel = null) => {
  const payload = {
    message: message,
    mode: 'chat',
    chat_id: chatId,
    use_history: true
  }

  // Add grade_level for education endpoint
  if (endpoint === '/edu/generate' && gradeLevel) {
    payload.grade_level = gradeLevel
  }

  // Add city for WeatherSense endpoint
  if (endpoint === '/weathersense/generate') {
    // Extract city from message if possible
    const cityMatch = message.match(/in\s+(\w+)/i)
    if (cityMatch) {
      payload.city = cityMatch[1]
    }
  }

  return payload
}

/**
 * Check if message is a continuation keyword
 */
export const isContinuationKeyword = (message) => {
  const continuationKeywords = ['continue', 'next', 'more', 'go on', 'keep going', 'proceed', 'further']
  const lowerMessage = message.toLowerCase().trim()
  
  return continuationKeywords.some(keyword => 
    lowerMessage === keyword || lowerMessage.startsWith(keyword + ' ')
  )
}

/**
 * Extract chat_id from API response
 */
export const extractChatIdFromResponse = (response) => {
  if (response?.chat_id) {
    return response.chat_id
  }
  
  // Fallback: check in metadata
  if (response?.metadata?.api_chat_id) {
    return response.metadata.api_chat_id
  }
  
  return null
}

/**
 * Log API call with full metadata
 */
export const logApiCallWithMetadata = async (userId, endpoint, request, response) => {
  try {
    const { data, error } = await supabase
      .from('api_usage_logs')
      .insert([{
        user_id: userId,
        endpoint: endpoint,
        method: 'POST',
        status_code: response?.status || 200,
        request_metadata: {
          chat_id: request.chat_id,
          message_length: request.message?.length || 0,
          is_continuation: request.chat_id ? true : false
        },
        response_metadata: {
          api_chat_id: response?.chat_id,
          is_continuation: response?.is_continuation,
          model: response?.model,
          service: response?.service
        },
        tokens_used: response?.tokens_used || 0,
        cost_usd: response?.cost_usd || 0,
        created_at: new Date().toISOString()
      }])

    if (error) {
      console.error('Error logging API call:', error)
    }

    return data
  } catch (error) {
    console.error('Error in logApiCallWithMetadata:', error)
    return null
  }
}

export default {
  storeChatMetadata,
  getChatId,
  saveMessageWithMetadata,
  getConversationContext,
  updateMessageFeedback,
  getChatStatistics,
  buildContinuationPayload,
  isContinuationKeyword,
  extractChatIdFromResponse,
  logApiCallWithMetadata
}
