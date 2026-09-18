import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'

const AI_FEATURES = [
  { icon: '🧠', label: 'AI Symptom Analysis',   status: 'active',  dot: '#10b981' },
  { icon: '📋', label: 'Smart Doctor Matching',  status: 'loading', dot: null      },
  { icon: '🏥', label: 'Ward Assignment',        status: 'loading', dot: null      },
  { icon: '💊', label: 'Prescription Reminders', status: 'idle',    dot: null      },
  { icon: '📅', label: 'Appointment Scheduling', status: 'idle',    dot: null      },
]

function FeatureRow({ icon, label, status, dot }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-teal-100/60 opacity-90">
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <span className={`text-sm ${status === 'active' ? 'font-bold text-teal-800' : 'font-medium text-slate-700'}`}>{label}</span>
      </div>
      {status === 'active' && (
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"/>
      )}
      {status === 'loading' && (
        <span className="w-4 h-4 border-2 border-teal-300 border-t-teal-700 rounded-full animate-spin"/>
      )}
    </div>
  )
}

export default function AuthPage({ onAuth }) {
  const [mode, setMode]               = useState('login')
  const [email, setEmail]             = useState('')
  const [name, setName]               = useState('')
  const [phone, setPhone]             = useState('')
  const [password, setPassword]       = useState('')
  const [dob, setDob]                 = useState('')
  const [focusField, setFocus]        = useState(null)
  const [loading, setLoading]         = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [errors, setErrors]           = useState({})
  const [toast, setToast]             = useState(null)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const { user } = session
          onAuth({
            provider : user.app_metadata?.provider ?? 'email',
            name     : user.user_metadata?.full_name ?? user.user_metadata?.name ?? '',
            email    : user.email,
            avatarUrl: user.user_metadata?.avatar_url ?? null,
          })
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [onAuth])

  function showToast(msg, type = 'error') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  function validate() {
    const e = {}
    if (!email.trim())
      e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email))
      e.email = 'Enter a valid email address'

    if (!password.trim())
      e.password = 'Password is required'
    else if (password.length < 6)
      e.password = 'Password must be at least 6 characters'

    if (mode === 'signup') {
      if (!name.trim())  e.name  = 'Full name is required'
      if (!phone.trim()) e.phone = 'Phone number is required'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit() {
    if (!validate()) {
      showToast('Please fix the errors below', 'error')
      return
    }
    setLoading(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name, phone, dob } },
        })
        if (error) throw error
        showToast('Account created! Please sign in.', 'success')
        setMode('login')
        setPassword(''); setName(''); setPhone(''); setDob(''); setErrors({})
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        if (data?.user) {
          onAuth({ provider: 'email', email: data.user.email, name: data.user.user_metadata?.full_name ?? '' })
        }
      }
    } catch (err) {
      showToast(err.message ?? 'Something went wrong', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) {
      showToast(error.message ?? 'Google sign-in failed', 'error')
      setGoogleLoading(false)
    }
  }

  function switchMode() {
    setMode(m => m === 'login' ? 'signup' : 'login')
    setErrors({})
    setEmail(''); setPassword(''); setName(''); setPhone(''); setDob('')
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-xl font-bold text-sm text-white animate-slide-up flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-600' : 'bg-teal-600'}`}>
          <span>{toast.type === 'error' ? '⚠️' : '✅'}</span>
          {toast.msg}
        </div>
      )}

      {/* Main Container Card */}
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-clinical-lg border border-slate-200/80 overflow-hidden flex flex-col md:flex-row min-h-[560px] relative z-10 animate-slide-up">
        
        {/* Left: Form Area */}
        <div className="flex-1 p-8 sm:p-12 flex flex-col justify-center">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center shadow-md shadow-teal-700/20">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 4v16M4 12h16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" fill="none"/>
              </svg>
            </div>
            <span className="font-display font-bold text-xl text-slate-900 tracking-tight">MediCare AI</span>
          </div>

          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 leading-tight">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            {mode === 'login' ? 'Sign in to access patient registration & doctor consultation' : 'Register to manage appointments & patient records'}
          </p>

          {/* Google OAuth Button */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full py-3 px-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm flex items-center justify-center gap-3 transition-all hover:border-slate-300 active:scale-[0.99] disabled:opacity-50 mb-4"
          >
            {googleLoading ? (
              <span className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"/>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-slate-200"/>
            <span className="text-xs font-bold text-slate-400 tracking-wider">OR</span>
            <div className="flex-1 h-px bg-slate-200"/>
          </div>

          {/* Form fields */}
          <div className="space-y-3.5 mb-5">
            {mode === 'signup' && (
              <div>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={e => { setName(e.target.value); setErrors(p=>({...p,name:null})) }}
                  className={`w-full px-4 py-3 rounded-2xl border text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all ${errors.name ? 'border-red-400 bg-red-50/30' : 'border-slate-200 focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10'}`}
                />
                {errors.name && <p className="text-xs text-red-500 font-semibold mt-1">⚠️ {errors.name}</p>}
              </div>
            )}

            <div>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors(p=>({...p,email:null})) }}
                className={`w-full px-4 py-3 rounded-2xl border text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all ${errors.email ? 'border-red-400 bg-red-50/30' : 'border-slate-200 focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10'}`}
              />
              {errors.email && <p className="text-xs text-red-500 font-semibold mt-1">⚠️ {errors.email}</p>}
            </div>

            {mode === 'signup' && (
              <>
                <div>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={e => { setPhone(e.target.value); setErrors(p=>({...p,phone:null})) }}
                    className={`w-full px-4 py-3 rounded-2xl border text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all ${errors.phone ? 'border-red-400 bg-red-50/30' : 'border-slate-200 focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10'}`}
                  />
                  {errors.phone && <p className="text-xs text-red-500 font-semibold mt-1">⚠️ {errors.phone}</p>}
                </div>
                <div>
                  <input
                    type="date"
                    value={dob}
                    onChange={e => setDob(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 transition-all"
                  />
                </div>
              </>
            )}

            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(p=>({...p,password:null})) }}
                className={`w-full px-4 py-3 rounded-2xl border text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all ${errors.password ? 'border-red-400 bg-red-50/30' : 'border-slate-200 focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10'}`}
              />
              {errors.password && <p className="text-xs text-red-500 font-semibold mt-1">⚠️ {errors.password}</p>}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-800 hover:from-teal-700 hover:to-teal-900 text-white font-bold text-sm shadow-md shadow-teal-700/20 hover:shadow-lg hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-4"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
            ) : (
              mode === 'login' ? 'Sign In to Reception' : 'Create My Account'
            )}
          </button>

          <div className="flex items-center justify-between text-xs">
            <button onClick={switchMode} className="text-teal-700 font-bold hover:underline">
              {mode === 'login' ? "Don't have an account? Sign up" : 'Already registered? Sign in'}
            </button>
            <button onClick={() => onAuth({ skipped: true })} className="text-slate-400 font-medium hover:text-slate-600">
              Skip for now →
            </button>
          </div>
        </div>

        {/* Right: AI Highlights Side Panel */}
        <div className="flex-1 bg-gradient-to-br from-teal-50 via-teal-100/40 to-sky-50 p-8 sm:p-12 border-t md:border-t-0 md:border-l border-slate-200/60 flex flex-col justify-center relative">
          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-600 text-white text-[11px] font-extrabold tracking-wider uppercase mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"/>
              Hospital AI Desk
            </span>
            <h3 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900">Smart Reception Features</h3>
            <p className="text-xs text-slate-500 mt-1">Live automated triage & instant doctor scheduling</p>
          </div>

          <div className="space-y-1 mb-6">
            {AI_FEATURES.map(f => <FeatureRow key={f.label} {...f} />)}
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-teal-200/60 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white text-lg font-bold shadow-md shadow-teal-600/30">
              🏥
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Hospital reception made effortless</p>
              <p className="text-[11px] text-slate-500">Automated slot booking, triage & diagnostics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}