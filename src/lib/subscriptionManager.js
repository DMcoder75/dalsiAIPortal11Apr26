/**
 * Subscription Manager Service
 * Handles all subscription-related operations using Supabase client
 */

import { supabase } from './supabase'

export const subscriptionManager = {
  /**
   * Get user's current active subscription with plan details
   */
  async getCurrentSubscription(userId) {
    try {
      console.log('📋 Fetching current subscription for user:', userId)
      
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          id,
          user_id,
          plan_id,
          status,
          billing_cycle,
          start_date,
          end_date,
          trial_end_date,
          auto_renew,
          created_at,
          updated_at,
          stripe_subscription_id,
          stripe_customer_id,
          subscription_plans (
            id,
            name,
            display_name,
            description,
            price_monthly_usd,
            price_yearly_usd,
            features,
            limits,
            tier_level,
            rate_limit_per_minute,
            rate_limit_per_hour,
            rate_limit_per_day,
            max_tokens_per_request,
            max_tokens_per_month
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          console.log('⚠️ No active subscription found for user')
          return null
        }
        throw error
      }
      
      console.log('✅ Current subscription fetched:', data?.subscription_plans?.name)
      return data
    } catch (error) {
      console.error('❌ Error fetching subscription:', error)
      throw error
    }
  },

  /**
   * Create initial free tier subscription for new user
   */
  async createInitialSubscription(userId) {
    try {
      console.log('🆕 Creating initial subscription for user:', userId)
      
      // Get free plan (name is 'Free' with capital F)
      const { data: freePlan, error: planError } = await supabase
        .from('subscription_plans')
        .select('id, name')
        .eq('name', 'Free')
        .eq('is_active', true)
        .single()
      
      if (planError) {
        console.error('❌ Error fetching free plan:', planError)
        throw new Error('Free plan not found in database')
      }
      
      console.log('📦 Free plan found:', freePlan.id)
      
      // Create subscription
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .insert([{
          user_id: userId,
          plan_id: freePlan.id,
          status: 'active',
          billing_cycle: 'monthly',
          start_date: new Date().toISOString(),
          auto_renew: true
        }])
        .select()
        .single()
      
      if (subError) {
        console.error('❌ Error creating subscription:', subError)
        throw subError
      }
      
      console.log('✅ Subscription created:', subscription.id)
      
      // Record in history
      const { error: historyError } = await supabase
        .from('subscription_history')
        .insert([{
          user_id: userId,
          subscription_id: subscription.id,
          action: 'created',
          to_plan_id: freePlan.id,
          reason: 'Initial free tier assignment on registration'
        }])
      
      if (historyError) {
        console.error('⚠️ Error recording subscription history:', historyError)
        // Don't throw - subscription was created successfully
      }
      
      // Update user tier
      const { error: userError } = await supabase
        .from('users')
        .update({ subscription_tier: 'free' })
        .eq('id', userId)
      
      if (userError) {
        console.error('⚠️ Error updating user subscription tier:', userError)
        // Don't throw - subscription was created successfully
      }
      
      console.log('✅ Initial subscription setup complete')
      return subscription
    } catch (error) {
      console.error('❌ Error creating initial subscription:', error)
      throw error
    }
  },

  /**
   * Change user subscription to a different tier
   */
  async changeSubscription(userId, newTierName, billingCycle = 'monthly', reason = 'User requested') {
    try {
      console.log('🔄 Changing subscription for user:', userId, 'to tier:', newTierName)
      
      // Get current subscription
      const currentSub = await this.getCurrentSubscription(userId)
      if (!currentSub) {
        throw new Error('No active subscription found. Please create one first.')
      }
      
      console.log('📋 Current subscription:', currentSub.subscription_plans.name)
      
      // Get new plan
      const { data: newPlan, error: planError } = await supabase
        .from('subscription_plans')
        .select('id, name, tier_level')
        .eq('name', newTierName)
        .eq('is_active', true)
        .single()
      
      if (planError) {
        console.error('❌ Error fetching new plan:', planError)
        throw new Error(`Plan "${newTierName}" not found`)
      }
      
      console.log('📦 New plan found:', newPlan.id)
      
      // Prevent downgrade if same tier
      if (currentSub.plan_id === newPlan.id) {
        throw new Error('User is already on this plan')
      }
      
      // Determine action type
      const action = newPlan.tier_level > currentSub.subscription_plans.tier_level 
        ? 'upgraded' 
        : 'downgraded'
      
      console.log('🏷️ Action type:', action)
      
      // Update subscription
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({
          plan_id: newPlan.id,
          billing_cycle: billingCycle,
          start_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', currentSub.id)
      
      if (updateError) {
        console.error('❌ Error updating subscription:', updateError)
        throw updateError
      }
      
      console.log('✅ Subscription updated')
      
      // Record history
      const { error: historyError } = await supabase
        .from('subscription_history')
        .insert([{
          user_id: userId,
          subscription_id: currentSub.id,
          action: action,
          from_plan_id: currentSub.plan_id,
          to_plan_id: newPlan.id,
          reason: reason,
          metadata: {
            old_billing_cycle: currentSub.billing_cycle,
            new_billing_cycle: billingCycle,
            effective_date: new Date().toISOString()
          }
        }])
      
      if (historyError) {
        console.error('⚠️ Error recording history:', historyError)
      }
      
      // Update user tier
      const { error: userError } = await supabase
        .from('users')
        .update({ subscription_tier: newTierName })
        .eq('id', userId)
      
      if (userError) {
        console.error('⚠️ Error updating user tier:', userError)
      }
      
      console.log('✅ Subscription change complete')
      return { success: true, action, newPlan }
    } catch (error) {
      console.error('❌ Error changing subscription:', error)
      throw error
    }
  },

  /**
   * Cancel user subscription
   */
  async cancelSubscription(userId, reason = 'User requested') {
    try {
      console.log('❌ Cancelling subscription for user:', userId)
      
      const currentSub = await this.getCurrentSubscription(userId)
      if (!currentSub) {
        throw new Error('No active subscription found')
      }
      
      // Cancel subscription
      const { error: cancelError } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'cancelled',
          end_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', currentSub.id)
      
      if (cancelError) {
        console.error('❌ Error cancelling subscription:', cancelError)
        throw cancelError
      }
      
      console.log('✅ Subscription cancelled')
      
      // Record history
      const { error: historyError } = await supabase
        .from('subscription_history')
        .insert([{
          user_id: userId,
          subscription_id: currentSub.id,
          action: 'cancelled',
          from_plan_id: currentSub.plan_id,
          reason: reason
        }])
      
      if (historyError) {
        console.error('⚠️ Error recording cancellation:', historyError)
      }
      
      // Revert to free tier
      const { error: userError } = await supabase
        .from('users')
        .update({ subscription_tier: 'free' })
        .eq('id', userId)
      
      if (userError) {
        console.error('⚠️ Error updating user tier:', userError)
      }
      
      console.log('✅ Subscription cancellation complete')
      return { success: true, message: 'Subscription cancelled successfully' }
    } catch (error) {
      console.error('❌ Error cancelling subscription:', error)
      throw error
    }
  },

  /**
   * Get subscription history for user
   */
  async getSubscriptionHistory(userId, limit = 20) {
    try {
      console.log('📜 Fetching subscription history for user:', userId)
      
      const { data, error } = await supabase
        .from('subscription_history')
        .select(`
          id,
          action,
          created_at,
          reason,
          from_plan_id,
          to_plan_id,
          metadata,
          from_plan:from_plan_id (name, display_name),
          to_plan:to_plan_id (name, display_name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (error) {
        console.error('❌ Error fetching history:', error)
        throw error
      }
      
      console.log('✅ History fetched:', data?.length || 0, 'records')
      return data || []
    } catch (error) {
      console.error('❌ Error fetching subscription history:', error)
      throw error
    }
  },

  /**
   * Get all available subscription plans
   */
  async getAvailablePlans() {
    try {
      console.log('📋 Fetching available subscription plans')
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('tier_level', { ascending: true })
      
      if (error) {
        console.error('❌ Error fetching plans:', error)
        throw error
      }
      
      console.log('✅ Plans fetched:', data?.length || 0, 'plans')
      return data || []
    } catch (error) {
      console.error('❌ Error fetching plans:', error)
      throw error
    }
  },

  /**
   * Get plan by name
   */
  async getPlanByName(planName) {
    try {
      console.log('🔍 Fetching plan:', planName)
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('name', planName)
        .eq('is_active', true)
        .single()
      
      if (error) {
        console.error('❌ Error fetching plan:', error)
        throw error
      }
      
      console.log('✅ Plan fetched:', data.name)
      return data
    } catch (error) {
      console.error('❌ Error fetching plan:', error)
      throw error
    }
  },

  /**
   * Check if user has access to a feature based on subscription
   */
  async checkFeatureAccess(userId, featureName) {
    try {
      const subscription = await this.getCurrentSubscription(userId)
      if (!subscription) return false
      
      const features = subscription.subscription_plans.features || {}
      return features[featureName] === true
    } catch (error) {
      console.error('❌ Error checking feature access:', error)
      return false
    }
  },

  /**
   * Get subscription limits for user
   */
  async getSubscriptionLimits(userId) {
    try {
      const subscription = await this.getCurrentSubscription(userId)
      if (!subscription) return null
      
      return {
        rateLimit: {
          perMinute: subscription.subscription_plans.rate_limit_per_minute,
          perHour: subscription.subscription_plans.rate_limit_per_hour,
          perDay: subscription.subscription_plans.rate_limit_per_day
        },
        tokens: {
          perRequest: subscription.subscription_plans.max_tokens_per_request,
          perMonth: subscription.subscription_plans.max_tokens_per_month
        }
      }
    } catch (error) {
      console.error('❌ Error getting subscription limits:', error)
      return null
    }
  }
}
