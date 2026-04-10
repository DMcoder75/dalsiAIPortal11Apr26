/**
 * Guest User Management
 * 
 * Handles getting the guest user UUID from the users table
 * This UUID is used for logging API calls for guest users
 * 
 * Guest user is identified by: first_name = 'Guest' AND last_name = 'User'
 */

import { supabase } from './supabase';

// Cache the guest user ID to avoid repeated database calls
let cachedGuestUserId = null;

/**
 * Get the guest user UUID from the users table
 * The guest user is identified by first_name='Guest' and last_name='User'
 * 
 * @returns {Promise<string|null>} - Guest user UUID or null if not found
 */
export const getGuestUserId = async () => {
  // Return cached value if available
  if (cachedGuestUserId) {
    console.log('✅ Using cached guest user ID:', cachedGuestUserId);
    return cachedGuestUserId;
  }

  try {
    console.log('🔍 Fetching guest user ID from database...');
    
    const { data, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, subscription_tier')
      .eq('first_name', 'Guest')
      .eq('last_name', 'User')
      .maybeSingle();

    if (error) {
      console.error('❌ Error fetching guest user:', error);
      return null;
    }

    if (!data) {
      console.warn('⚠️ Guest user not found in users table. Please create a user with first_name="Guest" and last_name="User"');
      return null;
    }

    cachedGuestUserId = data.id;
    console.log('✅ Guest user ID retrieved:', cachedGuestUserId);
    console.log('   Email:', data.email);
    console.log('   Tier:', data.subscription_tier);
    return cachedGuestUserId;

  } catch (error) {
    console.error('❌ Unexpected error fetching guest user:', error);
    return null;
  }
};

/**
 * Clear the cached guest user ID
 * Useful for testing or if the guest user changes
 */
export const clearGuestUserCache = () => {
  cachedGuestUserId = null;
  console.log('🗑️ Guest user cache cleared');
};
