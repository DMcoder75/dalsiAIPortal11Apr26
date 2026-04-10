import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import logo from '../assets/DalSiAILogo2.png'
import Breadcrumb from '../components/Breadcrumb'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('verifying') // verifying, success, error
  const [message, setMessage] = useState('Verifying your email...')
  const [showBreadcrumb] = useState(true)

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token')
        const email = searchParams.get('email')

        if (!token || !email) {
          setStatus('error')
          setMessage('Invalid verification link. Please check your email and try again.')
          return
        }

        // Check if user exists
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, email, email_verified')
          .eq('id', token)
          .eq('email', email)
          .single()

        if (userError || !userData) {
          setStatus('error')
          setMessage('Invalid verification link or user not found.')
          return
        }

        // Check if already verified
        if (userData.email_verified) {
          setStatus('success')
          setMessage('Your email is already verified! You can now sign in.')
          return
        }

        // Update user as verified
        const { error: updateError } = await supabase
          .from('users')
          .update({
            email_verified: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', token)

        if (updateError) {
          throw updateError
        }

        // Create a welcome notification
        await supabase.from('notifications').insert([{
          user_id: token,
          title: 'Welcome to Dalsi AI!',
          message: 'Your email has been verified successfully. Start exploring our AI solutions.',
          type: 'success'
        }])

        setStatus('success')
        setMessage('Email verified successfully! You can now sign in to your account.')

      } catch (error) {
        console.error('Verification error:', error)
        setStatus('error')
        setMessage('An error occurred during verification. Please try again or contact support.')
      }
    }

    verifyEmail()
  }, [searchParams])

  const handleContinue = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {showBreadcrumb && <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Verify Email', href: '/verify-email' }]} />}
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-80px)]">
      <Card className="w-full max-w-md bg-card/95 backdrop-blur border-border">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="Dalsi AI" className="h-16 w-16" />
          </div>
          <CardTitle className="text-2xl">
            {status === 'verifying' && 'Verifying Email'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </CardTitle>
          <CardDescription>
            {status === 'verifying' && 'Please wait while we verify your email address...'}
            {status === 'success' && 'Your account is now active'}
            {status === 'error' && 'We couldn\'t verify your email'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            {status === 'verifying' && (
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="h-16 w-16 text-green-500" />
            )}
            {status === 'error' && (
              <XCircle className="h-16 w-16 text-red-500" />
            )}

            <p className="text-center text-muted-foreground">
              {message}
            </p>
          </div>

          {status !== 'verifying' && (
            <div className="space-y-3">
              <Button
                onClick={handleContinue}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {status === 'success' ? 'Go to Sign In' : 'Back to Home'}
              </Button>

              {status === 'error' && (
                <Button
                  variant="outline"
                  onClick={() => navigate('/contact')}
                  className="w-full"
                >
                  Contact Support
                </Button>
              )}
            </div>
          )}

          {status === 'success' && (
            <div className="text-sm text-center text-muted-foreground">
              <p>You can now access all features of Dalsi AI.</p>
              <p className="mt-2">Start exploring our AI solutions!</p>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
