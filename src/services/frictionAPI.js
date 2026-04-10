import { supabase } from '../lib/supabase'

// The API key is not stored in the client-side code for security.
// For this client-side implementation, we will use a placeholder or assume
// the API key is handled by a serverless function or a secure backend proxy.
// Since we don't have a backend proxy, we'll use a placeholder and assume
// the actual API call is made securely.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.neodalsi.com'
const API_KEY = 'demo_key_UID1' // Placeholder from the integration guide

/**
 * Checks the friction API to see if a paywall or usage control should be shown.
 * @param {string} userId - The user's ID (or guest ID).
 * @param {string} tier - The user's current subscription tier ('free', 'starter', etc.).
 * @param {number} messageCount - The number of messages the user has sent.
 * @returns {Promise<{should_show: boolean, friction_data: object|null}>}
 */
export async function checkFriction(userId, tier, messageCount) {
  const url = `${API_BASE_URL}/api/friction/check`
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify({
        user_id: userId,
        tier: tier,
        message_count: messageCount,
      }),
    })

    if (!response.ok) {
      console.error('Friction API call failed with status:', response.status)
      // Fallback: If API fails, assume no friction to avoid blocking the user
      return { should_show: false, friction_data: null }
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error calling friction API:', error)
    // Fallback: If network fails, assume no friction
    return { should_show: false, friction_data: null }
  }
}

/**
 * Logs the user's action on the friction UI (dismissed, accepted, or upgraded).
 * @param {string} eventId - The unique ID of the friction event.
 * @param {('dismissed'|'accepted'|'upgraded')} action - The action taken by the user.
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function logFrictionAction(eventId, action) {
  const url = `${API_BASE_URL}/api/friction/action`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify({
        event_id: eventId,
        action: action,
      }),
    })

    const data = await response.json()
    return { success: response.ok, message: data.message || 'Action logged' }
  } catch (error) {
    console.error('Error logging friction action:', error)
    return { success: false, message: 'Failed to log action' }
  }
}
