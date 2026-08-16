import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sparkles } from 'lucide-react'
import { loginUser } from '../services/api.js'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await loginUser(form)
      localStorage.setItem('token', data.token)
      localStorage.setItem('userRole', data.role)
      localStorage.setItem('userName', data.name)
      navigate(data.role === 'admin' ? '/admin' : '/')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not sign in. Check that the backend is running and try again.')
    } finally { setLoading(false) }
  }

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <img src="/images/hero-ruwanwelisaya-hd.png" alt="" />
        <div className="auth-visual-overlay" />
        <Link to="/" className="back-link"><ArrowLeft size={16} /> Back to DayTrail</Link>
        <div><span className="eyebrow eyebrow-light"><ShieldCheck size={14} /> Secure team access</span><h1>Care for the guide<br />behind the journey.</h1><p>Manage verified destination details, images and travel advice from one focused workspace.</p></div>
      </section>
      <section className="auth-form-side">
        <div className="auth-form-card">
          <span className="auth-icon"><LockKeyhole /></span>
          <span className="eyebrow"><Sparkles size={14} /> Administrator portal</span>
          <h2>Welcome back.</h2>
          <p>Sign in to manage RajaRata DayTrail.</p>
          {error && <div className="form-error">{error}</div>}
          <form onSubmit={submit}>
            <label><span>Email address</span><div className="input-with-icon"><Mail size={17} /><input type="email" required autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="admin@rajaratadaytrail.lk" /></div></label>
            <label><span>Password</span><div className="input-with-icon"><LockKeyhole size={17} /><input type={showPassword ? 'text' : 'password'} required autoComplete="current-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Enter your password" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label="Toggle password visibility">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
            <button className="button button-dark auth-submit" disabled={loading}>{loading ? <><span className="spinner" /> Signing in…</> : <>Sign in securely <ArrowRight size={16} /></>}</button>
          </form>
          <p className="auth-switch">Need a new administrator account? <Link to="/register">Request access</Link></p>
        </div>
      </section>
    </main>
  )
}

