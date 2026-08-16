import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState(null)
  const [hidden, setHidden] = useState(() => sessionStorage.getItem('pwa-prompt-hidden') === '1')

  useEffect(() => {
    const capture = (event) => {
      event.preventDefault()
      setPrompt(event)
    }
    window.addEventListener('beforeinstallprompt', capture)
    return () => window.removeEventListener('beforeinstallprompt', capture)
  }, [])

  if (!prompt || hidden) return null

  const install = async () => {
    await prompt.prompt()
    await prompt.userChoice
    setPrompt(null)
  }

  const dismiss = () => {
    sessionStorage.setItem('pwa-prompt-hidden', '1')
    setHidden(true)
  }

  return <aside className="pwa-install-card"><span><Download /></span><div><b>Install RajaRata DayTrail</b><small>Use it like an app and keep essential pages available.</small></div><button type="button" onClick={install}>Install</button><button type="button" onClick={dismiss} aria-label="Dismiss install prompt"><X /></button></aside>
}
