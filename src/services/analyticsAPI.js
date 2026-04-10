// Analytics and Queue API Integration Layer
// Base URL and API Key are assumed to be handled securely, similar to frictionAPI.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.neodalsi.com'
const API_KEY = 'demo_key_UID1' // Placeholder from the integration guide

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY,
})

// --- Priority Queue APIs ---

/**
 * Get real-time queue status for display to users.
 * Endpoint: GET /api/queue/status
 * @returns {Promise<object>}
 */
export async function getQueueStatus() {
  const url = `${API_BASE_URL}/api/queue/status`
  try {
    const response = await fetch(url, { headers: getHeaders() })
    if (!response.ok) {
      console.error('Queue Status API failed with status:', response.status)
      return null
    }
    return await response.json()
  } catch (error) {
    console.error('Error calling Queue Status API:', error)
    return null
  }
}

// --- Conversion Analytics APIs ---

/**
 * Track when a guest user converts to a paid user.
 * Endpoint: POST /api/analytics/conversion/track
 * @param {string} guestUserId - The ID of the guest user.
 * @param {string} convertedUserId - The ID of the newly converted user.
 * @param {object} metadata - Additional conversion details (plan, price, etc.).
 * @returns {Promise<{success: boolean, conversion_id: string}>}
 */
export async function trackConversion(guestUserId, convertedUserId, metadata = {}) {
  const url = `${API_BASE_URL}/api/analytics/conversion/track`
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        guest_user_id: guestUserId,
        converted_user_id: convertedUserId,
        // Assuming referral_code and friction_tier_at_conversion are handled elsewhere or not critical for this integration
        metadata: metadata,
      }),
    })

    const data = await response.json()
    return { success: response.ok, conversion_id: data.conversion_id || null }
  } catch (error) {
    console.error('Error calling Track Conversion API:', error)
    return { success: false, conversion_id: null }
  }
}

/**
 * Track user progression through the conversion funnel.
 * Endpoint: POST /api/analytics/funnel/track
 * @param {string} userId - The user's ID (guest or logged-in).
 * @param {string} stepName - The name of the funnel step (e.g., 'first_message', 'subscription_purchased').
 * @param {object} metadata - Additional step details.
 * @returns {Promise<{success: boolean, step_id: string}>}
 */
export async function trackFunnelStep(userId, stepName, metadata = {}) {
  const url = `${API_BASE_URL}/api/analytics/funnel/track`
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        user_id: userId,
        step_name: stepName,
        metadata: metadata,
      }),
    })

    const data = await response.json()
    return { success: response.ok, step_id: data.step_id || null }
  } catch (error) {
    console.error('Error calling Track Funnel Step API:', error)
    return { success: false, step_id: null }
  }
}
