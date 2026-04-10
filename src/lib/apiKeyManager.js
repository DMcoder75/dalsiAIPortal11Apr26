/**
 * API Key Management Utility
 * 
 * Handles fetching and updating API keys from the api_keys table
 * Tracks usage statistics for each API key
 */

import { supabase } from './supabase';

// Cache API keys to reduce database queries
const apiKeyCache = new Map();

/**
 * Get the active API key for a user
 * Fetches from database and caches for performance
 * 
 * @param {string} userId - User UUID
 * @returns {Promise<Object|null>} - API key record or null
 */
export const getUserApiKey = async (userId) => {
  if (!userId) {
    console.warn('⚠️ No user ID provided for API key lookup');
    return null;
  }

  // Check cache first
  if (apiKeyCache.has(userId)) {
    const cached = apiKeyCache.get(userId);
    console.log('✅ Using cached API key for user:', userId.substring(0, 8) + '...');
    return cached;
  }

  try {
    console.log('🔍 Fetching API key for user:', userId.substring(0, 8) + '...');
    
    const { data, error } = await supabase
      .from('api_keys')
      .select('id, user_id, key_prefix, name, is_active, subscription_tier, rate_limit_per_minute, rate_limit_per_hour, rate_limit_per_day')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('❌ Error fetching API key:', error);
      return null;
    }

    if (!data) {
      console.warn('⚠️ No active API key found for user:', userId.substring(0, 8) + '...');
      return null;
    }

    // Cache the API key
    apiKeyCache.set(userId, data);
    console.log('✅ API key fetched and cached:', {
      id: data.id.substring(0, 8) + '...',
      name: data.name,
      prefix: data.key_prefix
    });

    return data;

  } catch (error) {
    console.error('❌ Unexpected error fetching API key:', error);
    return null;
  }
};

/**
 * Update API key usage statistics
 * Increments counters and updates last used information
 * 
 * @param {string} apiKeyId - API key UUID
 * @param {Object} usageData - Usage data to update
 * @param {number} usageData.tokens_used - Tokens consumed in this request
 * @param {number} usageData.cost_usd - Cost of this request in USD
 * @param {string} usageData.endpoint - API endpoint used
 * @param {string} usageData.ip_address - Client IP address
 * @returns {Promise<boolean>} - Success status
 */
export const updateApiKeyUsage = async (apiKeyId, usageData) => {
  if (!apiKeyId) {
    console.warn('⚠️ No API key ID provided for usage update');
    return false;
  }

  try {
    console.log('📊 Updating API key usage:', {
      apiKeyId: apiKeyId.substring(0, 8) + '...',
      tokens: usageData.tokens_used,
      cost: usageData.cost_usd
    });

    // First, get current values
    const { data: currentKey, error: fetchError } = await supabase
      .from('api_keys')
      .select('total_requests, total_tokens_used, total_cost_usd')
      .eq('id', apiKeyId)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching current API key stats:', fetchError);
      return false;
    }

    // Calculate new values
    const newTotalRequests = (currentKey.total_requests || 0) + 1;
    const newTotalTokens = (currentKey.total_tokens_used || 0) + (usageData.tokens_used || 0);
    const newTotalCost = parseFloat(currentKey.total_cost_usd || 0) + parseFloat(usageData.cost_usd || 0);

    // Update the API key record
    const { error: updateError } = await supabase
      .from('api_keys')
      .update({
        total_requests: newTotalRequests,
        total_tokens_used: newTotalTokens,
        total_cost_usd: newTotalCost,
        last_used_at: new Date().toISOString(),
        last_used_ip: usageData.ip_address || null,
        last_used_endpoint: usageData.endpoint || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', apiKeyId);

    if (updateError) {
      console.error('❌ Error updating API key usage:', updateError);
      return false;
    }

    console.log('✅ API key usage updated:', {
      requests: newTotalRequests,
      tokens: newTotalTokens,
      cost: newTotalCost.toFixed(6)
    });

    return true;

  } catch (error) {
    console.error('❌ Unexpected error updating API key usage:', error);
    return false;
  }
};

/**
 * Clear the API key cache
 * Useful for testing or when keys are updated
 * 
 * @param {string} userId - Optional user ID to clear specific cache entry
 */
export const clearApiKeyCache = (userId = null) => {
  if (userId) {
    apiKeyCache.delete(userId);
    console.log('🗑️ Cleared API key cache for user:', userId.substring(0, 8) + '...');
  } else {
    apiKeyCache.clear();
    console.log('🗑️ Cleared all API key cache');
  }
};

/**
 * Get API key cache stats
 * For debugging and monitoring
 * 
 * @returns {Object} - Cache statistics
 */
export const getApiKeyCacheStats = () => {
  return {
    size: apiKeyCache.size,
    keys: Array.from(apiKeyCache.keys()).map(k => k.substring(0, 8) + '...')
  };
};
