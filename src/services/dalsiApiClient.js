/**
 * DalSi API Client Service
 * Handles all API calls to the new DalSiAI API endpoint
 * Base URL: /proxy
 */

const API_BASE_URL = (import.meta.env.DEV ? '/proxy' : 'https://us-central1-innate-temple-337717.cloudfunctions.net/apiProxy');

class DalSiApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.timeout = 30000; // 30 seconds
  }

  /**
   * Set API key for authenticated requests
   * @param {string} apiKey - The API key to use for requests
   */
  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  /**
   * Make an authenticated API request
   * @param {string} endpoint - API endpoint path (e.g., '/dalsiai/generate')
   * @param {object} data - Request payload
   * @param {object} options - Additional options (method, headers, etc.)
   * @returns {Promise<object>} API response
   */
  async request(endpoint, data = {}, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...(this.apiKey && { 'X-API-Key': this.apiKey }),
      ...options.headers,
    };

    const config = {
      method: options.method || 'POST',
      headers,
      body: JSON.stringify(data),
      timeout: this.timeout,
      ...options,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle different response status codes
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw this.handleErrorResponse(response.status, errorData);
      }

      const responseData = await response.json();
      return responseData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Chat endpoint - Send message and get AI response
   * @param {string} message - User message
   * @param {object} options - Additional options (session_id, use_history, response_length, etc.)
   * @returns {Promise<object>} Chat response with AI reply
   */
  async chat(message, options = {}) {
    const payload = {
      prompt: message,
      use_history: options.use_history !== false, // Default true
      session_id: options.session_id || null,
      response_length: options.response_length || 'medium',
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 2048,
      ...options,
    };

    return this.request('/dalsiai/generate', payload);
  }

  /**
   * Healthcare AI endpoint
   * @param {string} message - User query
   * @param {object} options - Additional options
   * @returns {Promise<object>} Healthcare AI response
   */
  async healthcareChat(message, options = {}) {
    const payload = {
      prompt: message,
      use_history: options.use_history !== false,
      session_id: options.session_id || null,
      ...options,
    };

    return this.request('/dalsiai/healthcare/generate', payload);
  }

  /**
   * Education AI endpoint
   * @param {string} message - User query
   * @param {object} options - Additional options
   * @returns {Promise<object>} Education AI response
   */
  async educationChat(message, options = {}) {
    const payload = {
      prompt: message,
      use_history: options.use_history !== false,
      session_id: options.session_id || null,
      ...options,
    };

    return this.request('/dalsiai/edu/generate', payload);
  }

  /**
   * Code generation endpoint
   * @param {string} message - Code generation request
   * @param {object} options - Additional options
   * @returns {Promise<object>} Generated code response
   */
  async codeGeneration(message, options = {}) {
    const payload = {
      prompt: message,
      language: options.language || 'javascript',
      ...options,
    };

    return this.request('/dalsiai/supercoder/generate', payload);
  }

  /**
   * Weather/Sense endpoint
   * @param {string} message - Weather query
   * @param {object} options - Additional options
   * @returns {Promise<object>} Weather response
   */
  async weatherChat(message, options = {}) {
    const payload = {
      prompt: message,
      ...options,
    };

    return this.request('/dalsiai/weathersense/generate', payload);
  }

  /**
   * Health check endpoint
   * @returns {Promise<object>} API health status
   */
  async healthCheck() {
    return this.request('/dalsiai/health', {}, { method: 'GET' });
  }

  /**
   * Handle API error responses
   * @param {number} statusCode - HTTP status code
   * @param {object} errorData - Error response data
   * @throws {Error} Formatted error
   */
  handleErrorResponse(statusCode, errorData) {
    const errorMessage = errorData.error || errorData.message || 'Unknown error';
    const errorCode = errorData.code || 'UNKNOWN_ERROR';

    switch (statusCode) {
      case 401:
        return new Error(
          'API key required or invalid. Please check your API key and try again.'
        );
      case 403:
        return new Error(
          'Invalid API key. Please regenerate your API key from the dashboard.'
        );
      case 429:
        return new Error(
          'Rate limit exceeded. Please wait a moment and try again.'
        );
      case 500:
        return new Error(
          'Server error. Please try again later or contact support.'
        );
      default:
        return new Error(`API Error: ${errorMessage} (${errorCode})`);
    }
  }

  /**
   * Handle general errors
   * @param {Error} error - Error object
   * @throws {Error} Formatted error
   */
  handleError(error) {
    if (error.name === 'AbortError') {
      return new Error('Request timeout. Please try again.');
    }

    if (error instanceof TypeError) {
      return new Error('Network error. Please check your connection.');
    }

    return error;
  }
}

// Export singleton instance
export default new DalSiApiClient();
