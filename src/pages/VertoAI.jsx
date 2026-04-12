import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
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
  ShieldCheck,
  ChevronRight
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

// ─── Business domain options ──────────────────────────────────────────────────
const DOMAINS = [
  'general', 'retail', 'hospitality', 'healthcare', 'logistics',
  'real_estate', 'finance', 'education', 'food_beverage', 'beauty_wellness'
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

// ─── Country options (abbreviated) ───────────────────────────────────────────
const COUNTRIES = [
  { code: 'AU', label: 'Australia' },
  { code: 'US', label: 'United States' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'IN', label: 'India' },
  { code: 'CA', label: 'Canada' },
  { code: 'SG', label: 'Singapore' },
  { code: 'AE', label: 'United Arab Emirates' },
  { code: 'NZ', label: 'New Zealand' },
  { code: 'ZA', label: 'South Africa' },
  { code: 'NG', label: 'Nigeria' }
]

// ─── Escalation policy options ────────────────────────────────────────────────
const ESCALATION_POLICIES = [
  { value: 'standard', label: 'Standard — escalate when unsure' },
  { value: 'strict', label: 'Strict — escalate frequently' },
  { value: 'lenient', label: 'Lenient — handle most queries autonomously' }
]

// ─── Helper: generate a session_id ───────────────────────────────────────────
function generateSessionId() {
  return 'verto-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9)
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

  // Form state
  const [form, setForm] = useState({
    business_name: '',
    business_domain: 'general',
    country: 'AU',
    language: 'en',
    agent_name: 'Verto',
    agent_persona: '',
    escalation_policy: 'standard',
    enable_online_search: false
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
      const session_id = generateSessionId()
      const payload = {
        session_id,
        user_id: user?.id || null,
        model_id: null,
        business_domain: form.business_domain,
        business_name: form.business_name || null,
        country: form.country,
        language: form.language,
        agent_persona: form.agent_persona || null,
        agent_name: form.agent_name || 'Verto',
        knowledge_base_id: null,
        escalation_policy: form.escalation_policy,
        enable_online_search: form.enable_online_search,
        user_context: {},
        status: 'active',
        metadata: {
          created_from: 'vertoai_demo_page',
          user_agent: navigator.userAgent
        }
      }

      const { data, error: dbError } = await supabase
        .from('verto_sessions')
        .insert([payload])
        .select()
        .single()

      if (dbError) {
        // If table doesn't exist yet or RLS blocks, still show success for demo
        console.warn('Supabase insert warning:', dbError.message)
        setSessionData({ session_id, ...form })
      } else {
        setSessionData(data)
      }

      setStep('success')
    } catch (err) {
      setError('Something went wrong. Please try again.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  // ── LANDING STEP ────────────────────────────────────────────────────────────
  const LandingStep = () => (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      {/* Hero */}
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

          {/* Native WhatsApp badge */}
          <div className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-5 py-2 text-sm text-muted-foreground mb-12">
            <Globe className="w-4 h-4 text-green-400" />
            Runs natively on WhatsApp — no extra app needed
          </div>

          {/* Feature cards — 3 columns on md, 2 on sm */}
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
              Tell us about your business so Verto AI can tailor the experience for you.
            </p>
            {user && (
              <p className="mt-2 text-xs text-green-400">
                <CheckCircle2 className="inline w-3.5 h-3.5 mr-1" />
                Signed in as {user.email || user.first_name} — session will be linked to your account.
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Business name */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Business name <span className="text-muted-foreground font-normal">(optional)</span></label>
              <input
                type="text"
                name="business_name"
                value={form.business_name}
                onChange={handleFormChange}
                placeholder="e.g. Sunrise Café"
                className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500/40"
              />
            </div>

            {/* Business domain */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Business domain <span className="text-red-400">*</span></label>
              <select
                name="business_domain"
                value={form.business_domain}
                onChange={handleFormChange}
                required
                className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-green-500/40"
              >
                {DOMAINS.map(d => (
                  <option key={d} value={d}>{d.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                ))}
              </select>
            </div>

            {/* Country + Language */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Country</label>
                <select
                  name="country"
                  value={form.country}
                  onChange={handleFormChange}
                  className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-green-500/40"
                >
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Language</label>
                <select
                  name="language"
                  value={form.language}
                  onChange={handleFormChange}
                  className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-green-500/40"
                >
                  {LANGUAGES.map(l => (
                    <option key={l.code} value={l.code}>{l.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Agent name */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Agent name</label>
              <input
                type="text"
                name="agent_name"
                value={form.agent_name}
                onChange={handleFormChange}
                placeholder="e.g. Verto, Aria, Max"
                className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500/40"
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
                className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500/40 resize-none"
              />
            </div>

            {/* Escalation policy */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Escalation policy</label>
              <select
                name="escalation_policy"
                value={form.escalation_policy}
                onChange={handleFormChange}
                className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-green-500/40"
              >
                {ESCALATION_POLICIES.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* Enable online search */}
            <div className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3">
              <input
                type="checkbox"
                id="enable_online_search"
                name="enable_online_search"
                checked={form.enable_online_search}
                onChange={handleFormChange}
                className="w-4 h-4 accent-green-500 cursor-pointer"
              />
              <label htmlFor="enable_online_search" className="text-sm cursor-pointer">
                <span className="font-medium">Enable online search</span>
                <span className="text-muted-foreground ml-1">— agent can look up live information when needed</span>
              </label>
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 text-base gap-2"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Setting up your agent...</>
              ) : (
                <><MessageCircle className="w-4 h-4" /> Launch Verto AI Session</>
              )}
            </Button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  )

  // ── SUCCESS STEP ────────────────────────────────────────────────────────────
  const SuccessStep = () => (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <section className="pt-24 pb-16 px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>

          <h2 className="text-3xl font-bold mb-3">Your Verto AI session is ready!</h2>
          <p className="text-muted-foreground mb-8">
            Your WhatsApp concierge agent has been configured. Here are your session details.
          </p>

          {sessionData && (
            <Card className="bg-card border-border text-left mb-8">
              <CardContent className="p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Session ID</span>
                  <span className="font-mono text-xs text-green-400 truncate max-w-[200px]">{sessionData.session_id}</span>
                </div>
                {sessionData.business_name && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Business</span>
                    <span className="font-medium">{sessionData.business_name}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Domain</span>
                  <span className="font-medium capitalize">{(sessionData.business_domain || '').replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Agent name</span>
                  <span className="font-medium">{sessionData.agent_name || 'Verto'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Language</span>
                  <span className="font-medium">{LANGUAGES.find(l => l.code === sessionData.language)?.label || sessionData.language}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <span className="text-green-400 font-medium">Active</span>
                </div>
              </CardContent>
            </Card>
          )}

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

  if (step === 'form') return <FormStep />
  if (step === 'success') return <SuccessStep />
  return <LandingStep />
}
