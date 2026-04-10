// Dalsi AI API Integration Layer

// API endpoints for DalSi AI models
// New unified API endpoint for all AI models
const API_URL = 'https://api.neodalsi.com'

import { getJWT } from './jwtAuth'
import { cleanTextForDisplay, hasProblematicCharacters } from './textCleaner'

// API key for authentication (will be set from user's API key)
let currentApiKey = null

/**
 * Set the API key for authenticated requests
 */
export const setApiKey = (apiKey) => {
  currentApiKey = apiKey
}

/**
 * Get current API key
 */
export const getApiKey = () => {
  return currentApiKey
}

/**
 * Get authentication headers
 * Includes both JWT token (if available) and API key
 */
const getAuthHeaders = () => {
  const headers = {
    'Content-Type': 'application/json'
  }
  
  // Add JWT token if available
  const jwtToken = getJWT()
  if (jwtToken) {
    headers['Authorization'] = `Bearer ${jwtToken}`
  }
  
  // Add API key if available
  if (currentApiKey) {
    headers['X-API-Key'] = currentApiKey
  }
  
  return headers
}

/**
 * Get available models based on subscription
 */
export const getAvailableModels = (subscription) => {
  const baseModels = [
    {
      id: 'dalsi-ai',
      name: 'DalSi AI',
      description: 'Text-based AI model for healthcare, education, and general AI assistance',
      free: true
    },
    {
      id: 'dalsi-ai-health',
      name: 'DalSi AI - Healthcare',
      description: 'Specialized AI model for clinical, medical, and healthcare-related queries.',
      free: true
    },
    {
      id: 'dalsi-ai-weather',
      name: 'DalSi AI - Weather',
      description: 'Specialized AI model for weather, climate, and meteorological queries.',
      free: true
    }
  ]

  return baseModels
}

/**
 * Check if user has access to a model
 */
export const checkModelAccess = async (modelId, usageCount, subscription) => {
  // All models are accessible
  return { hasAccess: true }
}

/**
 * Get API endpoint for a model
 */
const getModelEndpoint = (modelId) => {
  // All models use the same API endpoint
  return `${API_URL}/v1/text/generate`
}

/**
 * Health check for API
 */
export const checkAPIHealth = async (modelId) => {
  try {
    const response = await fetch(`${API_URL}/v1/health`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    
    if (response.ok) {
      const data = await response.json()
      return {
        status: 'healthy',
        model_loaded: data.model_loaded || true,
        ...data
      }
    }
  } catch (error) {
    console.error(`Health check failed for ${modelId}:`, error)
  }
  
  return {
    status: 'unhealthy',
    model_loaded: false
  }
}

/**
 * Preprocess message before sending to AI
 * Builds conversation context from message history
 */
export const preprocessMessage = (message, messageHistory, modelId) => {
  if (!messageHistory || messageHistory.length === 0) {
    return message
  }

  // Determine system prompt based on modelId
  let systemPrompt = "You are a helpful and professional AI assistant. Your responses should be clear, concise, and accurate."
  if (modelId === 'dalsi-ai-health') {
    systemPrompt = "You are a specialized AI assistant for healthcare. Provide information based on clinical and medical knowledge. Always advise the user to consult a professional for medical advice."
  } else if (modelId === 'dalsi-ai-weather') {
    systemPrompt = "You are a specialized AI assistant for weather and climate. Provide accurate weather information and meteorological insights."
  }

  // Build conversation context from recent messages
  // Format: "User: message\nAI: response\nUser: message\n..."
  const contextLines = [`System: ${systemPrompt}`]
  
  for (const msg of messageHistory) {
    if (msg.sender === 'user') {
      contextLines.push(`User: ${msg.content}`)
    } else if (msg.sender === 'ai') {
      contextLines.push(`AI: ${msg.content}`)
    }
  }

  // Add the new user message
  contextLines.push(`User: ${message}`)
  
  // Add instruction for AI to continue the conversation
  contextLines.push('AI:')

  return contextLines.join('\n')
}

/**
 * Convert image file to data URL
 */
export const imageToDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Validate image file
 */
export const validateImageFile = (file) => {
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload PNG, JPEG, GIF, or WebP'
    }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File too large. Maximum size is 5MB'
    }
  }

  return { valid: true }
}

/**
 * Stream text generation from AI using Server-Sent Events
 */
export const streamGenerateText = async (
  message,
  imageDataUrl,
  onToken,
  onComplete,
  onError,
  modelId = 'dalsi-ai',
  maxLength = 500,
  abortSignal = null
) => {
  let reader = null
  
  try {
    // Use new NeoDalsi API for all requests
    const endpoint = getModelEndpoint(modelId)
    
    // Prepare request payload for new API
    const payload = {
      prompt: message,
      model: modelId,
      use_history: true,
      response_length: 'medium',
      max_tokens: maxLength || 2048
    }

    // Add image data if provided
    if (imageDataUrl) {
      payload.image_data_url = imageDataUrl
    }

    // Prepare headers with JWT and API key
    const headers = getAuthHeaders()

    // Make streaming request with abort signal
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload),
      signal: abortSignal
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API error: ${response.status} - ${errorText}`)
    }

    // Process Server-Sent Events stream
    reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8', { fatal: false, ignoreBOM: true })
    let fullResponse = ''
    let buffer = ''
    let hasCalledComplete = false

    while (true) {
      // Check if aborted
      if (abortSignal?.aborted) {
        console.log('🛑 Stream aborted by user')
        reader.cancel()
        return
      }

      const { done, value } = await reader.read()
      
      if (done) {
        // Final decode to handle any remaining bytes
        const finalChunk = decoder.decode(new Uint8Array(), { stream: false })
        if (finalChunk) {
          buffer += finalChunk
        }
        break
      }

      // Decode the chunk with stream: true to handle multi-byte UTF-8 characters
      const chunk = decoder.decode(value, { stream: true })
      buffer += chunk
      
      // Split by double newlines to process complete SSE messages
      const messages = buffer.split('\n\n')
      
      // Keep the last incomplete message in the buffer
      buffer = messages.pop() || ''

      for (const message of messages) {
        if (!message.trim()) continue
        
        // SSE format: "data: {json}"
        if (message.startsWith('data: ')) {
          const jsonData = message.slice(6).trim() // Remove "data: " prefix
          
          // Production-grade JSON parsing with fallback
          try {
            const data = JSON.parse(jsonData)
            
            // Handle "response" format (full response in one message)
            if (data.response) {
              console.log('📦 Received full response format')
              fullResponse = data.response
              // Clean UTF-8 replacement characters before displaying
              fullResponse = fullResponse.replace(/\ufffd/g, '')
              
              if (onToken) {
                onToken(fullResponse)
              }
            }
            
            // Handle "token" format (streaming tokens)
            if (data.token) {
              const token = data.token.replace(/\ufffd/g, '')
              fullResponse += token
              
              if (onToken) {
                onToken(token)
              }
            }
            
            // Handle "sources" in response
            if (data.sources) {
              console.log('📚 Sources received:', data.sources)
            }
          } catch (parseError) {
            console.warn('Failed to parse SSE message:', jsonData, parseError)
          }
        }
      }
    }

    // Process any remaining buffer content
    if (buffer.trim()) {
      if (buffer.startsWith('data: ')) {
        const jsonData = buffer.slice(6).trim()
        try {
          const data = JSON.parse(jsonData)
          if (data.response) {
            fullResponse = data.response.replace(/\ufffd/g, '')
          }
        } catch (e) {
          console.warn('Failed to parse final buffer:', buffer)
        }
      }
    }

    // Call onComplete with the full response
    if (onComplete && !hasCalledComplete) {
      hasCalledComplete = true
      
      // Format response with sources if available
      const aiResponse = {
        content: fullResponse,
        sources: [],
        model: modelId
      }
      
      onComplete(aiResponse.content, aiResponse.sources)
    }

  } catch (error) {
    console.error('❌ Stream generation error:', error)
    if (onError) {
      onError(error)
    }
  } finally {
    if (reader) {
      try {
        reader.cancel()
      } catch (e) {
        // Ignore cancellation errors
      }
    }
  }
}

/**
 * Generate text without streaming (for non-streaming requests)
 */
export const generateText = async (
  message,
  imageDataUrl,
  modelId = 'dalsi-ai',
  maxLength = 500
) => {
  try {
    const endpoint = getModelEndpoint(modelId)
    
    const payload = {
      prompt: message,
      model: modelId,
      use_history: true,
      response_length: 'medium',
      max_tokens: maxLength || 2048
    }

    if (imageDataUrl) {
      payload.image_data_url = imageDataUrl
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    
    return {
      content: data.response || data.text || '',
      sources: data.sources || [],
      model: modelId
    }
  } catch (error) {
    console.error('❌ Text generation error:', error)
    throw error
  }
}

/**
 * Format response from API
 */
const formatResponse = (response) => {
  if (typeof response === 'string') {
    return response
  }
  
  if (response.response) {
    return response.response
  }
  
  if (response.text) {
    return response.text
  }
  
  return JSON.stringify(response)
}
