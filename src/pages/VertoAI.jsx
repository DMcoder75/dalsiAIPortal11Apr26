import { useState, useEffect } from 'react'
import API_BASE from '../lib/apiConfig'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import { useAuth } from '../contexts/AuthContext'
import vertoQR from '../assets/VertoAI_QR.png'
import {
  MessageCircle,
  Calendar,
  CreditCard,
  Brain,
  Mic,
  Truck,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Globe,
  ChevronRight,
  Clock,
  Phone,
  Mail,
  User as UserIcon,
  AlertCircle,
  Smartphone
} from 'lucide-react'

// ─── Static data ──────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: MessageCircle, title: 'Natural conversations',   desc: 'Human-like replies in any language, 24/7',          color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { icon: Calendar,      title: 'Bookings & availability', desc: 'End-to-end booking workflows, automated',           color: 'text-green-400',  bg: 'bg-green-500/10'  },
  { icon: CreditCard,    title: 'Payments',                desc: 'Collect payments and send receipts in-chat',        color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { icon: Brain,         title: 'Customer memory',         desc: 'Remembers preferences across sessions',             color: 'text-blue-400',   bg: 'bg-blue-500/10'   },
  { icon: Mic,           title: 'Voice & image',           desc: 'Understands voice notes and photos',                color: 'text-pink-400',   bg: 'bg-pink-500/10'   },
  { icon: Truck,         title: 'Ops & tracking',          desc: 'Live status updates and dispatch alerts',           color: 'text-orange-400', bg: 'bg-orange-500/10' }
]

const DOMAINS = [
  { value: 'finance',    label: 'Finance & Banking' },
  { value: 'telecom',    label: 'Telecom' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'retail',     label: 'Retail & E-commerce' },
  { value: 'travel',     label: 'Travel' },
  { value: 'hotel',      label: 'Hotel & Accommodation' },
  { value: 'education',  label: 'Education' }
]

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'hi', label: 'Hindi' },
  { code: 'ar', label: 'Arabic' },
  { code: 'zh', label: 'Chinese' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' }
]

const ESCALATION_POLICIES = [
  { value: 'standard', label: 'Standard — escalate when unsure' },
  { value: 'strict',   label: 'Strict — escalate frequently' },
  { value: 'lenient',  label: 'Lenient — handle most queries autonomously' }
]

// ─── Countdown hook ───────────────────────────────────────────────────────────
function useCountdown(expiresAt) {
  const [remaining, setRemaining] = useState(null)
  useEffect(() => {
    if (!expiresAt) return
    const tick = () => {
      const diff = Math.max(0, Math.floor((new Date(expiresAt) - Date.now()) / 1000))
      setRemaining(diff)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [expiresAt])
  if (remaining === null) return null
  const m = Math.floor(remaining / 60)
  const s = remaining % 60
  return { total: remaining, display: `${m}m ${String(s).padStart(2, '0')}s`, expired: remaining === 0 }
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — Landing
// ─────────────────────────────────────────────────────────────────────────────
function LandingStep({ consentChecked, setConsentChecked, onNext }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <section className="relative pt-24 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-green-500/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="flex justify-center mb-6">
            <img
              src="/VertoLogo.png"
              alt="Verto AI Logo"
              className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-2xl"
            />
          </div>
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <MessageCircle className="w-4 h-4" />
            WhatsApp AI Concierge
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Meet{' '}
            <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Verto AI</span>
            {' '}—{' '}
            <span className="text-foreground">your business's always-on WhatsApp agent</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6 leading-relaxed">
            Verto AI helps businesses deploy intelligent WhatsApp agents that handle customer queries,
            bookings, and support — in natural, human-like conversation. No apps. No friction. Just WhatsApp.
          </p>
          <div className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-5 py-2 text-sm text-muted-foreground mb-12">
            <Globe className="w-4 h-4 text-green-400" />
            Runs natively on WhatsApp — no extra app needed
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-12 text-left">
            {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
              <Card key={title} className="bg-card border-border hover:border-green-500/30 transition-colors">
                <CardContent className="p-5 flex gap-4 items-start">
                  <div className={`p-2 rounded-lg ${bg} flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground mb-0.5">{title}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="max-w-2xl mx-auto bg-card border border-border rounded-xl p-6 mb-8 text-left">
            <label className="flex gap-3 cursor-pointer">
              <div className="mt-0.5 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={e => setConsentChecked(e.target.checked)}
                  className="w-4 h-4 accent-green-500 cursor-pointer"
                />
              </div>
              <span className="text-sm text-muted-foreground leading-relaxed">
                I understand that the information I provide will be used solely for this demo session.
                My data will not be shared with any third party, stored beyond the session, or used for
                marketing without my explicit consent. This demo is for evaluation purposes only.
              </span>
            </label>
          </div>
          <Button
            size="lg"
            disabled={!consentChecked}
            onClick={onNext}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3 text-base disabled:opacity-40 disabled:cursor-not-allowed gap-2"
          >
            Initiate Concierge Experience
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>
      <Footer />
    </div>
  )
}

// ─── Validators ─────────────────────────────────────────────────────────────
const isValidEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
const isValidPhone = v => /^\+[1-9]\d{6,14}$/.test(v.trim())

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — Form
// ─────────────────────────────────────────────────────────────────────────────
function FormStep({ form, onChange, onSubmit, submitting, error, onBack }) {
  const [touched, setTouched] = useState({ email: false, phone: false })

  const emailError  = touched.email && form.email  && !isValidEmail(form.email)  ? 'Please enter a valid email address (e.g. rahul@company.com)' : ''
  const phoneError  = touched.phone && form.phone  && !isValidPhone(form.phone)  ? 'Format: +[country code][number] with no spaces, e.g. +919822418118' : ''

  const isFormValid =
    form.name.trim() !== '' &&
    isValidEmail(form.email) &&
    isValidPhone(form.phone) &&
    form.domain !== ''

  const handleBlur = (e) => setTouched(t => ({ ...t, [e.target.name]: true }))

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180" /> Back
          </button>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
              <MessageCircle className="w-4 h-4" />
              Configure your Verto AI agent
            </div>
            <h2 className="text-3xl font-bold mb-2">Set up your concierge session</h2>
            <p className="text-muted-foreground text-sm">
              Fill in your details — a WhatsApp message will be sent to your number to start the demo.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">

            {/* Your details */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your details</p>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  <UserIcon className="inline w-3.5 h-3.5 mr-1 text-muted-foreground" />
                  Full name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  required
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500/40"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  <Mail className="inline w-3.5 h-3.5 mr-1 text-muted-foreground" />
                  Email address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  onBlur={handleBlur}
                  required
                  placeholder="e.g. rahul@company.com"
                  className={`w-full bg-background border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${emailError ? 'border-red-500 focus:ring-red-500/40' : 'border-border focus:ring-green-500/40'}`}
                />
                {emailError && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{emailError}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  <Phone className="inline w-3.5 h-3.5 mr-1 text-muted-foreground" />
                  WhatsApp number <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  onBlur={handleBlur}
                  required
                  placeholder="+919822418118"
                  className={`w-full bg-background border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${phoneError ? 'border-red-500 focus:ring-red-500/40' : 'border-border focus:ring-green-500/40'}`}
                />
                {phoneError
                  ? <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{phoneError}</p>
                  : <p className="text-xs text-muted-foreground mt-1">Start with + and country code, no spaces — e.g. +919822418118</p>
                }
              </div>
            </div>

            {/* Business details */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Business details</p>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Industry / Domain <span className="text-red-400">*</span>
                </label>
                <select
                  name="domain"
                  value={form.domain}
                  onChange={onChange}
                  required
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-green-500/40"
                >
                  {DOMAINS.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Business name <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  name="business_name"
                  value={form.business_name}
                  onChange={onChange}
                  placeholder="e.g. Sunrise Café"
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500/40"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Location <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={onChange}
                    placeholder="e.g. Sydney, AU"
                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Language</label>
                  <select
                    name="language"
                    value={form.language}
                    onChange={onChange}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-green-500/40"
                  >
                    {LANGUAGES.map(l => (
                      <option key={l.code} value={l.code}>{l.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Agent configuration — display only */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your AI agent</p>
                <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-0.5 rounded-full font-medium">Pre-configured</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-background border border-border rounded-lg px-4 py-3">
                  <p className="text-xs text-muted-foreground mb-0.5">Agent name</p>
                  <p className="text-sm font-semibold text-foreground">Verto AI</p>
                </div>
                <div className="bg-background border border-border rounded-lg px-4 py-3">
                  <p className="text-xs text-muted-foreground mb-0.5">Demo duration</p>
                  <p className="text-sm font-semibold text-foreground flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-green-400" /> 8 minutes</p>
                </div>
                <div className="bg-background border border-border rounded-lg px-4 py-3">
                  <p className="text-xs text-muted-foreground mb-0.5">Escalation policy</p>
                  <p className="text-sm font-semibold text-foreground">Standard</p>
                </div>
                <div className="bg-background border border-border rounded-lg px-4 py-3">
                  <p className="text-xs text-muted-foreground mb-0.5">Agent persona</p>
                  <p className="text-sm font-semibold text-foreground">Domain-specific</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                The agent persona is automatically tailored to your selected industry using our curated knowledge base. No configuration needed.
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting || !isFormValid}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 text-base gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating your session...</>
              ) : (
                <><MessageCircle className="w-4 h-4" /> Launch Verto AI Demo</>
              )}
            </Button>
          </form>
        </div>
      </section>
      <Footer />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3 — Success / QR
// ─────────────────────────────────────────────────────────────────────────────
function SuccessStep({ sessionData, onRestart }) {
  const navigate = useNavigate()
  const countdown = useCountdown(sessionData?.expires_at)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <CheckCircle2 className="w-4 h-4" />
            Session active
          </div>
          <h2 className="text-3xl font-bold mb-2">Your Verto AI demo is live!</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            A WhatsApp message has been sent to{' '}
            <span className="text-foreground font-medium">{sessionData?.phone}</span>.
            Scan the QR code below or open WhatsApp on your phone to start chatting.
          </p>

          {countdown && !countdown.expired && (
            <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
              <Clock className="w-4 h-4" />
              Session expires in {countdown.display}
            </div>
          )}
          {countdown?.expired && (
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
              <AlertCircle className="w-4 h-4" />
              Session has expired
            </div>
          )}
          {!countdown && <div className="mb-8" />}

          <div className="flex justify-center mb-8">
            <div className="relative">
              <img
                src={vertoQR}
                alt="Verto AI WhatsApp QR Code"
                className="w-64 h-64 object-contain rounded-2xl shadow-2xl shadow-green-500/10 border border-green-500/20"
              />
              {countdown?.expired && (
                <div className="absolute inset-0 bg-background/80 rounded-2xl flex items-center justify-center">
                  <p className="text-red-400 font-semibold text-sm">Session expired</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 mb-6 text-left">
            <p className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-green-400" />
              How to start your demo
            </p>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2"><span className="text-green-400 font-bold">1.</span> Open WhatsApp on your phone</li>
              <li className="flex gap-2"><span className="text-green-400 font-bold">2.</span> Tap the camera / QR icon and scan the code above</li>
              <li className="flex gap-2"><span className="text-green-400 font-bold">3.</span> Or check your WhatsApp — a welcome message was already sent to your number</li>
              <li className="flex gap-2"><span className="text-green-400 font-bold">4.</span> Start chatting with <span className="text-foreground font-medium">{sessionData?.dalsi_agent_name || 'Verto'}</span>!</li>
            </ol>
          </div>

          <Card className="bg-card border-border text-left mb-8">
            <CardContent className="p-5 space-y-2.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Session details</p>
              {sessionData?.session_id && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Session ID</span>
                  <span className="font-mono text-xs text-green-400 truncate max-w-[200px]">{sessionData.session_id}</span>
                </div>
              )}
              {sessionData?.dalsi_session_id && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Dalsi session</span>
                  <span className="font-mono text-xs text-muted-foreground truncate max-w-[200px]">{sessionData.dalsi_session_id}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Agent</span>
                <span className="font-medium">{sessionData?.dalsi_agent_name || 'Verto'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Domain</span>
                <span className="font-medium">{sessionData?.domain_name || sessionData?.domain}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">{sessionData?.duration_minutes || 8} minutes</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className={`font-medium ${countdown?.expired ? 'text-red-400' : 'text-green-400'}`}>
                  {countdown?.expired ? 'Expired' : 'Active'}
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={onRestart} variant="outline" className="border-border hover:border-green-500/40">
              Start another session
            </Button>
            <Button onClick={() => navigate('/experience')} className="bg-green-500 hover:bg-green-600 text-white gap-2">
              <MessageCircle className="w-4 h-4" />
              Try DalsiAI Chat
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT — orchestrates steps, owns all state
// ─────────────────────────────────────────────────────────────────────────────
export default function VertoAI() {
  const { user } = useAuth()

  const [step, setStep] = useState('landing')
  const [consentChecked, setConsentChecked] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [sessionData, setSessionData] = useState(null)

  const [form, setForm] = useState({
    name:              user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '',
    email:             user?.email || '',
    phone:             '',
    domain:            'retail',
    business_name:     '',
    location:          '',
    language:          'en',
    agent_name:        'Verto AI',
    agent_persona:     '',
    escalation_policy: 'standard',
    enable_search:     false,
    session_minutes:   8
  })

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const payload = {
        name:              form.name,
        email:             form.email,
        phone:             form.phone,
        domain:            form.domain,
        business_name:     form.business_name || undefined,
        location:          form.location || undefined,
        language:          form.language,
        agent_name:        form.agent_name || 'Verto',
        agent_persona:     form.agent_persona || undefined,
        escalation_policy: form.escalation_policy,
        enable_search:     form.enable_search,
        session_minutes:   Number(form.session_minutes) || 8
      }
      const res = await fetch(`${API_BASE}/vertosession/session/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (res.ok && data.session_id) {
        localStorage.setItem('verto_session_id', data.session_id)
        setSessionData({ ...data, phone: form.phone })
        setStep('success')
      } else {
        setError(data.error || data.message || 'Failed to create session. Please try again.')
      }
    } catch (err) {
      setError('Network error — please check your connection and try again.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRestart = () => {
    setStep('landing')
    setConsentChecked(false)
    setSessionData(null)
    setError('')
  }

  if (step === 'form') {
    return (
      <FormStep
        form={form}
        onChange={handleFormChange}
        onSubmit={handleSubmit}
        submitting={submitting}
        error={error}
        onBack={() => setStep('landing')}
      />
    )
  }

  if (step === 'success') {
    return <SuccessStep sessionData={sessionData} onRestart={handleRestart} />
  }

  return (
    <LandingStep
      consentChecked={consentChecked}
      setConsentChecked={setConsentChecked}
      onNext={() => setStep('form')}
    />
  )
}
