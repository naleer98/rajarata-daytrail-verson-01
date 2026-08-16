import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'

const TOAST_EVENT = 'rajarata:toast'

export function showToast({ type = 'info', title = 'RajaRata DayTrail', message, duration = 4200 }) {
  if (typeof window === 'undefined' || !message) return
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, {
    detail: {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type,
      title,
      message,
      duration,
    },
  }))
}

const ToastIcon = ({ type }) => {
  if (type === 'success') return <CheckCircle2 />
  if (type === 'warning' || type === 'error') return <AlertTriangle />
  return <Info />
}

export default function ToastHost() {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const dismiss = (id) => {
    const timer = timers.current.get(id)
    if (timer) clearTimeout(timer)
    timers.current.delete(id)
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }

  useEffect(() => {
    const activeTimers = timers.current
    const receiveToast = ({ detail }) => {
      setToasts((current) => [...current.filter((toast) => toast.id !== detail.id), detail].slice(-4))
      const timer = window.setTimeout(() => dismiss(detail.id), detail.duration)
      activeTimers.set(detail.id, timer)
    }

    window.addEventListener(TOAST_EVENT, receiveToast)
    return () => {
      window.removeEventListener(TOAST_EVENT, receiveToast)
      activeTimers.forEach((timer) => clearTimeout(timer))
      activeTimers.clear()
    }
  }, [])

  return (
    <div className="toast-region" aria-live="polite" aria-label="Notifications">
      {toasts.map((toast) => (
        <article
          className={`custom-toast is-${toast.type}`}
          key={toast.id}
          role={toast.type === 'error' ? 'alert' : 'status'}
        >
          <span className="custom-toast-icon"><ToastIcon type={toast.type} /></span>
          <span className="custom-toast-copy">
            <strong>{toast.title}</strong>
            <small>{toast.message}</small>
          </span>
          <button type="button" onClick={() => dismiss(toast.id)} aria-label="Dismiss notification">
            <X />
          </button>
          <i className="custom-toast-progress" style={{ '--toast-duration': `${toast.duration}ms` }} />
        </article>
      ))}
    </div>
  )
}