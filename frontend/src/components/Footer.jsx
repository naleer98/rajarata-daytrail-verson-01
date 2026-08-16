import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  Compass,
  Heart,
  Mail,
  MapPin,
  Route,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

const exploreLinks = [
  { label: 'All destinations', to: '/explore' },
  { label: 'Smart day planner', to: '/planner' },
  { label: 'Mihintale guide', to: '/place/mihintale' },
]

const usefulLinks = [
  { label: 'Discover RajaRata', to: '/' },
  { label: 'Administrator access', to: '/login' },
]

export default function Footer() {
  const footerRef = useRef(null)

  useEffect(() => {
    const footer = footerRef.current
    if (!footer || !('IntersectionObserver' in window)) return undefined

    const observer = new IntersectionObserver(([entry]) => {
      document.body.classList.toggle('footer-visible', entry.isIntersecting)
    }, { threshold: 0.04 })

    observer.observe(footer)
    return () => {
      observer.disconnect()
      document.body.classList.remove('footer-visible')
    }
  }, [])

  return (
    <footer className="site-footer premium-footer" ref={footerRef}>
      <div className="footer-orbit footer-orbit-one" aria-hidden="true" />
      <div className="footer-orbit footer-orbit-two" aria-hidden="true" />

      <div className="container premium-footer-shell">
        <section className="premium-footer-cta">
          <div className="premium-footer-cta-copy">
            <span className="premium-footer-kicker">
              <Sparkles size={14} /> Heritage-aware day planning
            </span>
            <h2>
              Walk through history.
              <em>Leave with a story.</em>
            </h2>
            <p>
              Build a beautifully timed route through Anuradhapura’s sacred
              places, ancient monuments and quiet local escapes.
            </p>
          </div>

          <div className="premium-footer-actions">
            <Link className="premium-footer-primary" to="/planner">
              <span className="premium-footer-action-icon">
                <Route size={21} />
              </span>
              <span>
                <small>Build your itinerary</small>
                <strong>Plan my day</strong>
              </span>
              <ArrowRight size={20} />
            </Link>

            <Link className="premium-footer-secondary" to="/explore">
              Explore all places <ArrowUpRight size={17} />
            </Link>
          </div>
        </section>

        <div className="premium-footer-main">
          <div className="premium-footer-brand">
            <Link to="/" className="brand brand-light" aria-label="RajaRata DayTrail home">
              <span className="brand-mark"><Compass size={22} /></span>
              <span className="brand-copy">
                <strong>RajaRata</strong>
                <small>DAYTRAIL · ANURADHAPURA</small>
              </span>
            </Link>

            <p>
              A refined digital companion for exploring Sri Lanka’s first
              great capital—with respect, context and a route that fits your day.
            </p>

            <span className="premium-footer-location">
              <MapPin size={16} /> Anuradhapura, Sri Lanka
            </span>
          </div>

          <nav className="premium-footer-links" aria-label="Footer explore navigation">
            <p className="premium-footer-title">Explore</p>
            {exploreLinks.map((link) => (
              <Link key={link.to} to={link.to}>
                {link.label} <ArrowUpRight size={14} />
              </Link>
            ))}
          </nav>

          <nav className="premium-footer-links" aria-label="Footer useful navigation">
            <p className="premium-footer-title">Useful</p>
            {usefulLinks.map((link) => (
              <Link key={link.to} to={link.to}>
                {link.label} <ArrowUpRight size={14} />
              </Link>
            ))}
            <a href="mailto:hello@rajaratadaytrail.lk">
              Contact the team <Mail size={14} />
            </a>
          </nav>

          <div className="premium-footer-visit-card">
            <span><MapPin size={18} /></span>
            <small>Start your journey</small>
            <h3>Ancient city, mapped beautifully.</h3>
            <p>Open Anuradhapura directly in Google Maps and begin exploring.</p>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Anuradhapura+Sri+Lanka"
              target="_blank"
              rel="noreferrer"
            >
              Open in Google Maps <ArrowUpRight size={16} />
            </a>
          </div>
        </div>

        <div className="premium-footer-proof">
          <div>
            <strong>10</strong>
            <span>Curated destinations</span>
          </div>
          <div>
            <Route size={18} />
            <span>Smart, time-aware routes</span>
          </div>
          <div>
            <ShieldCheck size={18} />
            <span>Respectful local guidance</span>
          </div>
        </div>

        <div className="premium-footer-bottom">
          <span>© {new Date().getFullYear()} RajaRata DayTrail</span>
          <span className="footer-made-with-care">
            Designed with <Heart size={13} fill="currentColor" /> for mindful travellers
          </span>
          <div className="webfixpro-credit" aria-label="Made by WebFixPro">
            <span className="webfixpro-logo"><img src="/webfixpro-logo.png" alt="WebFixPro" loading="lazy" decoding="async" /></span>
            <span className="webfixpro-copy"><small>Made by</small><strong>WebFixPro</strong></span>
          </div>
        </div>
      </div>
    </footer>
  )
}
