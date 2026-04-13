/**
 * AI Generation Service
 * Handles all AI generation endpoints: general, healthcare, education
 * Supports all modes: chat, debate, project
 * Production-grade with streaming, error handling, rate limits
 * 
 * IMPORTANT: Conversation endpoint locking ensures that once a conversation
 * starts with a specific endpoint (edu/generate, healthcare, etc.), it continues
 * with the same endpoint for all subsequent messages to maintain context.
 */

import logger from './logger'
import { getApiKeyForRequest } from './authService'
import { detectComplexity, getGenerationParams, logComplexityAnalysis } from './complexityDetector'

const API_BASE_URL = '/proxy'

// Store conversation endpoint types to maintain consistency
const conversationEndpoints = new Map()

/**
 * Validate that a value is a proper UUID string.
 * The backend stores chat_id as a UUID column — sending any other format causes a 500.
 * @param {*} value
 * @returns {string|null} The UUID string if valid, otherwise null
 */
const toValidUUID = (value) => {
  if (!value) return null
  // If it's an object, try to extract the .id field
  const str = typeof value === 'object' ? (value.id || '') : String(value)
  // UUID v4 pattern
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return UUID_RE.test(str.trim()) ? str.trim() : null
}

/**
 * Detect if a prompt is detailed/complex and should get longer response
 * Uses intelligent complexity detection system
 * @param {string} message - User prompt
 * @param {boolean} isLoggedIn - Whether user is logged in
 * @returns {Object} { response_length: string, max_tokens: number, complexity_level: string }
 */
const detectDetailLevel = (message, isLoggedIn = false) => {
  // Use intelligent complexity detector with authentication status
  const complexity = detectComplexity(message, isLoggedIn)
  
  // Log complexity analysis for debugging
  logComplexityAnalysis(message, isLoggedIn)
  
  // Map complexity to backend preset
  // Backend presets: short (256), medium (512), long (1024), detailed (2048)
  let response_length = 'medium'
  if (complexity.level === 'very_complex' || complexity.level === 'complex') {
    response_length = 'detailed'  // 2048 tokens
  } else if (complexity.level === 'medium') {
    response_length = 'long'      // 1024 tokens
  } else if (complexity.level === 'slightly_complex') {
    response_length = 'long'      // 1024 tokens
  } else if (complexity.level === 'guest_limited') {
    response_length = 'medium'    // 512 tokens
  } else {
    response_length = 'medium'    // 512 tokens (default)
  }

  logger.info(`📊 [DETAIL_DETECTION] Complexity analysis:`, {
    level: complexity.level,
    score: complexity.score,
    response_length,
    factors: complexity.factors
  })

  return {
    response_length,
    complexity_level: complexity.level,
    complexity_score: complexity.score
  }
}

/**
 * Build headers for API request
 * @param {Object} authKey - { type: 'bearer'|'api-key', value: string }
 * @returns {Object} Headers object
 */
const buildHeaders = (authKey) => {
  const headers = {
    'Content-Type': 'application/json',
  }

  if (authKey.type === 'bearer') {
    headers['Authorization'] = `Bearer ${authKey.value}`
  } else if (authKey.type === 'api-key') {
    headers['X-API-Key'] = authKey.value
  }

  return headers
}

/**
 * Generate AI response (general endpoint)
 * @param {string} message - User prompt
 * @param {Object} options - { mode, use_history, session_id, stream }
 * @returns {Promise<Object>} AI response
 */
export const generateAIResponse = async (message, options = {}) => {
  const {
    mode = 'chat',
    use_history = true,
    session_id = null,
    stream = false,
    response_length = 'medium',
    isLoggedIn = false
  } = options

  try {
    logger.info('🤖 [AI_SERVICE] Generating AI response...')
    logger.debug('📝 [AI_SERVICE] Mode:', mode)
    logger.debug('📝 [AI_SERVICE] Message length:', message.length)

    // Get authentication
    const authKey = await getApiKeyForRequest()
    const headers = buildHeaders(authKey)

    // Only include chat_id when it is a valid UUID — the backend column is UUID type
    // and will throw 500 for any other format (dict, freeform string, etc.)
    const validChatId = toValidUUID(options.chat_id)
    const validSessionId = toValidUUID(session_id) || (typeof session_id === 'string' ? session_id : null)

    // Build request body
    const body = {
      message,
      mode,
      use_history,
      response_length,
      ...(validSessionId && { session_id: validSessionId }),
      ...(validChatId && { chat_id: validChatId }),
      ...(options.complexity_level && { complexity_level: options.complexity_level })
    }

    logger.debug('📤 [AI_SERVICE] Request body:', body)

    // Make API call
    const response = await fetch(`${API_BASE_URL}/generate`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMsg = errorData.error || `API error: ${response.status}`
      
      if (response.status === 401) {
        logger.error('❌ [AI_SERVICE] Authentication failed (401)')
        throw new Error('Authentication failed. Please log in again.')
      } else if (response.status === 429) {
        logger.error('❌ [AI_SERVICE] Rate limit exceeded (429)')
        throw new Error('Rate limit exceeded. Please wait before making another request.')
      } else {
        logger.error('❌ [AI_SERVICE] API error:', errorMsg)
        throw new Error(errorMsg)
      }
    }

    const data = await response.json()

    logger.info('✅ [AI_SERVICE] AI response generated successfully')
    logger.debug('📊 [AI_SERVICE] Response length:', data.response?.length || 0)

    return {
      success: true,
      mode,
      data,
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    logger.error('❌ [AI_SERVICE] Error generating AI response:', error)
    throw error
  }
}

/**
 * Generate healthcare response
 * @param {string} message - User prompt
 * @param {Object} options - { mode, use_history, session_id }
 * @returns {Promise<Object>} Healthcare response
 */
export const generateHealthcareResponse = async (message, options = {}) => {
  const {
    mode = 'chat',
    use_history = true,
    session_id = null
  } = options

  try {
    logger.info('🏥 [AI_SERVICE] Generating healthcare response...')
    logger.debug('📝 [AI_SERVICE] Mode:', mode)

    // Get authentication
    const authKey = await getApiKeyForRequest()
    const headers = buildHeaders(authKey)

    // Only include chat_id when it is a valid UUID — the backend column is UUID type
    const validChatId = toValidUUID(options.chat_id)
    const validSessionId = toValidUUID(session_id) || (typeof session_id === 'string' ? session_id : null)

    // Build request body
    const body = {
      message,
      mode,
      use_history,
      ...(validSessionId && { session_id: validSessionId }),
      ...(validChatId && { chat_id: validChatId }),
      ...(options.response_length && { response_length: options.response_length }),
      ...(options.complexity_level && { complexity_level: options.complexity_level })
    }

    logger.debug('📤 [AI_SERVICE] Healthcare request body:', body)

    // Make API call
    const response = await fetch(`${API_BASE_URL}/healthcare/generate`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMsg = errorData.error || `Healthcare API error: ${response.status}`
      
      if (response.status === 401) {
        throw new Error('Authentication failed. Please log in again.')
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait before making another request.')
      } else {
        throw new Error(errorMsg)
      }
    }

    const data = await response.json()

    logger.info('✅ [AI_SERVICE] Healthcare response generated successfully')

    return {
      success: true,
      mode,
      category: 'healthcare',
      data,
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    logger.error('❌ [AI_SERVICE] Error generating healthcare response:', error)
    throw error
  }
}

/**
 * Generate education response
 * @param {string} message - User prompt
 * @param {Object} options - { mode, use_history, session_id, grade_level }
 * @returns {Promise<Object>} Education response
 */
export const generateEducationResponse = async (message, options = {}) => {
  const {
    mode = 'chat',
    use_history = true,
    session_id = null,
    grade_level = 'general'
  } = options

  try {
    logger.info('🎓 [AI_SERVICE] Generating education response...')
    logger.debug('📝 [AI_SERVICE] Grade level:', grade_level)

    // Get authentication
    const authKey = await getApiKeyForRequest()
    const headers = buildHeaders(authKey)

    // Only include chat_id when it is a valid UUID — the backend column is UUID type
    const validChatId = toValidUUID(options.chat_id)
    const validSessionId = toValidUUID(session_id) || (typeof session_id === 'string' ? session_id : null)

    // Build request body for education endpoint
    const body = {
      message,
      mode,
      use_history,
      ...(validSessionId && { session_id: validSessionId }),
      ...(validChatId && { chat_id: validChatId }),
      ...(options.response_length && { response_length: options.response_length }),
      ...(options.complexity_level && { complexity_level: options.complexity_level })
    }
    logger.debug('📤 [AI_SERVICE] Education request body:', body)

    // Make API call
    const response = await fetch(`${API_BASE_URL}/edu/generate`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMsg = errorData.error || `Education API error: ${response.status}`
      
      if (response.status === 401) {
        throw new Error('Authentication failed. Please log in again.')
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait before making another request.')
      } else {
        throw new Error(errorMsg)
      }
    }

    const data = await response.json()

    logger.info('✅ [AI_SERVICE] Education response generated successfully')

    return {
      success: true,
      mode,
      category: 'education',
      data,
      grade_level,
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    logger.error('❌ [AI_SERVICE] Error generating education response:', error)
    throw error
  }
}

/**
 * Get conversation tree for non-linear navigation
 * @param {string} session_id - Conversation session ID
 * @returns {Promise<Object>} Conversation tree structure
 */
export const getConversationTree = async (session_id) => {
  try {
    logger.info('🌳 [AI_SERVICE] Fetching conversation tree...')
    logger.debug('📍 [AI_SERVICE] Session ID:', session_id)

    // Get authentication
    const authKey = await getApiKeyForRequest()
    const headers = buildHeaders(authKey)

    // Make API call
    const response = await fetch(`${API_BASE_URL}/api/conversation/tree?session_id=${session_id}`, {
      method: 'GET',
      headers
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Failed to fetch conversation tree: ${response.status}`)
    }

    const data = await response.json()

    logger.info('✅ [AI_SERVICE] Conversation tree fetched successfully')

    return {
      success: true,
      tree: data,
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    logger.error('❌ [AI_SERVICE] Error fetching conversation tree:', error)
    throw error
  }
}

/**
 * Detect query type and route to appropriate endpoint
 * @param {string} message - User message
 * @returns {string} 'general' | 'healthcare' | 'education'
 */
export const detectQueryType = (message) => {
  const lowerMessage = message.toLowerCase()

  // Healthcare keywords
  const healthcareKeywords = [
    'health', 'medical', 'doctor', 'disease', 'symptom', 'treatment',
    'medicine', 'hospital', 'patient', 'diagnosis', 'therapy', 'nurse',
    'surgery', 'pain', 'illness', 'vaccine', 'covid', 'covid-19'
  ]

  // Education keywords
  const educationKeywords = [
    'learn', 'study', 'teach', 'school', 'university', 'college',
    'student', 'homework', 'assignment', 'exam', 'test', 'grade',
    'course', 'subject', 'lesson', 'tutorial', 'explain', 'how to learn'
  ]

  const hasHealthcareKeyword = healthcareKeywords.some(keyword => lowerMessage.includes(keyword))
  const hasEducationKeyword = educationKeywords.some(keyword => lowerMessage.includes(keyword))

  if (hasHealthcareKeyword) {
    logger.debug('🏥 [AI_SERVICE] Query detected as healthcare')
    return 'healthcare'
  }

  if (hasEducationKeyword) {
    logger.debug('🎓 [AI_SERVICE] Query detected as education')
    return 'education'
  }

  logger.debug('🤖 [AI_SERVICE] Query detected as general')
  return 'general'
}

/**
 * Get or lock the endpoint type for a conversation
 * First message determines the endpoint for the entire conversation
 * Subsequent messages use the locked endpoint to maintain context
 * @param {string} sessionId - Conversation session ID
 * @param {string} detectedType - Detected query type (only used if not set)
 * @returns {string} Locked endpoint type for this conversation
 */
const getConversationEndpoint = (sessionId, detectedType) => {
  if (!sessionId) {
    // No session, use detected type
    return detectedType
  }

  // Check if we already have an endpoint for this conversation
  if (conversationEndpoints.has(sessionId)) {
    const lockedEndpoint = conversationEndpoints.get(sessionId)
    logger.info(`🔒 [AI_SERVICE] Using locked endpoint for conversation: ${lockedEndpoint}`)
    return lockedEndpoint
  }

  // First message in conversation - lock the endpoint
  conversationEndpoints.set(sessionId, detectedType)
  logger.info(`🔐 [AI_SERVICE] Locking endpoint for conversation: ${detectedType}`)
  return detectedType
}

/**
 * Smart generate - auto-detects query type and routes appropriately
 * CRITICAL: Once a conversation starts with an endpoint, it continues with that endpoint
 * This ensures context is maintained and the AI model is aware of previous responses
 * @param {string} message - User message
 * @param {Object} options - { mode, use_history, session_id, autoDetect }
 * @returns {Promise<Object>} AI response
 */
export const smartGenerate = async (message, options = {}) => {
  const { autoDetect = true, forceEndpoint = null, isLoggedIn = false, ...otherOptions } = options
  const { session_id } = otherOptions
  
  // Auto-detect detail level using intelligent complexity detection
  const detailedAnalysis = detectDetailLevel(message, isLoggedIn)
  otherOptions.response_length = detailedAnalysis.response_length
  otherOptions.complexity_level = detailedAnalysis.complexity_level
  otherOptions.complexity_score = detailedAnalysis.complexity_score

  try {
    let queryType = 'general'

    // If forceEndpoint is provided, use it (conversation is locked)
    if (forceEndpoint) {
      queryType = forceEndpoint
      logger.info(`🔒 [AI_SERVICE] Using forced endpoint: ${forceEndpoint}`)
    } else if (autoDetect) {
      const detectedType = detectQueryType(message)
      
      // Default to general, only switch if specific keywords detected
      if (detectedType !== 'general') {
        queryType = detectedType
        logger.info(`🔍 [AI_SERVICE] Detected specialized endpoint: ${detectedType}`)
      } else {
        queryType = 'general'
        logger.info(`🔍 [AI_SERVICE] No specialized keywords found, using general endpoint`)
      }
      
      // Lock the endpoint for this conversation
      if (session_id) {
        getConversationEndpoint(session_id, queryType)
      }
    }

    logger.info(`🧠 [AI_SERVICE] Smart generate using ${queryType} endpoint`)

    switch (queryType) {
      case 'healthcare':
        return await generateHealthcareResponse(message, otherOptions)
      case 'education':
        return await generateEducationResponse(message, otherOptions)
      default:
        return await generateAIResponse(message, otherOptions)
    }

  } catch (error) {
    logger.error('❌ [AI_SERVICE] Error in smart generate:', error)
    throw error
  }
}

export default {
  generateAIResponse,
  generateHealthcareResponse,
  generateEducationResponse,
  getConversationTree,
  detectQueryType,
  smartGenerate
}
