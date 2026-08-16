import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Eye, EyeOff, KeyRound, LockKeyhole, Mail, ShieldCheck, Sparkles, UserRound } from 'lucide-react'
import { registerUser } from '../services/api.js'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', adminCode: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const update = (key) => (event) => setForm({ ...form, [key]: event.target.value })
  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (form.password.length < 8) { setError('Use at least 8 characters for a safer password.'); return }
    setLoading(true)
    try {
      const { data } = await registerUser(form)
      localStorage.setItem('token', data.token)
      localStorage.setItem('userRole', data.role)
      localStorage.setItem('userName', data.name)
      navigate('/admin')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Account creation was not available. Check the administrator code and backend connection.')
    } finally { setLoading(false) }
  }

  return (
    <main className="auth-page auth-register-page">
      <section className="auth-visual register-visual">
        <img src="/images/destinations/jaya-sri-maha-bodhi.webp" alt="" />
        <div className="auth-visual-overlay" />
        <Link to="/" className="back-link"><ArrowLeft size={16} /> Back to DayTrail</Link>
        <div><span className="eyebrow eyebrow-light"><ShieldCheck size={14} /> Invitation only</span><h1>Local knowledge deserves careful hands.</h1><p>Administrator registration requires the private access code configured by the project owner.</p></div>
      </section>
      <section className="auth-form-side">
        <div className="auth-form-card">
          <span className="auth-icon"><KeyRound /></span>
          <span className="eyebrow"><Sparkles size={14} /> Team onboarding</span>
          <h2>Create admin access.</h2>
          <p>Use your authorised registration code to continue.</p>
          {error && <div className="form-error">{error}</div>}
          <form onSubmit={submit}>
            <label><span>Full name</span><div className="input-with-icon"><UserRound size={17} /><input required autoComplete="name" value={form.name} onChange={update('name')} placeholder="Your name" /></div></label>
            <label><span>Email address</span><div className="input-with-icon"><Mail size={17} /><input type="email" required autoComplete="email" value={form.email} onChange={update('email')} placeholder="you@example.com" /></div></label>
            <label><span>Password</span><div className="input-with-icon"><LockKeyhole size={17} /><input type={showPassword ? 'text' : 'password'} required autoComplete="new-password" value={form.password} onChange={update('password')} placeholder="At least 8 characters" /><button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
            <label><span>Administrator code</span><div className="input-with-icon"><KeyRound size={17} /><input required value={form.adminCode} onChange={update('adminCode')} placeholder="Private access code" /></div></label>
            <button className="button button-dark auth-submit" disabled={loading}>{loading ? <><span className="spinner" /> Creating access…</> : <>Create secure account <ArrowRight size={16} /></>}</button>
          </form>
          <p className="auth-switch">Already have access? <Link to="/login">Sign in</Link></p>
        </div>
      </section>
    </main>
  )
}

