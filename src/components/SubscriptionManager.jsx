/**
 * Subscription Manager Component
 * Displays current subscription and allows tier changes
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Button } from './ui/button'
import { Check, AlertCircle, Loader, ChevronRight } from 'lucide-react'
import { subscriptionManager } from '../lib/subscriptionManager'

export default function SubscriptionManager({ userId, onSubscriptionChange }) {
  const [currentSubscription, setCurrentSubscription] = useState(null)
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [changingTo, setChangingTo] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState([])

  // Load subscription and plans on mount
  useEffect(() => {
    loadSubscriptionData()
  }, [userId])

  const loadSubscriptionData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [subscription, availablePlans] = await Promise.all([
        subscriptionManager.getCurrentSubscription(userId),
        subscriptionManager.getAvailablePlans()
      ])

      setCurrentSubscription(subscription)
      setPlans(availablePlans)
    } catch (err) {
      console.error('Error loading subscription data:', err)
      setError(err.message || 'Failed to load subscription data')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePlan = async (newPlanName) => {
    try {
      setChangingTo(newPlanName)
      setError(null)

      await subscriptionManager.changeSubscription(
        userId,
        newPlanName,
        'monthly',
        'User changed plan from UI'
      )

      // Reload subscription data
      await loadSubscriptionData()
      
      // Call callback if provided
      if (onSubscriptionChange) {
        onSubscriptionChange()
      }

      // Show success message
      alert(`Successfully changed to ${newPlanName} plan!`)
    } catch (err) {
      console.error('Error changing plan:', err)
      setError(err.message || 'Failed to change plan')
    } finally {
      setChangingTo(null)
    }
  }

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? You will be reverted to the free plan.')) {
      return
    }

    try {
      setError(null)
      await subscriptionManager.cancelSubscription(userId, 'User cancelled from UI')
      
      // Reload subscription data
      await loadSubscriptionData()
      
      if (onSubscriptionChange) {
        onSubscriptionChange()
      }

      alert('Subscription cancelled successfully')
    } catch (err) {
      console.error('Error cancelling subscription:', err)
      setError(err.message || 'Failed to cancel subscription')
    }
  }

  const loadHistory = async () => {
    try {
      const historyData = await subscriptionManager.getSubscriptionHistory(userId)
      setHistory(historyData)
      setShowHistory(!showHistory)
    } catch (err) {
      console.error('Error loading history:', err)
      setError('Failed to load subscription history')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading subscription data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Current Subscription */}
      {currentSubscription && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>Your active subscription details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-2xl font-bold text-foreground">
                  {currentSubscription.subscription_plans.display_name}
                </h3>
                <p className="text-muted-foreground mt-1">
                  {currentSubscription.subscription_plans.description}
                </p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Billing Cycle:</span>
                  <span className="font-semibold capitalize">{currentSubscription.billing_cycle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-semibold capitalize text-green-600">{currentSubscription.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Started:</span>
                  <span className="font-semibold">
                    {new Date(currentSubscription.start_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Features */}
            {currentSubscription.subscription_plans.features && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold text-foreground mb-3">Included Features</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {Object.entries(currentSubscription.subscription_plans.features).map(([feature, enabled]) => (
                    <div key={feature} className="flex items-center gap-2">
                      {enabled ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <div className="w-4 h-4 rounded border border-gray-300" />
                      )}
                      <span className="text-sm capitalize">{feature.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Limits */}
            {currentSubscription.subscription_plans.limits && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold text-foreground mb-3">Plan Limits</h4>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  {Object.entries(currentSubscription.subscription_plans.limits).map(([limit, value]) => (
                    <div key={limit} className="flex justify-between">
                      <span className="text-muted-foreground capitalize">{limit.replace(/_/g, ' ')}:</span>
                      <span className="font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 pt-6 border-t flex gap-3">
              <Button
                variant="outline"
                onClick={loadHistory}
                className="flex-1"
              >
                {showHistory ? 'Hide' : 'View'} History
              </Button>
              {currentSubscription.subscription_plans.name !== 'free' && (
                <Button
                  variant="destructive"
                  onClick={handleCancelSubscription}
                  className="flex-1"
                >
                  Cancel Subscription
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription History */}
      {showHistory && history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Subscription History</CardTitle>
            <CardDescription>Track all changes to your subscription</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold capitalize">{entry.action}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {entry.from_plan && entry.to_plan && (
                      <p className="text-sm text-muted-foreground mt-1">
                        From <span className="font-medium">{entry.from_plan.display_name}</span> to{' '}
                        <span className="font-medium">{entry.to_plan.display_name}</span>
                      </p>
                    )}
                    {entry.reason && (
                      <p className="text-sm text-muted-foreground mt-1">{entry.reason}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <div>
        <h3 className="text-xl font-bold text-foreground mb-4">Available Plans</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isCurrentPlan = currentSubscription?.plan_id === plan.id
            const isFree = plan.name === 'free'

            return (
              <Card
                key={plan.id}
                className={`relative transition-all ${
                  isCurrentPlan
                    ? 'border-primary border-2 bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-3 -right-3 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Current
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="text-lg">{plan.display_name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Price */}
                  <div>
                    <div className="text-3xl font-bold text-foreground">
                      ${plan.price_monthly_usd || '0'}
                      <span className="text-lg font-normal text-muted-foreground">/mo</span>
                    </div>
                    {plan.price_yearly_usd && (
                      <p className="text-xs text-muted-foreground mt-1">
                        ${plan.price_yearly_usd}/year (save {Math.round((1 - plan.price_yearly_usd / (plan.price_monthly_usd * 12)) * 100)}%)
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  {plan.features && (
                    <div className="space-y-2">
                      {Object.entries(plan.features).slice(0, 3).map(([feature, enabled]) => (
                        <div key={feature} className="flex items-center gap-2 text-sm">
                          {enabled ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <div className="w-4 h-4 rounded border border-gray-300" />
                          )}
                          <span className="capitalize">{feature.replace(/_/g, ' ')}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Button */}
                  {!isCurrentPlan && !isFree && (
                    <Button
                      onClick={() => handleChangePlan(plan.name)}
                      disabled={changingTo === plan.name}
                      className="w-full"
                    >
                      {changingTo === plan.name ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Upgrading...
                        </>
                      ) : (
                        <>
                          Upgrade
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  )}

                  {isCurrentPlan && (
                    <Button disabled className="w-full" variant="outline">
                      Current Plan
                    </Button>
                  )}

                  {isFree && !isCurrentPlan && (
                    <Button
                      onClick={() => handleChangePlan(plan.name)}
                      disabled={changingTo === plan.name}
                      className="w-full"
                      variant="outline"
                    >
                      {changingTo === plan.name ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Downgrading...
                        </>
                      ) : (
                        'Downgrade'
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
