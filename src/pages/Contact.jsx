import { useState } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send, MessageSquare, Users, Briefcase } from 'lucide-react'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import Breadcrumb from '../components/Breadcrumb'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Form submitted:', formData)
    alert('Thank you for your message! We will get back to you soon.')
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-background text-foreground dark"
         style={{
           background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
           minHeight: '100vh'
         }}>
      <Navigation />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Contact Us', href: '/contact' }]} />
      
      <main>
        {/* Hero Section */}
        <section className="py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Button 
                variant="ghost" 
                className="mb-6 text-primary hover:text-primary/80"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              
              <h1 className="text-4xl sm:text-6xl font-bold text-foreground mb-6">
                Contact <span className="text-primary">Dalsi AI</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Ready to transform your organization with AI? Get in touch with our team of experts 
                to discuss how Dalsi AI can revolutionize your healthcare or education initiatives.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="py-16 bg-card/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
              
              {/* General Contact */}
              <div className="bg-card rounded-lg p-8 border border-border hover:border-primary/50 transition-all duration-300 hover:scale-105">
                <div className="flex items-center mb-6">
                  <Mail className="h-8 w-8 text-primary mr-4" />
                  <h3 className="text-xl font-bold text-foreground">General Inquiries</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  For general questions about our AI solutions and services.
                </p>
                <p className="text-primary font-medium text-lg">info@neodalsi.com</p>
              </div>

              {/* Phone Contact */}
              <div className="bg-card rounded-lg p-8 border border-border hover:border-accent/50 transition-all duration-300 hover:scale-105">
                <div className="flex items-center mb-6">
                  <Phone className="h-8 w-8 text-accent mr-4" />
                  <h3 className="text-xl font-bold text-foreground">Phone Support</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Speak directly with our AI specialists and technical experts.
                </p>
                <p className="text-accent font-medium text-lg">+1 (555) 123-4567</p>
              </div>

              {/* Office Location */}
              <div className="bg-card rounded-lg p-8 border border-border hover:border-destructive/50 transition-all duration-300 hover:scale-105">
                <div className="flex items-center mb-6">
                  <MapPin className="h-8 w-8 text-destructive mr-4" />
                  <h3 className="text-xl font-bold text-foreground">Office Location</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Visit us at our AI innovation hub for in-person consultations.
                </p>
                <p className="text-destructive font-medium">AI Innovation Hub<br />Tech Valley</p>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-card rounded-lg p-8 border border-border mb-16">
              <div className="flex items-center mb-6">
                <Clock className="h-8 w-8 text-chart-4 mr-4" />
                <h3 className="text-2xl font-bold text-foreground">Business Hours</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Support Hours</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Monday - Friday: 9:00 AM - 6:00 PM (EST)</li>
                    <li>Saturday: 10:00 AM - 4:00 PM (EST)</li>
                    <li>Sunday: Closed</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Emergency Support</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>24/7 for Enterprise customers</li>
                    <li>Critical issues: Within 1 hour response</li>
                    <li>General issues: Within 4 hours response</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">Send Us a Message</h2>
              <p className="text-xl text-muted-foreground">
                Fill out the form below and we'll get back to you within 24 hours.
              </p>
            </div>

            <div className="bg-card rounded-lg p-8 border border-border">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Inquiry Type */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Type of Inquiry
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
                      <input
                        type="radio"
                        name="inquiryType"
                        value="general"
                        checked={formData.inquiryType === 'general'}
                        onChange={handleChange}
                        className="text-primary"
                      />
                      <MessageSquare className="h-5 w-5 text-primary" />
                      <span className="text-foreground">General Inquiry</span>
                    </label>
                    <label className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:border-accent/50 transition-colors cursor-pointer">
                      <input
                        type="radio"
                        name="inquiryType"
                        value="sales"
                        checked={formData.inquiryType === 'sales'}
                        onChange={handleChange}
                        className="text-accent"
                      />
                      <Briefcase className="h-5 w-5 text-accent" />
                      <span className="text-foreground">Sales & Pricing</span>
                    </label>
                    <label className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:border-destructive/50 transition-colors cursor-pointer">
                      <input
                        type="radio"
                        name="inquiryType"
                        value="support"
                        checked={formData.inquiryType === 'support'}
                        onChange={handleChange}
                        className="text-destructive"
                      />
                      <Users className="h-5 w-5 text-destructive" />
                      <span className="text-foreground">Technical Support</span>
                    </label>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                      Full Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="bg-background border-border"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      Email Address *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="bg-background border-border"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                {/* Company and Subject */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-foreground mb-2">
                      Company/Organization
                    </label>
                    <Input
                      id="company"
                      name="company"
                      type="text"
                      value={formData.company}
                      onChange={handleChange}
                      className="bg-background border-border"
                      placeholder="Enter your company name"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                      Subject *
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="bg-background border-border"
                      placeholder="Brief subject of your inquiry"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Please provide details about your inquiry, including any specific requirements or questions you have about our AI solutions..."
                  />
                </div>

                {/* Submit Button */}
                <div className="text-center">
                  <Button 
                    type="submit"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg"
                  >
                    <Send className="h-5 w-5 mr-2" />
                    Send Message
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Additional Information */}
        <section className="py-16 bg-card/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">What Happens Next?</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">We Review Your Inquiry</h3>
                <p className="text-muted-foreground">
                  Our team reviews your message and determines the best specialist to assist you.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-accent">2</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Initial Response</h3>
                <p className="text-muted-foreground">
                  You'll receive an initial response within 24 hours with next steps or answers.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-destructive">3</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Detailed Follow-up</h3>
                <p className="text-muted-foreground">
                  We schedule a call or meeting to discuss your specific needs and how we can help.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}
