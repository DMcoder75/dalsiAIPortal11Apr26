import Navigation from '../components/Navigation'
import QuickMenu from '../components/QuickMenu'
import HeroSection from '../components/HeroSection'
import SolutionsSection from '../components/SolutionsSection'
import { Link } from 'react-router-dom'
import PricingSection from '../components/PricingSection'
import Footer from '../components/Footer'
import { BookOpen, UserCheck, FileText, Activity, Scan, Stethoscope } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground dark"
         style={{
           background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
           minHeight: '100vh'
         }}>
      {/* Navigation */}
      <Navigation />
      
      {/* Quick Menu */}
      <QuickMenu />
      
      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <HeroSection />
        
        {/* Verto AI Promo Banner */}
        <section className="py-10 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="relative overflow-hidden rounded-2xl border border-green-500/30 bg-gradient-to-r from-green-950/60 via-emerald-900/40 to-green-950/60 px-8 py-8 flex flex-col md:flex-row items-center gap-6 shadow-lg shadow-green-900/20">
              {/* Glow */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-10 left-1/3 w-72 h-40 bg-green-500/10 rounded-full blur-3xl" />
              </div>
              {/* Logo */}
              <img
                src="/VertoLogo.png"
                alt="Verto AI"
                className="w-20 h-20 object-contain flex-shrink-0 drop-shadow-lg relative z-10"
              />
              {/* Text */}
              <div className="flex-1 text-center md:text-left relative z-10">
                <div className="inline-flex items-center gap-1.5 bg-green-500/15 border border-green-500/25 text-green-400 text-xs font-semibold px-3 py-1 rounded-full mb-2 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Now Live
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
                  Try <span className="text-green-400">Verto AI</span> — WhatsApp Concierge
                </h2>
                <p className="text-sm text-green-100/70 max-w-xl">
                  Deploy an intelligent WhatsApp agent for your business in minutes. Handle bookings, payments, and customer support — all in natural conversation, no extra app needed.
                </p>
              </div>
              {/* CTA */}
              <div className="relative z-10 flex-shrink-0">
                <Link
                  to="/vertoai"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold text-sm px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-green-500/30 hover:shadow-green-400/40 hover:scale-105"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.116 1.528 5.845L.057 23.57a.75.75 0 00.906.919l5.934-1.557A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.667-.502-5.2-1.38l-.374-.22-3.52.924.939-3.43-.243-.386A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                  </svg>
                  Start Free Demo
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Solutions Section */}
        <SolutionsSection />
        
        {/* Pricing Section */}
        <PricingSection />
        
        {/* Healthcare Section */}
        <section id="healthcare" className="py-16 sm:py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-4xl font-bold text-foreground mb-6 sm:mb-8">Healthcare Solutions</h2>
            <p className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Revolutionary AI-powered healthcare solutions coming soon. Experience the future of medical technology 
              with our advanced diagnostic tools, patient care systems, and clinical decision support.
            </p>
            <div className="mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="p-6 bg-card rounded-lg border border-border hover:border-red/50 transition-all duration-300 hover:scale-105 group">
                <div className="w-12 h-12 bg-red/30 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:animate-pulse">
                  <Activity className="w-7 h-7 text-red group-hover:animate-pulse" strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-semibold mb-2">Remote Monitoring</h3>
                <p className="text-muted-foreground text-sm">24/7 patient monitoring with AI-powered insights</p>
              </div>
              <div className="p-6 bg-card rounded-lg border border-border hover:border-red/50 transition-all duration-300 hover:scale-105 group">
                <div className="w-12 h-12 bg-red/30 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:animate-spin">
                  <Scan className="w-7 h-7 text-red" strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-semibold mb-2">Diagnostic AI</h3>
                <p className="text-muted-foreground text-sm">Advanced image analysis and diagnostic assistance</p>
              </div>
              <div className="p-6 bg-card rounded-lg border border-border hover:border-red/50 transition-all duration-300 hover:scale-105 group">
                <div className="w-12 h-12 bg-red/30 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:animate-bounce">
                  <Stethoscope className="w-7 h-7 text-red" strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-semibold mb-2">Clinical Support</h3>
                <p className="text-muted-foreground text-sm">Intelligent decision support for healthcare professionals</p>
              </div>
            </div>
          </div>
        </section>

        {/* Education Section */}
        <section id="education" className="py-24 bg-card/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-foreground mb-8">Education & Training</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Transform learning experiences with our intelligent education platform. Personalized learning paths, 
              automated assessments, and comprehensive knowledge management systems.
            </p>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-card rounded-lg border border-border hover:border-primary/50 transition-all duration-300 hover:scale-105 group">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:animate-bounce">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Personalized Learning</h3>
                <p className="text-muted-foreground text-sm">AI-driven adaptive learning experiences</p>
              </div>
              <div className="p-6 bg-card rounded-lg border border-border hover:border-primary/50 transition-all duration-300 hover:scale-105 group">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:animate-pulse">
                  <UserCheck className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Smart Tutoring</h3>
                <p className="text-muted-foreground text-sm">Intelligent tutoring systems with real-time feedback</p>
              </div>
              <div className="p-6 bg-card rounded-lg border border-border hover:border-primary/50 transition-all duration-300 hover:scale-105 group">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:animate-spin">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Content Generation</h3>
                <p className="text-muted-foreground text-sm">Automated content creation and curriculum development</p>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-foreground mb-8">About Dalsi AI & Automations</h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                At Dalsi AI & Automations, we believe that <strong className="text-primary">Artificial Intelligence Made Real</strong> 
                is not just our tagline—it's our mission. We are pioneering the next generation of AI solutions that bridge 
                the gap between cutting-edge technology and practical, real-world applications.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                <div className="text-center p-6 bg-card rounded-lg border border-border hover:border-primary/50 transition-all duration-300">
                  <h3 className="text-xl font-semibold text-primary mb-4">Our Vision</h3>
                  <p className="text-muted-foreground">
                    To revolutionize how organizations interact with artificial intelligence, making advanced AI capabilities 
                    accessible, practical, and transformative for healthcare and education sectors worldwide.
                  </p>
                </div>
                <div className="text-center p-6 bg-card rounded-lg border border-border hover:border-accent/50 transition-all duration-300">
                  <h3 className="text-xl font-semibold text-accent mb-4">Our Mission</h3>
                  <p className="text-muted-foreground">
                    To develop and deploy intelligent automation solutions that enhance human capabilities, improve outcomes, 
                    and create meaningful impact in the lives of patients, students, and professionals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-24 bg-card/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-foreground mb-8">Get in Touch</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
              Ready to transform your organization with AI? Contact our team of experts to discuss how 
              Dalsi AI can revolutionize your healthcare or education initiatives.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-card rounded-lg border border-border hover:scale-105 transition-all duration-300">
                <h3 className="text-lg font-semibold mb-4">General Inquiries</h3>
                <p className="text-muted-foreground mb-4">Questions about our AI solutions and services</p>
                <p className="text-primary font-medium">info@neodalsi.com</p>
              </div>
              <div className="p-6 bg-card rounded-lg border border-border hover:scale-105 transition-all duration-300">
                <h3 className="text-lg font-semibold mb-4">Technical Support</h3>
                <p className="text-muted-foreground mb-4">Get help with implementation and technical questions</p>
                <p className="text-primary font-medium">info@neodalsi.com</p>
              </div>
              <div className="p-6 bg-card rounded-lg border border-border hover:scale-105 transition-all duration-300">
                <h3 className="text-lg font-semibold mb-4">Partnerships</h3>
                <p className="text-muted-foreground mb-4">Explore collaboration opportunities with our team</p>
                <p className="text-primary font-medium">info@neodalsi.com</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  )
}
