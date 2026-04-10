import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { handleGmailCallback } from '../lib/jwtAuth'
import { subscriptionManager } from '../lib/subscriptionManager'
import { useAuth } from '../contexts/AuthContext'
import logger from '../lib/logger'

export default function GmailCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const processCallback = async () => {
      // Prevent duplicate processing
      if (isProcessing) {
        console.log('⏳ [GMAIL_CALLBACK] Already processing, skipping duplicate call')
        return
      }

      try {
        setIsProcessing(true)
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const errorParam = searchParams.get('error')

        logger.info('🔐 [GMAIL_CALLBACK] Processing Gmail callback...')
        logger.info('📝 Code:', code ? 'present' : 'missing')
        logger.info('📝 State:', state ? 'present' : 'missing')
        logger.info('📝 Error:', errorParam)
        logger.info('📍 Full URL:', window.location.href)
        logger.info('🔗 Search params:', searchParams.toString())

        // Check for errors from Gmail
        if (errorParam) {
          logger.error('❌ [GMAIL_CALLBACK] Gmail returned error:', errorParam)
          throw new Error(`Gmail error: ${errorParam}`)
        }

        // Validate required parameters
        if (!code || !state) {
          logger.error('❌ [GMAIL_CALLBACK] Missing code or state')
          throw new Error('Missing authorization code or state parameter')
        }

        logger.info('🔐 [GMAIL_CALLBACK] Code and state present, exchanging for tokens...')
        logger.info('📝 Code length:', code.length)
        logger.info('📝 State length:', state.length)
        
        // Handle Gmail callback
        const result = await handleGmailCallback(code, state)

        if (!result.success || !result.user) {
          logger.error('❌ [GMAIL_CALLBACK] handleGmailCallback returned invalid result:', result)
          throw new Error('Failed to authenticate with Gmail')
        }

        logger.info('✅ [GMAIL_CALLBACK] Gmail authentication successful')
        logger.info('📦 User:', result.user)
        logger.info('🎁 User ID:', result.user.id)
        logger.info('📧 User Email:', result.user.email)

        // Update auth context
        logger.info('👤 [GMAIL_CALLBACK] Updating auth context with user data')
        login(result.user)

        // Create initial free tier subscription for new users
        logger.info('🎁 [GMAIL_CALLBACK] Checking subscription status...')
        try {
          const subscription = await subscriptionManager.getCurrentSubscription(result.user.id)
          
          if (!subscription) {
            logger.info('🎁 [GMAIL_CALLBACK] No subscription found, creating free tier...')
            await subscriptionManager.createInitialSubscription(result.user.id)
            logger.info('✅ [GMAIL_CALLBACK] Free tier subscription created')
          } else {
            logger.info('✅ [GMAIL_CALLBACK] User already has subscription:', subscription.plan_id)
          }
        } catch (subError) {
          logger.warn('⚠️ [GMAIL_CALLBACK] Error with subscription:', subError.message)
          // Don't fail authentication if subscription check fails
        }

        // Don't reload page! Just redirect to dashboard
        // Page reload causes the callback to be called twice (second time fails with state already used)
        logger.info('✅ [GMAIL_CALLBACK] Authentication successful, redirecting to dashboard...')
        logger.info('🚀 [GMAIL_CALLBACK] Navigating to /experience')
        
        // Verify auth state is persisted before redirect
        logger.info('🔍 [GMAIL_CALLBACK] Verifying auth state persistence...')
        const storedToken = localStorage.getItem('jwt_token')
        const storedUser = localStorage.getItem('user_info')
        logger.info('💾 [GMAIL_CALLBACK] JWT Token stored:', storedToken ? 'YES' : 'NO')
        logger.info('💾 [GMAIL_CALLBACK] User Info stored:', storedUser ? 'YES' : 'NO')
        
        if (!storedToken || !storedUser) {
          logger.error('❌ [GMAIL_CALLBACK] Auth state NOT persisted! Storing again...')
          localStorage.setItem('jwt_token', result.token)
          localStorage.setItem('user_info', JSON.stringify(result.user))
          logger.info('✅ [GMAIL_CALLBACK] Auth state stored again')
        }
        
        // Use setTimeout to ensure everything is committed before redirect
        setTimeout(() => {
          logger.info('🚀 [GMAIL_CALLBACK] Performing redirect to experience page')
          // Use window.location.href for full page reload to ensure Router re-renders
          window.location.href = '/experience'
        }, 1000)

      } catch (err) {
        logger.error('❌ [GMAIL_CALLBACK] Error:', err.message)
        logger.error('❌ [GMAIL_CALLBACK] Error stack:', err.stack)
        setError(err.message || 'Authentication failed')
        setLoading(false)
      }
    }

    processCallback()
  }, [searchParams, navigate, login, isProcessing])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-white text-lg">Authenticating with Gmail...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait while we complete your login</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">❌</div>
          <h1 className="text-white text-2xl font-bold mb-2">Authentication Failed</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded"
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  return null
}
