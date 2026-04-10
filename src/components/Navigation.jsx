import { useState } from 'react'
import { Button } from './ui/button'
import { Menu, X, ChevronDown, User, CreditCard, LogOut } from 'lucide-react'
import logo from '../assets/DalSiAILogo2.png'
import { useAuth } from '../contexts/AuthContext'

export default function Navigation() {
 const [isMenuOpen, setIsMenuOpen] = useState(false)
 const [showUserMenu, setShowUserMenu] = useState(false)
 const isHomePage = window.location.pathname === '/'
 const { user, loading, logout } = useAuth()

 console.log('Navigation render - user:', user, 'loading:', loading)

 const navigate = (path) => {
 if (window.navigate) {
  window.navigate(path)
 } else {
  window.location.href = path
 }
 }

 return (
 <nav className="fixed top-0 w-full z-50 bg-black border-b border-border">
  <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
  <div className="flex justify-between items-center h-14 sm:h-16">
   {/* Logo */}
   <a href="/" className="flex items-center min-w-0">
   <img src={logo} alt="Dalsi AI" className="h-8 sm:h-10 w-auto flex-shrink-0" />
   <span className="ml-2 sm:ml-3 text-sm sm:text-base font-bold text-white leading-tight">
    <span className="hidden md:block">
     <div>Dalsi AI &</div>
     <div>Automations</div>
    </span>
    <span className="inline md:hidden">Dalsi AI</span>
   </span>
   </a>

   {/* Desktop Navigation */}
   <div className="hidden lg:flex items-center space-x-4">
   <a href="/" className="relative text-white hover:text-primary transition-all duration-300 font-medium group hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]">
    <span className="relative z-10">Home</span>
    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
   </a>
   
   {/* Dalsi AI Dropdown */}
   <div className="relative group">
    <button className="relative text-white hover:text-primary transition-all duration-300 flex items-center font-medium whitespace-nowrap hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]">
    <span className="relative z-10">DalsiAI</span>
    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
    </button>
    <div className="absolute left-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
    <div className="p-2">
     <a href="/models/dalsi-ai" className="block px-3 py-2 text-primary font-semibold hover:bg-primary/10 rounded text-white">
     Model Overview
     </a>
     <div className="mt-1 space-y-1">
     <a href="/products/writer-pro" className="block px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded">
      Writer Pro
     </a>
     <a href="/products/code-genius" className="block px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded">
      Code Genius
     </a>
     <a href="/products/business-suite" className="block px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded">
      Business Suite
     </a>
     <a href="/products/researcher" className="block px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded">
      Researcher
     </a>
     <a href="/products/chatbot-builder" className="block px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded">
      Chatbot Builder
     </a>
     </div>
    </div>
    </div>
   </div>
   
   {/* Dalsi AI Vi Dropdown */}
   <div className="relative group">
    <button className="relative text-white hover:text-accent transition-all duration-300 flex items-center font-medium whitespace-nowrap hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(216,180,254,0.6)]">
    <span className="relative z-10">DalsiAI Vi</span>
    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300"></span>
    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
    </button>
    <div className="absolute left-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
    <div className="p-2">
     <a href="/models/dalsi-ai-vi" className="block px-3 py-2 text-accent font-semibold hover:bg-accent/10 rounded">
     Model Overview
     </a>
     <div className="mt-1 space-y-1">
     <a href="/products/vision-scan" className="block px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded">
      Vision Scan
     </a>
     <a href="/products/medvision" className="block px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded">
      MedVision
     </a>
     <a href="/products/art-studio" className="block px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded">
      Art Studio
     </a>
     <a href="/products/inspector" className="block px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded">
      Inspector
     </a>
     <a href="/products/brand-guard" className="block px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded">
      Brand Guard
     </a>
     </div>
    </div>
    </div>
   </div>
   
   {/* Dalsi AI Vd Dropdown */}
   <div className="relative group">
    <button className="relative text-white hover:text-purple transition-all duration-300 flex items-center font-medium whitespace-nowrap hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(124,58,237,0.6)]">
    <span className="relative z-10">DalsiAI Vd</span>
    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple group-hover:w-full transition-all duration-300"></span>
    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
    </button>
    <div className="absolute left-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
    <div className="p-2">
     <a href="/models/dalsi-ai-vd" className="block px-3 py-2 text-purple font-semibold hover:bg-purple/10 rounded text-white">
     Model Overview
     </a>
     <div className="mt-1 space-y-1">
     <a href="/products/moviemaker" className="block px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded">
      MovieMaker
     </a>
     <a href="/products/translate-global" className="block px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded">
      Translate Global
     </a>
     <a href="/products/music-studio" className="block px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded">
      Music Studio
     </a>
     <a href="/products/video-ads" className="block px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded">
      VideoAds
     </a>
     <a href="/products/learning-platform" className="block px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded">
      Learning Platform
     </a>
     </div>
    </div>
    </div>
   </div>
   {isHomePage ? (
    <a href="#healthcare" className="relative text-white hover:text-primary transition-all duration-300 font-medium group hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]">
    <span className="relative z-10">Healthcare</span>
    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
    </a>
   ) : (
    <a href="/#healthcare" className="relative text-white hover:text-primary transition-all duration-300 font-medium group hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]">
    <span className="relative z-10">Healthcare</span>
    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
    </a>
   )}
   {isHomePage ? (
    <a href="#education" className="relative text-white hover:text-primary transition-all duration-300 font-medium group hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]">
    <span className="relative z-10">Education</span>
    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
    </a>
   ) : (
    <a href="/#education" className="relative text-white hover:text-primary transition-all duration-300 font-medium group hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]">
    <span className="relative z-10">Education</span>
    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
    </a>
   )}
   <a href="/about" className="relative text-white hover:text-primary transition-all duration-300 font-medium group hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]">
    <span className="relative z-10">About</span>
    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
   </a>
   <a href="/contact" className="relative text-white hover:text-primary transition-all duration-300 font-medium group hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]">
    <span className="relative z-10">Contact</span>
    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
   </a>
   <Button 
    className="bg-[#5E3BEE] hover:bg-[#5E3BEE]/90 text-white rounded-lg px-4 py-2"
    onClick={() => window.navigate('/experience')}
   >
    Experience Dalsi
   </Button>
   
   {/* Authentication Buttons */}
   <div className="flex items-center space-x-2 ml-4">
    {loading ? (
    // Show nothing while loading to prevent flicker
    <div className="w-32 h-9"></div>
    ) : user ? (
    <div className="relative">
     <button
      className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white transition-all duration-200 shadow-md hover:shadow-lg"
      onClick={() => setShowUserMenu(!showUserMenu)}
     >
      <span className="font-medium">Hi, {user.first_name && user.first_name.trim() ? user.first_name : (user.email ? user.email.split('@')[0] : 'User')}</span>
      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
     </button>
     
     {showUserMenu && (
      <div className="absolute right-0 mt-2 w-56 bg-background border border-border rounded-lg shadow-xl py-2 z-50">
       <button
        className="w-full text-left px-4 py-2.5 hover:bg-primary/10 transition-colors flex items-center space-x-2 text-foreground"
        onClick={() => { setShowUserMenu(false); window.navigate('/profile'); }}
       >
        <User className="h-4 w-4" />
        <span>My Profile</span>
       </button>
       <button
        className="w-full text-left px-4 py-2.5 hover:bg-primary/10 transition-colors flex items-center space-x-2 text-foreground"
        onClick={() => { setShowUserMenu(false); window.navigate('/billing'); }}
       >
        <CreditCard className="h-4 w-4" />
        <span>Billing & Subscription</span>
       </button>
       <div className="border-t border-border my-1"></div>
       <button
        className="w-full text-left px-4 py-2.5 hover:bg-destructive/10 transition-colors flex items-center space-x-2 text-destructive"
        onClick={() => { setShowUserMenu(false); logout(); }}
       >
        <LogOut className="h-4 w-4" />
        <span>Sign Out</span>
       </button>
      </div>
     )}
    </div>
    ) : (
    <Button 
     size="sm"
     className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg px-6 py-2 shadow-md hover:shadow-lg transition-all duration-200"
     onClick={() => window.showAuth()}
    >
     Sign In
    </Button>
    )}
   </div>
   </div>

   {/* Mobile menu button */}
   <div className="md:hidden">
   <Button
    variant="ghost"
    size="icon"
    onClick={() => setIsMenuOpen(!isMenuOpen)}
   >
    {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
   </Button>
   </div>
  </div>

  {/* Mobile Navigation */}
  {isMenuOpen && (
   <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border">
   <div className="px-4 py-4 space-y-2">
    <a 
    to="/" 
    className="block px-4 py-3 text-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200 text-white"
    onClick={() => setIsMenuOpen(false)}
    >
    Home
    </a>
    {isHomePage ? (
    <a 
     href="#solutions" 
     className="block px-4 py-3 text-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200 text-white"
     onClick={() => setIsMenuOpen(false)}
    >
     Solutions
    </a>
    ) : (
    <a 
     to="/#solutions" 
     className="block px-4 py-3 text-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200 text-white"
     onClick={() => setIsMenuOpen(false)}
    >
     Solutions
    </a>
    )}
    {isHomePage ? (
    <a 
     href="#healthcare" 
     className="block px-4 py-3 text-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200 text-white"
     onClick={() => setIsMenuOpen(false)}
    >
     Healthcare
    </a>
    ) : (
    <a 
     to="/#healthcare" 
     className="block px-4 py-3 text-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200 text-white"
     onClick={() => setIsMenuOpen(false)}
    >
     Healthcare
    </a>
    )}
    {isHomePage ? (
    <a 
     href="#education" 
     className="block px-4 py-3 text-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200 text-white"
     onClick={() => setIsMenuOpen(false)}
    >
     Education
    </a>
    ) : (
    <a 
     to="/#education" 
     className="block px-4 py-3 text-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200 text-white"
     onClick={() => setIsMenuOpen(false)}
    >
     Education
    </a>
    )}
    <a 
    to="/about" 
    className="block px-4 py-3 text-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200 text-white"
    onClick={() => setIsMenuOpen(false)}
    >
    About
    </a>
    <a 
    to="/contact" 
    className="block px-4 py-3 text-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200 text-white"
    onClick={() => setIsMenuOpen(false)}
    >
    Contact
    </a>
    <div className="pt-2 border-t border-border space-y-2">
    <Button 
     className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-white"
     onClick={() => {
     window.navigate('/experience')
     setIsMenuOpen(false)
     }}
    >
     Experience Dalsi
    </Button>
    
    {/* Mobile Auth Buttons */}
    {!loading && (
     user ? (
     <div className="space-y-2">
      <div className="text-sm text-muted-foreground text-center mb-2">
      Welcome, {user.first_name || user.email.split('@')[0]}
      </div>
      <button
      className="w-full text-left px-4 py-2.5 hover:bg-primary/10 transition-colors flex items-center space-x-2 text-foreground rounded-lg"
      onClick={() => { setIsMenuOpen(false); window.navigate('/profile'); }}
      >
      <User className="h-4 w-4" />
      <span>My Profile</span>
      </button>
      <button
      className="w-full text-left px-4 py-2.5 hover:bg-primary/10 transition-colors flex items-center space-x-2 text-foreground rounded-lg"
      onClick={() => { setIsMenuOpen(false); window.navigate('/billing'); }}
      >
      <CreditCard className="h-4 w-4" />
      <span>Billing & Subscription</span>
      </button>
      <button
      className="w-full text-left px-4 py-2.5 hover:bg-destructive/10 transition-colors flex items-center space-x-2 text-destructive rounded-lg"
      onClick={() => { setIsMenuOpen(false); logout(); }}
      >
      <LogOut className="h-4 w-4" />
      <span>Sign Out</span>
      </button>
     </div>
     ) : (
     <div className="space-y-2">
      <Button 
      variant="outline"
      className="w-full"
      onClick={() => {
       window.showAuth()
       setIsMenuOpen(false)
      }}
      >
      Sign In
      </Button>
      <Button 
      className="w-full bg-accent hover:bg-accent/90"
      onClick={() => {
       window.showAuth()
       setIsMenuOpen(false)
      }}
      >
      Get Started
      </Button>
     </div>
     )
    )}
    </div>
   </div>
   </div>
  )}
  </div>
 </nav>
 )
}

