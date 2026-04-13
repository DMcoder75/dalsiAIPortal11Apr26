import { useState, useEffect, useRef } from 'react'
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

// ─── Feature card data ────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: MessageCircle,
    title: 'Natural conversations',
    desc: 'Human-like replies in any language, 24/7',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10'
  },
  {
    icon: Calendar,
    title: 'Bookings & availability',
    desc: 'End-to-end booking workflows, automated',
    color: 'text-green-400',
    bg: 'bg-green-500/10'
  },
  {
    icon: CreditCard,
    title: 'Payments',
    desc: 'Collect payments and send receipts in-chat',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10'
  },
  {
    icon: Brain,
    title: 'Customer memory',
    desc: 'Remembers preferences across sessions',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10'
  },
  {
    icon: Mic,
    title: 'Voice & image',
    desc: 'Understands voice notes and photos',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10'
  },
  {
    icon: Truck,
    title: 'Ops & tracking',
    desc: 'Live status updates and dispatch alerts',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10'
  }
]

// ─── Domain options (API values) ──────────────────────────────────────────────
const DOMAINS = [
  { value: 'finance',    label: 'Finance & Banking' },
  { value: 'telecom',    label: 'Telecom' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'retail',     label: 'Retail & E-commerce' },
  { value: 'travel',     label: 'Travel' },
  { value: 'hotel',      label: 'Hotel & Accommodation' },
  { value: 'education',  label: 'Education' }
]

// ─── Language options ─────────────────────────────────────────────────────────
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

// ─── Escalation policy options ────────────────────────────────────────────────
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

// ─── Main component ───────────────────────────────────────────────────────────
export default function VertoAI() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Step: 'landing' | 'form' | 'success'
  const [step, setStep] = useState('landing')
  const [consentChecked, setConsentChecked] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [sessionData, setSessionData] = useState(null)

  // Form state — includes new required fields
  const [form, setForm] = useState({
    name: user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '',
    email: user?.email || '',
    phone: '',
    domain: 'retail',
    business_name: '',
    location: '',
    language: 'en',
    agent_name: 'Verto',
    agent_persona: '',
    escalation_policy: 'standard',
    enable_search: false,
    session_minutes: 8
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

      const res = await fetch('https://api.neodalsi.com/vertosession/session/create', {
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

  // ── LANDING STEP ────────────────────────────────────────────────────────────
  const LandingStep = () => (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <section className="relative pt-24 pb-16 px-4 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-green-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <MessageCircle className="w-4 h-4" />
            WhatsApp AI Concierge
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Meet{' '}
            <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              Verto AI
            </span>
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

          {/* Feature cards */}
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

          {/* Consent */}
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

          {/* CTA */}
          <Button
            size="lg"
            disabled={!consentChecked}
            onClick={() => setStep('form')}
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

  // ── FORM STEP ───────────────────────────────────────────────────────────────
  const FormStep = () => (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <section className="pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Back link */}
          <button
            onClick={() => setStep('landing')}
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

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ── Your details section ── */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your details</p>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  <UserIcon className="inline w-3.5 h-3.5 mr-1 text-muted-foreground" />
                  Full name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  required
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500/40"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  <Mail className="inline w-3.5 h-3.5 mr-1 text-muted-foreground" />
                  Email address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleFormChange}
                  required
                  placeholder="e.g. rahul@company.com"
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500/40"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  <Phone className="inline w-3.5 h-3.5 mr-1 text-muted-foreground" />
                  WhatsApp number <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleFormChange}
                  required
                  placeholder="+61412345678 (include country code)"
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500/40"
                />
                <p className="text-xs text-muted-foreground mt-1">Include country code, e.g. +61 for Australia, +1 for US</p>
              </div>
            </div>

            {/* ── Business details section ── */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Business details</p>

              {/* Business domain */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Industry / Domain <span className="text-red-400">*</span>
                </label>
                <select
                  name="domain"
                  value={form.domain}
                  onChange={handleFormChange}
                  required
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-green-500/40"
                >
                  {DOMAINS.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>

              {/* Business name */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Business name <span className="text-muted-foreground font-normal">(optional)</span></label>
                <input
                  type="text"
                  name="business_name"
                  value={form.business_name}
                  onChange={handleFormChange}
                  placeholder="e.g. Sunrise Café"
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500/40"
                />
              </div>

              {/* Location + Language */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Location <span className="text-muted-foreground font-normal">(optional)</span></label>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleFormChange}
                    placeholder="e.g. Sydney, AU"
                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Language</label>
                  <select
                    name="language"
                    value={form.language}
                    onChange={handleFormChange}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-green-500/40"
                  >
                    {LANGUAGES.map(l => (
                      <option key={l.code} value={l.code}>{l.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ── Agent configuration section ── */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Agent configuration</p>

              {/* Agent name */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Agent name</label>
                <input
                  type="text"
                  name="agent_name"
                  value={form.agent_name}
                  onChange={handleFormChange}
                  placeholder="e.g. Verto, Aria, Max"
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500/40"
                />
              </div>

              {/* Agent persona */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Agent persona <span className="text-muted-foreground font-normal">(optional)</span></label>
                <textarea
                  name="agent_persona"
                  value={form.agent_persona}
                  onChange={handleFormChange}
                  rows={3}
                  placeholder="Describe how your agent should behave, e.g. 'Friendly and professional barista who knows our full menu and can take orders.'"
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500/40 resize-none"
                />
              </div>

              {/* Escalation policy */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Escalation policy</label>
                <select
                  name="escalation_policy"
                  value={form.escalation_policy}
                  onChange={handleFormChange}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-green-500/40"
                >
                  {ESCALATION_POLICIES.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              {/* Session duration */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  <Clock className="inline w-3.5 h-3.5 mr-1 text-muted-foreground" />
                  Demo duration
                </label>
                <select
                  name="session_minutes"
                  value={form.session_minutes}
                  onChange={handleFormChange}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-green-500/40"
                >
                  <option value={5}>5 minutes</option>
                  <option value={8}>8 minutes (default)</option>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                </select>
              </div>

              {/* Enable online search */}
              <div className="flex items-center gap-3 bg-background border border-border rounded-lg px-4 py-3">
                <input
                  type="checkbox"
                  id="enable_search"
                  name="enable_search"
                  checked={form.enable_search}
                  onChange={handleFormChange}
                  className="w-4 h-4 accent-green-500 cursor-pointer"
                />
                <label htmlFor="enable_search" className="text-sm cursor-pointer">
                  <span className="font-medium">Enable online search</span>
                  <span className="text-muted-foreground ml-1">— agent can look up live information when needed</span>
                </label>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 text-base gap-2"
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

  // ── SUCCESS / QR STEP ───────────────────────────────────────────────────────
  const SuccessStep = () => {
    const countdown = useCountdown(sessionData?.expires_at)

    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />

        <section className="pt-24 pb-16 px-4">
          <div className="max-w-xl mx-auto text-center">

            {/* Header */}
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <CheckCircle2 className="w-4 h-4" />
              Session active
            </div>

            <h2 className="text-3xl font-bold mb-2">Your Verto AI demo is live!</h2>
            <p className="text-muted-foreground mb-2 text-sm">
              A WhatsApp message has been sent to <span className="text-foreground font-medium">{sessionData?.phone}</span>.
              Scan the QR code below or open WhatsApp on your phone to start chatting.
            </p>

            {/* Countdown timer */}
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

            {/* QR Code image */}
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

            {/* How to use */}
            <div className="bg-card border border-border rounded-xl p-5 mb-6 text-left">
              <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-green-400" />
                How to start your demo
              </p>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><span className="text-green-400 font-bold">1.</span> Open WhatsApp on your phone</li>
                <li className="flex gap-2"><span className="text-green-400 font-bold">2.</span> Tap the camera / QR icon and scan the code above</li>
                <li className="flex gap-2"><span className="text-green-400 font-bold">3.</span> Or check your WhatsApp — a welcome message was already sent to your number</li>
                <li className="flex gap-2"><span className="text-green-400 font-bold">4.</span> Start chatting with <span className="text-foreground font-medium">{sessionData?.dalsi_agent_name || sessionData?.agent_name || 'Verto'}</span>!</li>
              </ol>
            </div>

            {/* Session details */}
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
              <Button
                onClick={() => { setStep('landing'); setConsentChecked(false); setSessionData(null) }}
                variant="outline"
                className="border-border hover:border-green-500/40"
              >
                Start another session
              </Button>
              <Button
                onClick={() => navigate('/experience')}
                className="bg-green-500 hover:bg-green-600 text-white gap-2"
              >
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

  if (step === 'form') return <FormStep />
  if (step === 'success') return <SuccessStep />
  return <LandingStep />
}
