import { useState, useEffect, useRef, useCallback } from 'react'
import Navigation from './Navigation'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader } from './ui/card'
import { 
 Send, 
 Plus, 
 MessageSquare, 
 User, 
 Bot, 
 Trash2, 
 Edit3, 
 MoreVertical,
 ThumbsUp,
 ThumbsDown,
 Copy,
 Share,
 Menu,
 X,
 Code,
 Download,
 Check,
 Image as ImageIcon,
 Sparkles,
 Crown,
 Zap,
 Upload,
 AlertCircle,
 Settings,
 Archive,
 ChevronDown,
 StopCircle,
 Loader2,
 DollarSign
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import * as dalsiAPI from '../lib/dalsiAPI'
import { useAuth } from '../contexts/AuthContext'
import { cleanTextForDB } from '../lib/textCleaner'
import { ChatOptionsMenu } from './ChatOptionsMenu'
const textEncoder = new TextEncoder()
import ExperienceNav from './ExperienceNav'
import { logChatApiCall, logGuestApiCall, getClientIp } from '../services/apiLogging'
import { trackFunnelStep } from '../services/analyticsAPI'
import { loggingDiagnostics } from '../services/loggingDiagnostics'
import { 
 getUsageStatus, 
 incrementGuestMessageCount,
 canGuestSendMessage,
 canUserSendMessage,
 getGuestMessageCount,
 fetchGuestLimit,
 fetchPlanLimits,
 getGuestLimit
} from '../lib/usageTracking'
import logo from '../assets/DalSiAILogo2.png'
import neoDalsiLogo from '../assets/neoDalsiLogo.png'
import { checkFriction, logFrictionAction } from '../services/frictionAPI'

// Code syntax highlighting component
const CodeBlock = ({ code, language = 'javascript' }) => {
 const [copied, setCopied] = useState(false)

 const copyCode = () => {
 navigator.clipboard.writeText(code)
 setCopied(true)
 setTimeout(() => setCopied(false), 2000)
 }

 return (
 <div className="relative bg-card rounded-lg border border-border my-4 overflow-hidden">
  <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
  <div className="flex items-center space-x-2">
   <Code className="h-4 w-4 text-muted-foreground" />
   <span className="text-sm font-medium text-muted-foreground">{language}</span>
  </div>
  <Button
   variant="ghost"
   size="sm"
   onClick={copyCode}
   className="h-6 px-2 text-muted-foreground hover:text-white"
  >
   {copied ? (
   <Check className="h-3 w-3 text-green-400" />
   ) : (
   <Copy className="h-3 w-3" />
   )}
  </Button>
  </div>
  <div className="p-4 overflow-x-auto">
  <pre className="text-sm text-foreground whitespace-pre-wrap">
   <code>{code}</code>
  </pre>
  </div>
 </div>
 )
}

// Enhanced message content renderer with professional typography
const MessageContent = ({ content, sources }) => {
 const [copied, setCopied] = useState(false)

 const copyFullMessage = () => {
 navigator.clipboard.writeText(content)
 setCopied(true)
 setTimeout(() => setCopied(false), 2000)
 }

 // Enhanced content parser for better formatting
 const parseContent = (text) => {
 const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
 const parts = []
 let lastIndex = 0
 let match

 while ((match = codeBlockRegex.exec(text)) !== null) {
  // Add text before code block
  if (match.index > lastIndex) {
  parts.push({
   type: 'text',
   content: text.slice(lastIndex, match.index)
  })
  }

  // Add code block
  parts.push({
  type: 'code',
  language: match[1] || 'text',
  content: match[2].trim()
  })

  lastIndex = match.index + match[0].length
 }

 // Add remaining text
 if (lastIndex < text.length) {
  parts.push({
  type: 'text',
  content: text.slice(lastIndex)
  })
 }

 return parts.length > 0 ? parts : [{ type: 'text', content: text }]
 }

 // Render text with enhanced typography
 const renderFormattedText = (text) => {
 // Split by double line breaks for paragraphs
 const paragraphs = text.split('\n\n')
 
 return paragraphs.map((paragraph, pIndex) => {
  if (!paragraph.trim()) return null
  
  // Check if it's a heading (starts with **)
  if (paragraph.startsWith('**') && paragraph.includes('**')) {
  const lines = paragraph.split('\n')
  return (
   <div key={pIndex} className="mb-6">
   {lines.map((line, lIndex) => {
    if (line.startsWith('**') && line.endsWith('**')) {
    // Main heading
    const headingText = line.replace(/\*\*/g, '')
    return (
     <h3 key={lIndex} className="text-lg font-semibold text-foreground mb-3 flex items-center">
     <div className="w-1 h-6 bg-primary rounded-full mr-3 text-white"></div>
     {headingText}
     </h3>
    )
    } else if (line.startsWith('**') && line.includes('**')) {
    // Subheading with description
    const parts = line.split('**')
    const title = parts[1]
    const description = parts[2]
    return (
     <div key={lIndex} className="mb-4 pl-4 border-l-2 border-muted">
     <h4 className="font-medium text-foreground mb-1">{title}</h4>
     <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
     </div>
    )
    } else if (line.startsWith('•')) {
    // Bullet points
    return (
     <div key={lIndex} className="flex items-start mb-2 pl-4">
     <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0 text-white"></div>
     <span className="text-sm text-foreground">{line.substring(2)}</span>
     </div>
    )
    } else if (line.trim()) {
    // Regular text
    return (
     <p key={lIndex} className="text-sm text-muted-foreground leading-relaxed mb-2">
     {line}
     </p>
    )
    }
    return null
   })}
   </div>
  )
  } else {
  // Regular paragraph
  return (
   <p key={pIndex} className="text-sm text-foreground leading-relaxed mb-4">
   {paragraph}
   </p>
  )
  }
 })
 }

 const contentParts = parseContent(content)

 return (
 <div className="relative group">
  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
  <Button
   variant="ghost"
   size="sm"
   onClick={copyFullMessage}
   className="h-6 w-6 p-0"
  >
   {copied ? (
   <Check className="h-3 w-3 text-green-500" />
   ) : (
   <Copy className="h-3 w-3" />
   )}
  </Button>
  </div>
  
  <div className="font-sans">
  {contentParts.map((part, index) => (
   <div key={index}>
   {part.type === 'text' ? (
    <div className="pr-8">
    {renderFormattedText(part.content)}
    </div>
   ) : (
    <CodeBlock code={part.content} language={part.language} />
   )}
   </div>
  ))}
  </div>
 </div>
 )
}

// Model selector component
const ModelSelector = ({ selectedModel, onModelChange, availableModels, userUsageCount, userSubscription, user, guestLimit }) => {
 const [isOpen, setIsOpen] = useState(false)

 return (
 <div className="relative">
  <Button
  variant="outline"
  onClick={() => setIsOpen(!isOpen)}
  className="flex items-center space-x-2 min-w-[160px] justify-between"
  >
  <div className="flex items-center space-x-2">
   {selectedModel === 'dalsi-aivi' ? (
   <Sparkles className="h-4 w-4 text-purple-500" />
   ) : (
   <Zap className="h-4 w-4 text-blue-500" />
   )}
   <span className="text-sm font-medium">
   {availableModels.find(m => m.id === selectedModel)?.name || 'DalSiAI'}
   </span>
  </div>
  <Settings className="h-3 w-3" />
  </Button>

  {isOpen && (
  <div className="absolute top-full left-0 mt-2 w-80 bg-popover text-popover-foreground border border-border rounded-lg shadow-lg z-50">
   <div className="p-3 border-b border-border">
   <h3 className="font-semibold text-sm">Select AI Model</h3>
   </div>
   <div className="p-2 space-y-1">
   {availableModels.map((model) => {
    const isSelected = selectedModel === model.id
    const isGuest = !user
    const actualGuestLimit = guestLimit || 5
    const hasAccess = model.available || (model.id === 'dalsi-ai' && (user || userUsageCount < actualGuestLimit))
    const remainingUses = isGuest ? (actualGuestLimit - userUsageCount) : null
    
    return (
    <div
     key={model.id}
     className={`p-3 rounded-lg cursor-pointer transition-colors ${
     isSelected 
      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700' 
      : hasAccess 
      ? 'hover:bg-gray-50 dark:hover:bg-gray-700' 
      : 'opacity-50 cursor-not-allowed'
     }`}
     onClick={() => {
     if (hasAccess) {
      onModelChange(model.id)
      setIsOpen(false)
     }
     }}
    >
     <div className="flex items-start justify-between">
     <div className="flex items-center space-x-3">
      {model.id === 'dalsi-aivi' ? (
      <Sparkles className="h-5 w-5 text-purple-500 flex-shrink-0" />
      ) : (
      <Zap className="h-5 w-5 text-blue-500 flex-shrink-0" />
      )}
      <div>
      <div className="flex items-center space-x-2">
       <span className="font-medium text-sm">{model.name}</span>
       {model.requiresSubscription && (
       <Crown className="h-3 w-3 text-yellow-500" />
       )}
      </div>
      <p className="text-xs text-muted-foreground mt-1">
       {model.description}
      </p>
      {model.id === 'dalsi-ai' && isGuest && remainingUses > 0 && (
       <p className="text-xs text-green-600 dark:text-green-400 mt-1">
       {remainingUses} free use{remainingUses !== 1 ? 's' : ''} remaining
       </p>
      )}
      {model.id === 'dalsi-ai' && user && (
       <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
       Available for logged-in users
       </p>
      )}
      </div>
     </div>
     {!hasAccess && !user && (
      <Button size="sm" variant="outline" className="text-xs" onClick={(e) => { e.stopPropagation(); window.showAuth(); }}>
      Sign In
      </Button>
     )}
     {!hasAccess && user && model.requiresSubscription && (
      <Button size="sm" variant="outline" className="text-xs">
      Upgrade
      </Button>
     )}
     </div>
    </div>
    )
   })}
   </div>
  </div>
  )}
 </div>
 )
}

// Cinematic usage limit warning component
const UsageLimitWarning = ({ usageStatus, onUpgrade, onLogin }) => {
 // Guest user needs to login
 if (usageStatus.needsLogin) {
 return (
  <div className="mx-4 mb-4 relative overflow-hidden">
  <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-sm rounded-xl"></div>
  <div className="relative p-4 border border-blue-500/30 rounded-xl shadow-lg shadow-blue-500/20">
   <div className="flex items-center justify-between">
   <div className="flex items-center space-x-4">
    <div className="p-3 bg-blue-500/20 rounded-xl backdrop-blur-sm">
    <AlertCircle className="h-6 w-6 text-blue-400" />
    </div>
    <div>
    <h3 className="font-bold text-lg text-blue-100 mb-1">
     Sign In to Continue
    </h3>
    <p className="text-sm text-blue-300">
     You've used your free guest message. Sign in to get 3 more free messages!
    </p>
    </div>
   </div>
   <Button 
    onClick={onLogin} 
    className="bg-blue-500 hover:bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-105"
   >
    Sign In
   </Button>
   </div>
  </div>
  </div>
 )
 }

 // Logged-in user needs to upgrade
 if (usageStatus.needsSubscription) {
 return (
  <div className="mx-4 mb-4 relative overflow-hidden">
  <div className="absolute inset-0 bg-purple-900/20 backdrop-blur-sm rounded-xl"></div>
  <div className="relative p-4 border border-purple-500/30 rounded-xl shadow-lg shadow-purple-500/20">
   <div className="flex items-center justify-between">
   <div className="flex items-center space-x-4">
    <div className="p-3 bg-purple-500/20 rounded-xl backdrop-blur-sm">
    <Crown className="h-6 w-6 text-purple-400" />
    </div>
    <div>
    <h3 className="font-bold text-lg text-purple-100 mb-1">
     Unlock Your Full Potential
    </h3>
    <p className="text-sm text-purple-300">
     You've reached your free message limit. Upgrade to a Pro plan for unlimited access.
    </p>
    </div>
   </div>
   <Button 
    onClick={onUpgrade} 
    className="bg-purple-500 hover:bg-purple-600 text-white font-bold shadow-lg shadow-purple-500/30 transition-all duration-300 hover:scale-105"
   >
    Upgrade Now
   </Button>
   </div>
  </div>
  </div>
 )
 }

 return null
}

const EnhancedChatInterface = () => {
 const { user, authLoading, logout, guestSessionId } = useAuth()
 const [messages, setMessages] = useState([
 {
  id: 'welcome',
  sender: 'ai',
  content: 'Welcome to the DalSi AI Experience! I am your personal AI assistant, ready to help with any questions you have about Healthcare, Education, or AI. How can I assist you today?',
  timestamp: new Date().toISOString()
 }
 ])
 const [inputMessage, setInputMessage] = useState('')
 const [isLoading, setIsLoading] = useState(false)
 const [currentChatId, setCurrentChatId] = useState(null)
 const [chats, setChats] = useState([])
 const [sidebarOpen, setSidebarOpen] = useState(true)
 const [selectedModel, setSelectedModel] = useState('dalsi-ai')
 const [availableModels, setAvailableModels] = useState([])
 const [userUsageCount, setUserUsageCount] = useState(0)
 const [userSubscription, setUserSubscription] = useState(null)
 const [planLimits, setPlanLimits] = useState(null)
 const [apiHealthy, setApiHealthy] = useState({ 'dalsi-ai': null, 'dalsi-aivi': null })
 const [selectedImage, setSelectedImage] = useState(null)
 const [imagePreview, setImagePreview] = useState(null)
 const [showArchives, setShowArchives] = useState(false)
 const [isStreaming, setIsStreaming] = useState(false)
 const [streamingMessage, setStreamingMessage] = useState('')
 const [isWaitingForResponse, setIsWaitingForResponse] = useState(false)
 const [isGuestLimitLoading, setIsGuestLimitLoading] = useState(true) // <--- NEW: Loading state
	 const [guestUserId, setGuestUserId] = useState(null)
 const [clientIp, setClientIp] = useState(null)
 const [guestMessageCount, setGuestMessageCount] = useState(getGuestMessageCount())
 const [frictionModalData, setFrictionModalData] = useState(null)
 const [isFrictionModalOpen, setIsFrictionModalOpen] = useState(false)
 const [errorMessage, setErrorMessage] = useState(null) // NEW: Track API errors

 const messagesEndRef = useRef(null)
 const fileInputRef = useRef(null)
 const abortControllerRef = useRef(null)

 useEffect(() => { const initializeChat = async () => {
  console.log('🚀 Starting chat initialization...')
  console.log('🔍 Current auth state - Loading:', authLoading, 'User:', user ? user.email : 'null')
  
  // WAIT for auth loading to complete before proceeding
  if (authLoading) {
   console.log('⏳ Auth still loading, waiting for it to complete...')
   return
  }
  
  console.log('✅ Auth check complete. User:', user ? user.email : 'null')
  console.log('🔍 User object:', user)
  
  // NEW: Fetch dynamic guest limit and set loading state
  console.log('🌐 Fetching dynamic guest limit...')
  await fetchGuestLimit()
  setIsGuestLimitLoading(false)
  console.log('✅ Dynamic guest limit loaded.')
  
  // Initialize diagnostics
  console.log('📊 Initializing logging diagnostics...')
  if (window.loggingDiagnostics) {
   console.log('✅ Diagnostics system ready')
  } else {
   console.warn('⚠️ Diagnostics system not available')
  }
  
  await checkUser()
  await loadAvailableModels()
  await checkAPIHealth()
  
  // Fetch client IP address for guest tracking
  console.log('🌐 Fetching client IP address...')
  const ip = await getClientIp()
  console.log('IP fetch result:', ip)
  if (ip) {
   setClientIp(ip)
   console.log('📋 Client IP captured:', ip)
  } else {
   console.warn('⚠️ Could not fetch client IP')
  }
  
	  // Fetch or create guest user ID for logging
	  if (!user) {
	   console.log('🔍 User not authenticated, initializing guest user...')
	   await initializeGuestUser()
	  } else {
	   console.log('✅ User authenticated:', user.email)
	  }
  
  // Track funnel step: guest_created or account_created (if logged in)
  if (user) {
    trackFunnelStep(user.id, 'account_created', { email: user.email })
  } else if (guestUserId) {
    trackFunnelStep(guestUserId, 'guest_created', { ip_address: clientIp })
  }
  
  // Migrate guest messages to database when user logs in
  if (user) {
  await migrateGuestMessages()
  } else {
  // Load guest messages from localStorage if not logged in
  const savedGuestMessages = localStorage.getItem('guest_messages')
  if (savedGuestMessages) {
   try {
   const guestMessages = JSON.parse(savedGuestMessages)
   if (guestMessages.length > 0) {
    console.log('📥 Loading', guestMessages.length, 'guest messages from localStorage')
    // Clean messages loaded from localStorage
    const cleanedMessages = guestMessages.map(msg => ({
     ...msg,
     content: cleanTextForDB(msg.content || '')
    }))
    setMessages(cleanedMessages)
    // Save cleaned messages back to localStorage
    localStorage.setItem('guest_messages', JSON.stringify(cleanedMessages))
    console.log('🧹 Cleaned guest messages from localStorage')
   }
   } catch (error) {
   console.error('Error loading guest messages:', error)
   }
  }
  }
 }
 
 initializeChat()
}, [user, authLoading])

 const scrollToBottom = () => {
 messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
 }

 const migrateGuestMessages = async () => {
 try {
  // Get session ID from context or localStorage
  let sessionId = guestSessionId || localStorage.getItem('guest_session_id')
  
  if (!sessionId) {
  console.log('ℹ️ No guest session ID found, skipping migration')
  return
  }

  console.log('🔍 Checking for guest conversations with session:', sessionId)

  // First, check localStorage for guest messages
  let guestMessages = []
  const savedGuestMessages = localStorage.getItem('guest_messages')
  if (savedGuestMessages) {
  try {
   const parsedMessages = JSON.parse(savedGuestMessages)
   if (parsedMessages && parsedMessages.length > 0) {
   console.log('📦 Found', parsedMessages.length, 'guest messages in localStorage')
   guestMessages = parsedMessages
   }
  } catch (error) {
   console.error('Error parsing guest messages from localStorage:', error)
  }
  }

  // If no messages in localStorage, check database
  if (guestMessages.length === 0) {
  const { data: guestConversation, error: fetchError } = await supabase
   .from('guest_conversations')
   .select('*')
   .eq('session_id', sessionId)
   .maybeSingle()

  if (fetchError) {
   console.error('Error fetching guest conversation:', fetchError)
   return
  }

  if (!guestConversation) {
   console.log('ℹ️ No guest conversation found in database or localStorage')
   return
  }

  guestMessages = guestConversation.messages || []
  }
  
  if (guestMessages.length === 0) {
  console.log('ℹ️ No messages to migrate')
  // Clean up empty entry
  await supabase.from('guest_conversations').delete().eq('session_id', sessionId)
  return
  }

  console.log('🔄 Migrating', guestMessages.length, 'guest messages to user account...')

  // Create a new chat for guest messages
  const firstUserMessage = guestMessages.find(m => m.sender === 'user')
  const chatTitle = firstUserMessage 
  ? firstUserMessage.content.split(' ').slice(0, 5).join(' ').substring(0, 40)
  : 'Guest Conversation'

  const { data: newChat, error: chatError } = await supabase
  .from('chats')
  .insert([{
   user_id: user.id,
   title: chatTitle,
   model_type: selectedModel
  }])
  .select()
  .single()

  if (chatError) {
  console.error('❌ Error creating chat for migration:', chatError)
  throw chatError
  }

  console.log('✅ Created new chat:', newChat.id, 'Title:', chatTitle)

  // Save all guest messages to the database
  for (const msg of guestMessages) {
  // Clean message content before saving
  const cleanContent = cleanTextForDB(msg.content)
  const { error: msgError } = await supabase
   .from('messages')
   .insert([{
   chat_id: newChat.id,
   sender: msg.sender,
   content: cleanContent,
   content_type: 'text',
   metadata: {
    migrated_from_guest: true,
    original_timestamp: msg.timestamp,
    model: selectedModel // Store model name in metadata, not model_id
   },
   context_data: { timestamp: msg.timestamp }
   }])
  
  if (msgError) {
   console.error('❌ Error saving message:', msgError)
  }
  }

  console.log('✅ All messages saved to database')

  // Set the new chat as current and load messages
  setCurrentChatId(newChat.id)
  setMessages(guestMessages)
  
  // Reload chats to show the new chat in sidebar
  await loadChats()
  console.log('✅ Chats reloaded, new chat should appear in sidebar')
  
  // Delete guest conversation from database
  const { error: deleteError } = await supabase
  .from('guest_conversations')
  .delete()
  .eq('session_id', sessionId)
  
  if (deleteError) {
  console.error('⚠️ Error deleting guest conversation:', deleteError)
  } else {
  console.log('🗑️ Guest conversation deleted from database')
  }
  
  // Clear guest messages and session from localStorage
  localStorage.removeItem('guest_messages')
  localStorage.removeItem('guest_session_id')
  localStorage.removeItem('dalsi_guest_messages')
  console.log('🧹 Cleaned up guest data from localStorage')
 } catch (error) {
  console.error('❌ Error migrating guest messages:', error)
 }
 }

 useEffect(() => {
 if (user) {
  loadChats()
  fetchUserUsage()
 } else {
  setChats([])
  setMessages([
  {
   id: 'welcome',
   sender: 'ai',
   content: 'Welcome to the DalSi AI Experience! I am your personal AI assistant, ready to help with any questions you have about Healthcare, Education, or AI. How can I assist you today?',
   timestamp: new Date().toISOString()
  }
  ])
 }
 }, [user])

 useEffect(() => {
 scrollToBottom()
 }, [messages, streamingMessage])

 const checkUser = async () => {
  // This function is handled by the AuthContext, but we can add checks here if needed
 }

 const loadAvailableModels = async () => {
  console.log('🔄 Loading available AI models...')
  try {
  const models = await dalsiAPI.getAvailableModels()
  setAvailableModels(models)
  console.log('✅ Models loaded:', models.map(m => m.name).join(', '))
  } catch (error) {
  console.error('❌ Error loading models:', error)
  }
 }

 const checkAPIHealth = async () => {
  console.log('🩺 Checking API health...')
  const healthStatuses = await dalsiAPI.checkAPIHealth()
  setApiHealthy(healthStatuses)
  console.log('✅ API health checked:', healthStatuses)
 }

 const fetchUserUsage = async () => {
  if (!user) return
  console.log('🔄 Fetching user usage data...')
  try {
  // First get all chats for the user
  const { data: userChats, error: chatsError } = await supabase
   .from('chats')
   .select('id')
   .eq('user_id', user.id)

  if (chatsError) throw chatsError

  // Get all chat IDs
  const chatIds = userChats.map(chat => chat.id)
  
  // Count messages from user in those chats
  let data = []
  let error = null
  if (chatIds.length > 0) {
    const result = await supabase
     .from('messages')
     .select('id', { count: 'exact' })
     .in('chat_id', chatIds)
     .eq('sender', 'user')
    data = result.data
    error = result.error
  }

  if (error) throw error

  setUserUsageCount(data.length)
  console.log('📊 User has sent', data.length, 'messages')

  // Fetch subscription status
  const { data: sub, error: subError } = await supabase
   .from('user_subscriptions')
   .select('*')
   .eq('user_id', user.id)
   .eq('status', 'active')
   .maybeSingle()

  if (subError) throw subError

  setUserSubscription(sub)
  console.log('💳 User subscription status:', sub ? sub.plan_type : 'none')
  
  // Fetch plan limits based on subscription tier
  const tierName = sub?.plan_type || user.subscription_tier || 'free'
  console.log('📊 Fetching plan limits for tier:', tierName)
  const limits = await fetchPlanLimits(tierName)
  setPlanLimits(limits)
  console.log('✅ Plan limits loaded:', limits)
  } catch (error) {
  console.error('❌ Error fetching user usage:', error)
  }
 }

 const loadChats = async () => {
  if (!user) return
  console.log('🔄 Loading user chats...')
  try {
  const { data, error } = await supabase
   .from('chats')
   .select('*')
   .eq('user_id', user.id)
   .order('created_at', { ascending: false })

  if (error) throw error

  setChats(data)
  console.log('✅ Loaded', data.length, 'chats')
  } catch (error) {
  console.error('❌ Error loading chats:', error)
  }
 }

 const createNewChat = () => {
  setCurrentChatId(null)
  setMessages([
  {
   id: 'welcome',
   sender: 'ai',
   content: 'New chat started. How can I help you?',
   timestamp: new Date().toISOString()
  }
  ])
  console.log('✨ New chat created')
 }

 const selectChat = async (chatId) => {
  console.log('🔄 Selecting chat:', chatId)
  setCurrentChatId(chatId)
  try {
  const { data, error } = await supabase
   .from('messages')
   .select('*')
   .eq('chat_id', chatId)
   .order('timestamp', { ascending: true })

  if (error) throw error

  setMessages(data)
  console.log('✅ Loaded', data.length, 'messages for chat', chatId)
  } catch (error) {
  console.error('❌ Error loading messages for chat:', error)
  }
 }

 const handleDeleteChat = async (chatId) => {
  if (confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
  console.log('🗑️ Deleting chat:', chatId)
  try {
   // First, delete all messages in the chat
   const { error: msgError } = await supabase
   .from('messages')
   .delete()
   .eq('chat_id', chatId)
   
   if (msgError) throw msgError
   
   // Then, delete the chat itself
   const { error: chatError } = await supabase
   .from('chats')
   .delete()
   .eq('id', chatId)

   if (chatError) throw chatError

   console.log('✅ Chat deleted successfully')
   setChats(chats.filter(c => c.id !== chatId))
   if (currentChatId === chatId) {
   createNewChat()
   }
  } catch (error) {
   console.error('❌ Error deleting chat:', error)
   alert('Failed to delete chat.')
  }
  }
 }

 const handleRenameChat = async (chatId, newTitle) => {
  console.log('✏️ Renaming chat', chatId, 'to', newTitle)
  try {
  const { error } = await supabase
   .from('chats')
   .update({ title: newTitle })
   .eq('id', chatId)

  if (error) throw error

  console.log('✅ Chat renamed successfully')
  setChats(chats.map(c => c.id === chatId ? { ...c, title: newTitle } : c))
  } catch (error) {
  console.error('❌ Error renaming chat:', error)
  alert('Failed to rename chat.')
  }
 }

 const handleArchiveChat = async (chatId) => {
  console.log('🗄️ Archiving chat:', chatId)
  try {
  const { error } = await supabase
   .from('chats')
   .update({ archived: true })
   .eq('id', chatId)

  if (error) throw error

  console.log('✅ Chat archived successfully')
  setChats(chats.map(c => c.id === chatId ? { ...c, archived: true } : c))
  } catch (error) {
  console.error('❌ Error archiving chat:', error)
  alert('Failed to archive chat.')
  }
 }

 const handleUnarchiveChat = async (chatId) => {
  console.log('📂 Unarchiving chat:', chatId)
  try {
  const { error } = await supabase
   .from('chats')
   .update({ archived: false })
   .eq('id', chatId)

  if (error) throw error

  console.log('✅ Chat unarchived successfully')
  setChats(chats.map(c => c.id === chatId ? { ...c, archived: false } : c))
  } catch (error) {
  console.error('❌ Error unarchiving chat:', error)
  alert('Failed to unarchive chat.')
  }
 }

 const saveMessage = async (chatId, sender, content, metadata = {}) => {
  console.log('💾 Saving message...', { chatId, sender, contentLength: content?.length })
  try {
  // Clean content before saving to database
  const cleanContent = cleanTextForDB(content)
  console.log('🧹 Content cleaned, length:', cleanContent?.length)
  // Extract context_data and token_count from metadata if available
  let contextData = null
  let tokenCount = null
  
  if (metadata) {
    // Extract processing_time as token_count if available
    if (metadata.processing_time !== undefined && metadata.processing_time !== null) {
      tokenCount = Math.round(metadata.processing_time)
      console.log('📊 Token count extracted:', tokenCount)
    }
    // Save entire metadata as context_data
    contextData = metadata
    console.log('📝 Context data extracted:', contextData)
  }
  
  const messageData = {
    chat_id: chatId,
    sender,
    content: cleanContent,
    metadata
  }
  
  // Add optional fields only if they have values
  if (contextData !== null) {
    messageData.context_data = contextData
  }
  if (tokenCount !== null) {
    messageData.token_count = tokenCount
  }
  
  console.log('📤 About to insert message:', { chatId, sender, contentLength: cleanContent?.length })
  const { data, error } = await supabase
   .from('messages')
   .insert([messageData])
   .select()

  if (error) {
    console.error('❌ Insert error:', error)
    throw error
  }
  console.log('✅ Message saved successfully', { insertedId: data?.[0]?.id })
  } catch (error) {
  console.error('❌ Error saving message:', error)
  }
 }

 const initializeGuestUser = async () => {
  let sessionId = localStorage.getItem('guest_session_id')
  if (!sessionId) {
  sessionId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
  localStorage.setItem('guest_session_id', sessionId)
  console.log('✨ New guest session created:', sessionId)
  }
  setGuestUserId(sessionId)
  
  // Guest users don't need a separate guest_users table entry
  // They use the guest_conversations table for message storage
  // and will be logged with user_id from the guest user in the users table
  console.log('✅ Guest user session initialized:', sessionId)
 }

 const saveGuestMessageToDB = async (message) => {
 try {
  const sessionId = guestUserId || localStorage.getItem('guest_session_id')
  if (!sessionId) {
  console.warn('⚠️ No session ID for guest message, cannot save to DB')
  return
  }

  // Get current messages from DB
  const { data: existing, error: fetchError } = await supabase
  .from('guest_conversations')
  .select('messages')
  .eq('session_id', sessionId)
  .maybeSingle()

  if (fetchError) {
  console.error('❌ Error fetching existing guest messages:', fetchError)
  return
  }

  const guestMessages = existing?.messages || []
  guestMessages.push(message)
  
  console.log('💾 Upserting to DB:', {
  session_id: sessionId,
  message_count: guestMessages.length
  })
  
  // Use upsert to prevent duplicates - will insert or update based on session_id
  const { data, error } = await supabase
  .from('guest_conversations')
  .upsert({
   session_id: sessionId,
   messages: guestMessages
  }, {
   onConflict: 'session_id',
   ignoreDuplicates: false
  })
  .select()

  if (error) {
  console.error('❌ Error upserting guest message to DB:', error)
  } else {
  console.log('✅ Guest conversation upserted successfully')
  }
 } catch (error) {
  console.error('❌ Error in saveGuestMessageToDB:', error)
 }
 }

 const handleImageUpload = (event) => {
 const file = event.target.files[0]
 if (!file) return

 try {
  dalsiAPI.validateImageFile(file)
  setSelectedImage(file)
  
  const reader = new FileReader()
  reader.onload = (e) => setImagePreview(e.target.result)
  reader.readAsDataURL(file)
 } catch (error) {
  alert(error.message)
 }
 }

 const removeImage = () => {
 setSelectedImage(null)
 setImagePreview(null)
 if (fileInputRef.current) {
  fileInputRef.current.value = ''
 }
 }

 const handleSendMessage = async () => {
    console.log('🚀 [SEND_MESSAGE] Starting handleSendMessage...')
    console.log('👤 [SEND_MESSAGE] User:', user ? user.email : 'Guest')
    console.log('📝 [SEND_MESSAGE] Input message:', inputMessage.substring(0, 50))
    
    // New Friction API Check
    const userId = user ? user.id : guestUserId;
    const tier = userSubscription?.tier || 'free';
    const messageCount = user ? userUsageCount : guestMessageCount;

    if (userId) {
      const frictionResponse = await checkFriction(userId, tier, messageCount);
      if (frictionResponse.should_show) {
        setFrictionModalData(frictionResponse.friction_data);
        setIsFrictionModalOpen(true);
        // Stop message sending process
        return;
      }
    }

 if ((!inputMessage.trim() && !selectedImage) || isLoading || isStreaming) return

 // Check message limit per chat (11 messages max)
 if (user && currentChatId && messages.length >= 11) {
  alert('This chat has reached the maximum of 11 messages. Please start a new chat to continue.')
  return
 }

 // Auto-create chat if none exists (for logged-in users)
 let activeChatId = currentChatId // Use current chat ID if it exists
 if (user && !currentChatId) {
  try {
  console.log('🔄 Auto-creating chat for first message...')
  
  // Create chat with first few words of message as title
  const messageWords = inputMessage.trim().split(' ').slice(0, 5).join(' ')
  const chatTitle = messageWords.length > 40 ? messageWords.substring(0, 40) + '...' : messageWords
  
  const { data, error } = await supabase
   .from('chats')
   .insert([{ 
   user_id: user.id, 
   title: chatTitle || 'New Chat',
   model_type: selectedModel
   }])
   .select()
   .single()

  if (error) {
   console.error('❌ Error creating chat:', error)
   throw error
  }
  
  console.log('✅ Chat created successfully:', data.id, 'Title:', chatTitle)
  
  // Store the new chat ID for immediate use (avoids race condition)
  activeChatId = data.id
  
  // Set current chat ID in state (for UI updates)
  setCurrentChatId(data.id)
  
  // Reload chat list to show new chat in sidebar
  await loadChats()
  
  console.log('✅ Chat list refreshed')
  } catch (error) {
  console.error('❌ Error auto-creating chat:', error)
  alert('Failed to create chat. Please try again.')
  return // Don't proceed if chat creation fails
  }
 }

 // Check usage limits
 if (!user) {
  // Guest user
  if (!canGuestSendMessage()) {
  handleLogin()
  return
  }
 } else {
  // Logged-in user
  const canSend = canUserSendMessage(userUsageCount, userSubscription, planLimits)
  if (!canSend.canSend) {
  if (canSend.reason === 'limit_reached') {
   handleUpgrade()
  }
  return
  }
 }

 // Check model access
 const accessCheck = await dalsiAPI.checkModelAccess(selectedModel, userUsageCount, userSubscription)
 if (!accessCheck.hasAccess) {
  alert(accessCheck.reason)
  if (accessCheck.upgradeRequired) {
  window.showAuth?.()
  }
  return
 }

 const userMessage = {
  id: Date.now(),
  sender: 'user',
  content: inputMessage.trim() || '[Image uploaded]',
  timestamp: new Date().toISOString(),
  hasImage: !!selectedImage
 }

 setMessages(prev => [...prev, userMessage])
 const currentInput = inputMessage.trim()
 const currentImage = selectedImage
 setInputMessage('')
 removeImage()
 setIsLoading(true)
 setIsStreaming(false)

 // Save user message if authenticated
 console.log('🔍 DEBUG: Checking save condition', { user: !!user, activeChatId, userEmail: user?.email })
 if (user && activeChatId) {
  console.log('💾 About to save user message to chat:', activeChatId)
  await saveMessage(activeChatId, 'user', userMessage.content, {
  has_image: !!currentImage,
  image_name: currentImage?.name
  })
  // Track funnel step: first_message (if it's the first message)
  if (messages.length === 1) {
    trackFunnelStep(user.id, 'first_message', { model: selectedModel })
  }
 } else if (!user) {
  // Track funnel step: first_message (if it's the first message)
  if (messages.length === 1) {
    trackFunnelStep(guestUserId, 'first_message', { model: selectedModel })
  }
  // Save guest message to localStorage AND database
  const guestMessages = JSON.parse(localStorage.getItem('guest_messages') || '[]')
  guestMessages.push(userMessage)
  localStorage.setItem('guest_messages', JSON.stringify(guestMessages))
  
  // Also save to database temp table
  await saveGuestMessageToDB(userMessage)
 }

 console.log('🎯 [SEND_MESSAGE] Entering try block for API call...')
 
 try {
  // Convert image to data URL if present
  let imageDataUrl = null
  if (currentImage && selectedModel === 'dalsi-aivi') {
  imageDataUrl = await dalsiAPI.imageToDataUrl(currentImage)
  }

  // Get message history for context (last 10 messages for better continuity)
  const messageHistory = messages.slice(-10)
  
  // Preprocess message
  const enhancedMessage = dalsiAPI.preprocessMessage(currentInput, messageHistory, selectedModel)
  
  // Create abort controller for this request
  abortControllerRef.current = new AbortController()
  setIsWaitingForResponse(true)
  
  console.log('🌐 [SEND_MESSAGE] About to call streamGenerateText API...')
  console.log('🎯 [SEND_MESSAGE] Selected model:', selectedModel)
  console.log('🔑 [SEND_MESSAGE] Enhanced message length:', enhancedMessage.length)
  
  // Generate AI response using streaming
  await new Promise((resolve, reject) => {
  let fullResponse = ''
  let hasCompleted = false // Prevent multiple completions
  
  dalsiAPI.streamGenerateText(
   enhancedMessage,
   imageDataUrl,
   // onToken callback
   (token) => {
   // Check if aborted
   if (abortControllerRef.current?.signal.aborted) {
    return
   }
   
   if (fullResponse === '') {
    // First token received, start streaming
    setIsStreaming(true)
    setIsWaitingForResponse(false)
   }
   fullResponse += token
   setStreamingMessage(fullResponse)
   },
	   // onComplete callback
	   async (finalResponse, sources = []) => {
   // Prevent multiple completions
   if (hasCompleted) {
    console.log('⚠️ Duplicate completion detected, ignoring')
    return
   }
   hasCompleted = true
   
   // Check if aborted
   if (abortControllerRef.current?.signal.aborted) {
    console.log('🛑 Response aborted by user')
    resolve()
    return
   }

   console.log('✅ AI response received:', finalResponse.substring(0, 100))

   // Log the API call
   const responseTime = Date.now() - userMessage.id
   if (user) {
    // Log authenticated user API call
    await logChatApiCall({
     user_id: user.id,
     endpoint: '/dalsiai/generate',
     method: 'POST',
     status_code: 200,
     response_time_ms: responseTime,
     tokens_used: Math.ceil(finalResponse.length / 4), // Rough estimate
     cost_usd: 0, // Placeholder: Cost calculation is complex and usually done server-side
     subscription_tier: userSubscription?.tier || 'free',
     api_key_id: user.api_key_id || null,
     ip_address: clientIp,
     request_size_bytes: textEncoder.encode(enhancedMessage).length, // Use enhanced message size
     response_size_bytes: textEncoder.encode(finalResponse).length, // Use final response size
     user_agent: navigator.userAgent,
     metadata: {
      model: selectedModel,
      messageLength: inputMessage.length,
      responseLength: finalResponse.length,
      sessionId: currentChatId
     }
    })
	   } else if (clientIp) { // Use clientIp as the final check for guest logging
	    // Log guest API call (user_id will be fetched from guest user in users table)
	    await logGuestApiCall({
	     guest_session_id: guestUserId, // Pass the session ID for metadata
	     endpoint: '/dalsiai/generate',
	     status_code: 200,
	     response_time_ms: responseTime,
	     tokens_used: Math.ceil(finalResponse.length / 4),
	     cost_usd: 0, // Placeholder: Cost calculation is complex and usually done server-side
	     subscription_tier: 'free', // Guest users are always free tier
	     ip_address: clientIp,
	     request_size_bytes: textEncoder.encode(enhancedMessage).length, // Use enhanced message size
	     response_size_bytes: textEncoder.encode(finalResponse).length, // Use final response size
	     user_agent: navigator.userAgent,
	     metadata: {
	      model: selectedModel,
	      messageLength: inputMessage.length,
	      responseLength: finalResponse.length,
	      sessionId: currentChatId,
	      guest_session_id: guestUserId // Ensure guest session ID is in metadata
	     }
	    })
	   }

  const aiResponse = {
   id: Date.now() + 1,
   sender: 'assistant',
	    content: finalResponse,
	    timestamp: new Date().toISOString(),
	    model: selectedModel,
	    sources: sources || [] // Ensure sources is always an array
	   }

   setMessages(prev => [...prev, aiResponse])
   setStreamingMessage('')
   setIsStreaming(false)
   setIsLoading(false)
   setIsWaitingForResponse(false)

   // Save AI response if authenticated
   if (user && activeChatId) {
    console.log('💾 Saving AI response to database...')
    await saveMessage(activeChatId, 'ai', aiResponse.content, {
    model_used: selectedModel,
    content_type: 'text',
    has_code: aiResponse.content.includes('```'),
    processing_time: Date.now() - userMessage.id,
    sources: aiResponse.sources
    })
   } else if (!user) {
    // Save guest AI response to localStorage AND database
    const guestMessages = JSON.parse(localStorage.getItem('guest_messages') || '[]')
    guestMessages.push(aiResponse)
    localStorage.setItem('guest_messages', JSON.stringify(guestMessages))
    
	    // Also save to database temp table
	    await saveGuestMessageToDB(aiResponse)
	    // Note: Sources are saved within aiResponse object
	    // Note: Sources are saved within aiResponse object
	    // Note: Sources are saved within aiResponse object
   }

   // Update usage count
   if (selectedModel === 'dalsi-ai') {
    if (!user) {
    // Increment guest count in localStorage and state
    incrementGuestMessageCount()
    setGuestMessageCount(prev => prev + 1)
    } else if (!userSubscription || userSubscription.status !== 'active') {
    // Increment logged-in user count
    setUserUsageCount(prev => prev + 1)
    }
   }

   resolve()
   },
   // onError callback
   async (error) => {
   console.log('🔴 [ON_ERROR] onError callback triggered!')
   // Prevent multiple error handlers
   if (hasCompleted) {
    console.log('⚠️ [ON_ERROR] Already completed, ignoring duplicate error')
    return
   }
   hasCompleted = true
   
   console.error('❌ [ON_ERROR] Error generating AI response:', error)
   console.error('🔴 [ON_ERROR] Error details:', error.message, error.status)
   
   // Log the error API call
   const responseTime = Date.now() - userMessage.id
   if (user) {
    // Log authenticated user error
    await logChatApiCall({
     user_id: user.id,
     endpoint: '/dalsiai/generate',
     method: 'POST',
     status_code: error.status || 500,
     response_time_ms: responseTime,
     error_message: error.message,
     ip_address: clientIp,
     request_size_bytes: textEncoder.encode(enhancedMessage).length, // Use enhanced message size
     user_agent: navigator.userAgent,
     metadata: {
      model: selectedModel,
      messageLength: inputMessage.length,
      sessionId: currentChatId
     }
    })
	   } else if (clientIp) { // Use clientIp as the final check for guest logging
	    // Log guest error (user_id will be fetched from guest user in users table)
	    await logGuestApiCall({
	     guest_session_id: guestUserId, // Pass the session ID for metadata
	     endpoint: '/dalsiai/generate',
	     status_code: error.status || 500,
	     response_time_ms: responseTime,
	     error_message: error.message,
	     ip_address: clientIp,
	     request_size_bytes: textEncoder.encode(enhancedMessage).length, // Use enhanced message size
	     user_agent: navigator.userAgent,
	     metadata: {
	      model: selectedModel,
	      messageLength: inputMessage.length,
	      sessionId: currentChatId,
	      guest_session_id: guestUserId // Ensure guest session ID is in metadata
	     }
	    })
	   }
   
   const errorResponse = {
    id: Date.now() + 1,
    sender: 'ai',
    content: `I apologize, but I'm experiencing technical difficulties right now. ${error.message}\n\nPlease try again in a moment. If the problem persists, you can:\n\n1. Check your internet connection\n2. Refresh the page\n3. Contact our support team\n\nI'm here to help once the connection is restored!`,
    timestamp: new Date().toISOString()
   }

   setMessages(prev => [...prev, errorResponse])
   setStreamingMessage('')
   setIsStreaming(false)
   setIsLoading(false)
   setIsWaitingForResponse(false)
   reject(error)
   },
   selectedModel, // modelId
   3000, // maxLength - sufficient for context + complete responses
   abortControllerRef.current.signal // Pass abort signal
  )
  })

 } catch (error) {
  console.error('❌❌❌ [ERROR_CATCH] CAUGHT ERROR IN OUTER CATCH BLOCK ❌❌❌')
  console.error('🔴 [ERROR_CATCH] Error type:', error.constructor.name)
  console.error('🔴 [ERROR_CATCH] Error message:', error.message)
  console.error('🔴 [ERROR_CATCH] Error stack:', error.stack)
  console.error('🔴 [ERROR_CATCH] Full error object:', error)
  
  console.log('🚨 [ERROR_CATCH] Setting error banner message...')
  // Show error banner to user
  setErrorMessage('Something went wrong while fetching data. Please try later.')
  console.log('✅ [ERROR_CATCH] Error message state set!')
  
  // Reset loading states
  console.log('🔄 [ERROR_CATCH] Resetting loading states...')
  setStreamingMessage('')
  setIsStreaming(false)
  setIsLoading(false)
  setIsWaitingForResponse(false)
  console.log('✅ [ERROR_CATCH] Loading states reset!')
  
  // Auto-dismiss error after 10 seconds
  console.log('⏰ [ERROR_CATCH] Setting 10-second auto-dismiss timer...')
  setTimeout(() => {
   console.log('⏰ [ERROR_CATCH] Auto-dismissing error message...')
   setErrorMessage(null)
  }, 10000)
  console.log('✅ [ERROR_CATCH] Error handling complete!')
 }
 }

 const handleKeyPress = (e) => {
 if (e.key === 'Enter' && !e.shiftKey) {
  e.preventDefault()
  handleSendMessage()
 }
 }

 const exportChat = () => {
 const chatContent = messages.map(msg => 
  `**${msg.sender === 'user' ? 'You' : 'DalSi AI'}**: ${msg.content}`
 ).join('\n\n')
 
 const blob = new Blob([chatContent], { type: 'text/markdown' })
 const url = URL.createObjectURL(blob)
 const a = document.createElement('a')
 a.href = url
 a.download = `dalsi-chat-${new Date().toISOString().split('T')[0]}.md`
 a.click()
 URL.revokeObjectURL(url)
 }

 const handleUpgrade = () => {
 window.navigate?.('/') // Navigate to pricing section
 }

 const handleLogin = () => {
 window.showAuth?.()
 }

  // Calculate usage status
  const usageStatus = getUsageStatus(!user, userUsageCount, userSubscription, planLimits)
  const showUsageWarning = selectedModel === 'dalsi-ai'

  if (isGuestLimitLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        <span className="ml-3 text-lg">Loading AI Portal...</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
  {/* Navigation - Mobile and Desktop */}
  <div className="md:hidden">
    <Navigation />
  </div>
  
  <div className="flex flex-1 overflow-hidden mt-14 md:mt-0">
  {/* Mobile Sidebar Overlay */}
  {sidebarOpen && (
    <div 
      className="fixed inset-0 bg-black/50 z-40 md:hidden"
      onClick={() => setSidebarOpen(false)}
    />
  )}
  
  {/* Sidebar - Desktop Only */}
  <div className={`
    hidden md:flex
    ${sidebarOpen ? 'md:w-64' : 'md:w-0'}
    md:relative
    transition-all duration-300
    bg-sidebar text-sidebar-foreground
    border-r border-sidebar-border
    flex-col
    overflow-hidden
  `}>
  {/* Sidebar Header */}
  <div className="p-4 border-b border-sidebar-border">
   <div className="flex items-center space-x-3 mb-4 cursor-pointer hover:bg-sidebar-accent/50 rounded-lg p-2 -m-2 transition-colors" onClick={() => window.location.href = '/'}>
   <img src={logo} alt="Dalsi AI" className="h-8 w-8" />
   <div>
    <div className="font-bold text-foreground text-sm">Dalsi AI</div>
    <div className="text-xs text-primary">Experience AI</div>
   </div>
   </div>
   <Button 
   onClick={createNewChat}
   className="w-full bg-purple-600 hover:bg-purple-700 text-white border border-purple-500/30 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm text-white"
   >
   <Plus className="mr-2 h-4 w-4" />
   New Chat
   </Button>
  </div>

  {/* Chat History */}
  <div className="flex-1 overflow-y-auto p-2 space-y-1">
   {chats.filter(c => !c.archived).map(chat => (
   <div 
    key={chat.id}
    className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
    currentChatId === chat.id 
     ? 'bg-primary/10 text-primary border border-primary/20' 
     : 'hover:bg-muted text-muted-foreground'
    }`}
    onClick={() => selectChat(chat.id)}
   >
    <div className="flex items-center space-x-2 overflow-hidden">
    <MessageSquare className="h-4 w-4 flex-shrink-0" />
    <span className="truncate text-sm font-medium">{chat.title}</span>
    </div>
    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
    <ChatOptionsMenu 
     chatId={chat.id}
     chatTitle={chat.title}
     onDelete={() => handleDeleteChat(chat.id)}
     onRename={(newTitle) => handleRenameChat(chat.id, newTitle)}
     onArchive={() => handleArchiveChat(chat.id)}
    />
    </div>
   </div>
   ))}
   
   {/* Archives Section */}
   {chats.filter(c => c.archived).length > 0 && (
   <div className="mt-4 pt-4 border-t border-sidebar-border">
    <div 
    className="flex items-center justify-between p-2 cursor-pointer hover:bg-muted rounded-lg"
    onClick={() => setShowArchives(!showArchives)}
    >
    <div className="flex items-center space-x-2">
     <Archive className="h-4 w-4" />
     <span className="text-sm font-medium">Archives ({chats.filter(c => c.archived).length})</span>
    </div>
    <ChevronDown className={`h-4 w-4 transition-transform ${showArchives ? 'rotate-180' : ''}`} />
    </div>
    
    {showArchives && (
    <div className="mt-2 space-y-1">
     {chats.filter(c => c.archived).map(chat => (
     <div 
      key={chat.id}
      className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
      currentChatId === chat.id 
       ? 'bg-primary/10 text-primary border border-primary/20' 
       : 'hover:bg-muted text-muted-foreground'
      }`}
      onClick={() => selectChat(chat.id)}
     >
      <div className="flex items-center space-x-2 overflow-hidden">
      <MessageSquare className="h-4 w-4 flex-shrink-0" />
      <span className="truncate text-sm font-medium">{chat.title}</span>
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
      <ChatOptionsMenu 
       chatId={chat.id}
       chatTitle={chat.title}
       onDelete={() => handleDeleteChat(chat.id)}
       onRename={(newTitle) => handleRenameChat(chat.id, newTitle)}
       onUnarchive={() => handleUnarchiveChat(chat.id)}
       isArchived={true}
      />
      </div>
     </div>
     ))}
    </div>
    )}
   </div>
   )}
  </div>

  {/* Sidebar Footer */}
  <div className="p-4 border-t border-sidebar-border">
   {authLoading ? (
   <div className="h-10"></div>
   ) : user ? (
   <div className="flex items-center justify-between">
    <div className="flex items-center space-x-2 overflow-hidden">
    <User className="h-5 w-5 text-muted-foreground" />
    <span className="truncate text-sm text-foreground">{user.first_name || user.email}</span>
    </div>
    <Button 
    variant="ghost" 
    size="sm" 
    className="text-xs"
    onClick={logout}
    >
    Logout
    </Button>
   </div>
   ) : (
   <Button className="w-full" onClick={() => window.showAuth?.()}>Sign In</Button>
   )}
  </div>
  </div>

  {/* Main Chat Area */}
  <div className="flex-1 flex flex-col">
  {/* Header - Desktop Only */}
  <div className="hidden md:flex items-center justify-between p-4 border-b border-border bg-background">
   <div className="flex items-center space-x-4">
   <Button
    variant="ghost"
    size="icon"
    onClick={() => setSidebarOpen(!sidebarOpen)}
   >
    {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
   </Button>
   
   {/* Topic-Based Chat Buttons - Desktop */}
   <div className="flex items-center space-x-2">
    <Button 
     variant={selectedModel === 'dalsi-ai' ? 'default' : 'outline'} 
     size="sm" 
     onClick={() => setSelectedModel('dalsi-ai')} 
     className="text-xs px-3 whitespace-nowrap"
    >
     General
    </Button>
    <Button 
     variant={selectedModel === 'dalsi-ai-health' ? 'default' : 'outline'} 
     size="sm" 
     onClick={() => setSelectedModel('dalsi-ai-health')} 
     className="text-xs px-3 whitespace-nowrap"
    >
     Healthcare
    </Button>
    <Button 
     variant={selectedModel === 'dalsi-ai-edu' ? 'default' : 'outline'} 
     size="sm" 
     onClick={() => setSelectedModel('dalsi-ai-edu')} 
     className="text-xs px-3 whitespace-nowrap"
    >
     Education
    </Button>
   </div>
   </div>
   
   <div className="flex items-center space-x-4">
   <ModelSelector
    selectedModel={selectedModel}
    onModelChange={setSelectedModel}
    availableModels={availableModels}
    userUsageCount={userUsageCount}
    userSubscription={userSubscription}
    user={user}
    guestLimit={getGuestLimit()}
   />
   <div className={`flex items-center space-x-2 text-sm ${apiHealthy[selectedModel] ? 'text-green-600' : 'text-red-600'}`}>
    <div className={`w-2 h-2 rounded-full ${apiHealthy[selectedModel] ? 'bg-green-600' : 'bg-red-600'}`}></div>
    <span>{apiHealthy[selectedModel] ? 'Online' : apiHealthy[selectedModel] === false ? 'Offline' : ''}</span>
   </div>
   <Button variant="outline" size="sm" onClick={exportChat}>
    <Download className="mr-2 h-4 w-4" />
    Export
   </Button>
   </div>
  </div>

  {/* Model Selection - Mobile Only */}
  <div className="md:hidden p-3 border-b border-border bg-background">
   <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
    <Button 
     variant={selectedModel === 'dalsi-ai' ? 'default' : 'outline'} 
     size="sm" 
     onClick={() => setSelectedModel('dalsi-ai')} 
     className="text-xs px-3 whitespace-nowrap flex-shrink-0"
    >
     General
    </Button>
    <Button 
     variant={selectedModel === 'dalsi-ai-health' ? 'default' : 'outline'} 
     size="sm" 
     onClick={() => setSelectedModel('dalsi-ai-health')} 
     className="text-xs px-3 whitespace-nowrap flex-shrink-0"
    >
     Healthcare
    </Button>
    <Button 
     variant={selectedModel === 'dalsi-ai-edu' ? 'default' : 'outline'} 
     size="sm" 
     onClick={() => setSelectedModel('dalsi-ai-edu')} 
     className="text-xs px-3 whitespace-nowrap flex-shrink-0"
    >
     Education
    </Button>
   </div>
  </div>

  {/* // Usage Warning (Removed the old UsageLimitWarning)}

  {/* Messages */}
  <div className="flex-1 overflow-y-auto">
   <div className="max-w-4xl mx-auto p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6">
   {messages.map(msg => (
    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div className={`max-w-full sm:max-w-2xl md:max-w-3xl ${msg.sender === 'user' ? 'order-2' : 'order-1'}`}>
     <div className="flex items-start space-x-2 sm:space-x-3">
     {msg.sender === 'ai' && (
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0">
      <img src={neoDalsiLogo} alt="DalSi AI" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
      </div>
     )}
     <Card className={`group relative overflow-hidden backdrop-blur-sm ${
      msg.sender === 'user' 
      ? 'bg-red-600/90 text-white border border-red-500/30 shadow-lg shadow-red-500/20' 
      : 'bg-black/40 text-white border border-purple-500/20 shadow-lg shadow-purple-500/10'
     }`}>
      <div className={`absolute inset-0 ${
      msg.sender === 'user' 
       ? 'bg-red-900/20' 
       : 'bg-purple-900/10'
      } backdrop-blur-sm`}></div>
	      <CardContent className="p-3 sm:p-4 relative z-10 text-sm sm:text-base">
	      <MessageContent content={msg.content} sources={msg.sources} />
	      
	      {/* Source List Display */}
      {msg.sender === 'ai' && msg.id !== 'welcome' && msg.sources && Array.isArray(msg.sources) && msg.sources.length > 0 && (
       <div className="mt-4 pt-3 border-t border-purple-500/30">
        <p className="text-xs font-semibold text-purple-300 mb-1">Key Sources:</p>
        <ul className="list-disc list-inside text-xs text-purple-200 space-y-0.5">
         {msg.sources.map((source, index) => (
	          <li key={index}>
	           <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:text-purple-100 transition-colors">
	            {source.title || `Source ${index + 1}`}
	           </a>
	          </li>
	         ))}
	        </ul>
	       </div>
	      )}

      {msg.sender === 'ai' && msg.id !== 'welcome' && (
       <div className="flex items-center justify-end space-x-2 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
       <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-purple-500/20 text-purple-300 hover:text-purple-200 transition-all duration-200 text-white">
        <ThumbsUp className="h-3 w-3" />
       </Button>
       <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-purple-500/20 text-purple-300 hover:text-purple-200 transition-all duration-200 text-white">
        <ThumbsDown className="h-3 w-3" />
       </Button>
       <Button 
        variant="ghost" 
        size="icon" 
        className="h-7 w-7 hover:bg-purple-500/20 text-purple-300 hover:text-purple-200 transition-all duration-200 text-white"
        onClick={() => navigator.clipboard.writeText(window.location.href)} // Fix: Share button copies current URL
       >
        <Share className="h-3 w-3" />
       </Button>
       </div>
      )}
      </CardContent>
     </Card>
     {msg.sender === 'user' && (
      <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/25 border border-red-500/30">
      <User className="h-5 w-5 text-white" />
      </div>
     )}
     </div>
    </div>
    </div>
   ))}

   {/* Streaming Message Display */}
   {isStreaming && streamingMessage && (
    <div className="flex justify-start">
    <div className="max-w-3xl order-1">
     <div className="flex items-start space-x-3">
     <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
      <img src={neoDalsiLogo} alt="DalSi AI" className="w-10 h-10 object-contain animate-pulse" />
     </div>
     <Card className="group relative overflow-hidden backdrop-blur-sm bg-black/40 text-white border border-purple-500/20 shadow-lg shadow-purple-500/10">
      <div className="absolute inset-0 bg-purple-900/10 backdrop-blur-sm text-white"></div>
      <CardContent className="p-4 relative z-10">
      <MessageContent content={streamingMessage} />
      <div className="flex items-center space-x-2 mt-3 text-purple-300">
       <div className="flex space-x-1">
       <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce text-white"></div>
       <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-100 text-white"></div>
       <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-200 text-white"></div>
       </div>
       <span className="text-xs font-medium">Generating response...</span>
      </div>
      </CardContent>
     </Card>
     </div>
    </div>
    </div>
   )}

   {/* Loading Indicator with Letter Animation */}
   {(isLoading || isWaitingForResponse) && !isStreaming && (
    <div className="flex justify-start">
    <div className="max-w-3xl order-1">
     <div className="flex items-start space-x-3">
     <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
      <img src={neoDalsiLogo} alt="DalSi AI" className="w-10 h-10 object-contain animate-pulse" />
     </div>
     <Card className="bg-black/40 border border-purple-500/20">
      <CardContent className="p-4">
      <div className="flex items-center space-x-3 text-purple-300">
       <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
       <div className="flex items-center space-x-1">
       <span className="text-sm font-medium animate-pulse">
        {selectedModel === 'dalsi-aivi' ? 'DalSi AIVi' : 'DalSi AI'} is preparing response
       </span>
       <span className="inline-flex space-x-0.5">
        <span className="animate-[bounce_1s_ease-in-out_infinite]">.</span>
        <span className="animate-[bounce_1s_ease-in-out_0.1s_infinite]">.</span>
        <span className="animate-[bounce_1s_ease-in-out_0.2s_infinite]">.</span>
       </span>
       </div>
      </div>
      </CardContent>
     </Card>
     </div>
    </div>
    </div>
   )}

   <div ref={messagesEndRef} />
   </div>
  </div>

  {/* Input Area */}
  {/* Error Banner */}
  {errorMessage && (
   <div className="max-w-4xl mx-auto mb-2">
    <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/50">
     <div className="flex items-center space-x-2">
      <AlertCircle className="h-5 w-5 text-red-500" />
      <span className="text-sm font-medium text-red-500">{errorMessage}</span>
     </div>
     <Button 
      variant="ghost" 
      size="sm" 
      onClick={() => setErrorMessage(null)}
      className="h-7 w-7 p-0 hover:bg-red-500/20 text-red-500"
     >
      <X className="h-4 w-4" />
     </Button>
    </div>
   </div>
  )}
  {/* Usage Status Banner */}
  {usageStatus.remaining !== Infinity && (
   <div className="max-w-4xl mx-auto">
    <UsageStatusDisplay 
     usageStatus={usageStatus}
     onUpgrade={handleUpgrade}
     onLogin={handleLogin}
    />
   </div>
  )}
  <div className="p-2 sm:p-3 md:p-4 border-t border-border bg-background">
   {/* Image Preview */}
   {imagePreview && (
   <div className="mb-2 sm:mb-3 md:mb-4 p-2 sm:p-3 bg-muted rounded-lg">
    <div className="flex items-center justify-between">
    <div className="flex items-center space-x-3">
     <img src={imagePreview} alt="Upload preview" className="w-12 h-12 object-cover rounded" />
     <span className="text-sm text-muted-foreground">{selectedImage?.name}</span>
    </div>
    <Button variant="ghost" size="sm" onClick={removeImage}>
     <X className="h-4 w-4" />
    </Button>
    </div>
   </div>
   )}

   <div className="flex items-end space-x-2 sm:space-x-3">
	   <div className="flex-1 relative">
    <Button
     variant="ghost"
     size="icon"
     className="absolute left-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
     onClick={() => alert('Voice input feature coming soon!')} // Placeholder for voice input
    >
     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
    </Button>
    <Input
    placeholder={usageStatus.needsLogin ? `Daily limit exhausted` : (selectedModel === 'dalsi-aivi' ? "Ask or upload..." : "Ask anything...")}
    value={inputMessage}
    onChange={(e) => setInputMessage(e.target.value)}
    onKeyPress={handleKeyPress}
    disabled={isLoading || isStreaming || usageStatus.needsLogin || usageStatus.needsSubscription}
    className="pl-10 sm:pl-12 pr-10 sm:pr-12 min-h-[44px] sm:min-h-[48px] resize-none text-sm sm:text-base"
    />
    {selectedModel === 'dalsi-aivi' && (
    <Button
     variant="ghost"
     size="icon"
     className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
     onClick={() => fileInputRef.current?.click()}
     disabled={isLoading || isStreaming}
    >
     <Upload className="h-4 w-4" />
    </Button>
    )}
    <input 
    type="file" 
    ref={fileInputRef} 
    className="hidden" 
    accept="image/png, image/jpeg, image/gif, image/webp" 
    onChange={handleImageUpload} 
    />
   </div>
   {(isLoading || isStreaming || isWaitingForResponse) ? (
    <Button 
    onClick={() => {
     if (abortControllerRef.current) {
     abortControllerRef.current.abort()
     setIsLoading(false)
     setIsStreaming(false)
     setIsWaitingForResponse(false)
     setStreamingMessage('')
     }
    }}
    className="h-10 w-10 sm:h-11 sm:w-11 p-0 flex-shrink-0 bg-red-600 hover:bg-red-700 text-white border border-red-500/30 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300 hover:scale-105"
    >
    <StopCircle className="h-5 w-5" />
    </Button>
   ) : (
    <Button 
    onClick={handleSendMessage} 
    disabled={(!inputMessage.trim() && !selectedImage) || usageStatus.needsLogin || usageStatus.needsSubscription || isLoading || isStreaming || isWaitingForResponse}
    className="h-10 w-10 sm:h-11 sm:w-11 p-0 flex-shrink-0 bg-purple-600 hover:bg-purple-700 text-white border border-purple-500/30 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 text-white"
    >
    <Send className="h-5 w-5" />
    </Button>
   )}
   </div>
   <p className="text-xs text-muted-foreground mt-2 text-center px-2">
   DalSi AI can make mistakes. Consider checking important information. • Code snippets are syntax highlighted and copyable.
   </p>
  </div>
  </div>
  </div>
  <FrictionModal 
    isOpen={isFrictionModalOpen} 
    data={frictionModalData} 
    userId={user ? user.id : guestUserId} // Pass the user ID
    onDismiss={() => setIsFrictionModalOpen(false)} 
    onUpgrade={() => {
      setIsFrictionModalOpen(false);
      handleUpgrade();
    }}
  />
 </div>
 )
}

const FrictionModal = ({ isOpen, data, onDismiss, onUpgrade, userId }) => {
  if (!isOpen || !data) return null;
  
  // Track funnel step: friction_shown
  useEffect(() => {
    if (isOpen && data && userId) {
      trackFunnelStep(userId, 'friction_shown', { friction_type: data.friction_type, event_id: data.event_id });
    }
  }, [isOpen, data, userId]);

  const handleDismiss = () => {
    logFrictionAction(data.event_id, 'dismissed');
    trackFunnelStep(userId, 'friction_dismissed', { friction_type: data.friction_type, event_id: data.event_id });
    onDismiss();
  };

  const handleUpgrade = () => {
    logFrictionAction(data.event_id, 'upgraded');
    trackFunnelStep(userId, 'friction_accepted', { friction_type: data.friction_type, event_id: data.event_id });
    onUpgrade();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-full max-w-md bg-card border-primary shadow-2xl relative overflow-hidden">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary mb-4">
            <DollarSign className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">{data.message_template.title}</h2>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center mb-6">{data.message_template.message}</p>
          <div className="space-y-2 mb-6">
            {data.message_template.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-sm text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <Button onClick={handleUpgrade} className="w-full bg-primary hover:bg-primary/90 text-white">{data.message_template.cta_text}</Button>
            <Button onClick={handleDismiss} variant="ghost" className="w-full text-muted-foreground">{data.message_template.dismiss_text}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedChatInterface


// Removed old UsageLimitWarning component definition

const UsageStatusDisplay = ({ usageStatus, onUpgrade, onLogin }) => {
  const isGuest = usageStatus.isGuest;
  const isSubscribed = usageStatus.limit === Infinity;
  const isFreeTier = !isGuest && !isSubscribed;

  let statusText = '';
  let statusColor = 'text-muted-foreground';
  let button = null;

  if (isSubscribed) {
    statusText = `Plan: ${usageStatus.subscriptionType || 'Premium'} (Unlimited)`;
    statusColor = 'text-green-500';
  } else if (isGuest) {
    const limitText = usageStatus.limit === 1 ? '1 free message' : `${usageStatus.limit} free messages`;
    const remainingText = usageStatus.remaining === 1 ? '1 message' : `${usageStatus.remaining} messages`;
    statusText = usageStatus.remaining > 0 
      ? `Guest: ${remainingText} remaining today (out of ${usageStatus.limit}).`
      : `Guest: Daily limit of ${usageStatus.limit} messages exhausted. Resets tomorrow.`;
    statusColor = usageStatus.remaining > 0 ? 'text-yellow-500' : 'text-red-500';
    button = (
      <Button variant="outline" size="sm" onClick={onLogin} className="h-7 text-xs px-2">
        Sign In
      </Button>
    );
  } else if (isFreeTier) {
    statusText = `Free Tier: ${usageStatus.remaining} of ${usageStatus.limit} messages remaining.`;
    statusColor = usageStatus.remaining > 0 ? 'text-yellow-500' : 'text-red-500';
    button = (
      <Button variant="outline" size="sm" onClick={onUpgrade} className="h-7 text-xs px-2 bg-primary hover:bg-primary/90 text-white">
        Upgrade
      </Button>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border/50">
      <span className={`text-sm font-medium ${statusColor}`}>{statusText}</span>
      {button}
    </div>
  );
};
