import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { 
  Mail, 
  CheckCircle, 
  Brain, 
  Newspaper, 
  TrendingUp,
  Users,
  Bell,
  Star
} from 'lucide-react'
import Navigation from './Navigation'
import Footer from './Footer'
import { supabase } from '../lib/supabase'

export default function NewsletterPage() {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [interests, setInterests] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  const interestOptions = [
    { id: 'healthcare', label: 'Healthcare AI', icon: Brain },
    { id: 'education', label: 'Education Technology', icon: Users },
    { id: 'product', label: 'Product Updates', icon: TrendingUp },
    { id: 'research', label: 'AI Research', icon: Newspaper },
    { id: 'events', label: 'Events & Webinars', icon: Bell }
  ]

  const benefits = [
    {
      icon: Brain,
      title: "AI Insights",
      description: "Latest developments in artificial intelligence and machine learning"
    },
    {
      icon: TrendingUp,
      title: "Industry Trends",
      description: "Healthcare and education technology trends and analysis"
    },
    {
      icon: Star,
      title: "Exclusive Content",
      description: "Early access to new features, case studies, and research findings"
    },
    {
      icon: Users,
      title: "Community Updates",
      description: "Success stories from our user community and expert interviews"
    }
  ]

  const handleInterestToggle = (interestId) => {
    setInterests(prev => 
      prev.includes(interestId) 
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{
          email,
          first_name: firstName,
          last_name: lastName,
          tags: interests,
          source: 'website'
        }])

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('This email is already subscribed to our newsletter.')
        }
        throw error
      }

      setSubscribed(true)
      setEmail('')
      setFirstName('')
      setLastName('')
      setInterests([])
    } catch (error) {
      console.error('Error subscribing to newsletter:', error)
      alert(error.message || 'There was an error subscribing. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-primary/10 via-background to-accent/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Stay Ahead with AI
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Join thousands of healthcare professionals and educators who receive our weekly insights 
              on artificial intelligence, industry trends, and breakthrough innovations.
            </p>
          </div>
        </div>
      </section>

      {/* Newsletter Form */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Subscription Form */}
            <Card className="hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-2xl">Subscribe to Our Newsletter</CardTitle>
              </CardHeader>
              <CardContent>
                {subscribed ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Welcome to the Community!</h3>
                    <p className="text-muted-foreground mb-4">
                      Thank you for subscribing. You'll receive your first newsletter within the next week.
                    </p>
                    <Button onClick={() => setSubscribed(false)} variant="outline">
                      Subscribe Another Email
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          First Name
                        </label>
                        <Input
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Your first name"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Last Name
                        </label>
                        <Input
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Your last name"
                          required
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Email Address *
                      </label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>

                    {/* Interests */}
                    <div>
                      <label className="text-sm font-medium text-foreground mb-3 block">
                        What interests you most? (Select all that apply)
                      </label>
                      <div className="grid grid-cols-1 gap-3">
                        {interestOptions.map((option) => (
                          <label
                            key={option.id}
                            className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                              interests.includes(option.id)
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={interests.includes(option.id)}
                              onChange={() => handleInterestToggle(option.id)}
                              className="sr-only"
                            />
                            <option.icon className="h-5 w-5 text-primary" />
                            <span className="font-medium">{option.label}</span>
                            {interests.includes(option.id) && (
                              <CheckCircle className="h-4 w-4 text-primary ml-auto" />
                            )}
                          </label>
                        ))}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-300"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Subscribing...' : 'Subscribe to Newsletter'}
                      <Mail className="ml-2 h-4 w-4" />
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      By subscribing, you agree to receive marketing emails from Dalsi AI. 
                      You can unsubscribe at any time. View our{' '}
                      <button
                        type="button"
                        onClick={() => window.navigate('/privacy')}
                        className="text-primary hover:underline"
                      >
                        Privacy Policy
                      </button>
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Benefits */}
            <div className="space-y-6">
              <Card className="hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-xl">What You'll Get</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <benefit.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">{benefit.title}</h3>
                        <p className="text-sm text-muted-foreground">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Newsletter Stats */}
              <Card className="hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Newsletter Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">15K+</div>
                      <div className="text-sm text-muted-foreground">Subscribers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent">Weekly</div>
                      <div className="text-sm text-muted-foreground">Delivery</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">95%</div>
                      <div className="text-sm text-muted-foreground">Open Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent">4.9★</div>
                      <div className="text-sm text-muted-foreground">Rating</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sample Content */}
              <Card className="hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Recent Newsletter Topics</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm text-muted-foreground">
                        "AI in Medical Diagnosis: 5 Breakthrough Studies"
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-accent rounded-full"></div>
                      <span className="text-sm text-muted-foreground">
                        "Personalized Learning with AI: Case Study Results"
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm text-muted-foreground">
                        "DalSiAI Update: New Multimodal Capabilities"
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-accent rounded-full"></div>
                      <span className="text-sm text-muted-foreground">
                        "Healthcare AI Regulations: What You Need to Know"
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
