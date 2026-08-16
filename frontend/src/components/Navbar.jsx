import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Compass, Languages, LogOut, Map, Menu, Moon, Route, ShieldCheck, Sun, X } from 'lucide-react'
import { useSitePreferences } from '../context/SitePreferencesContext.jsx'

const links = [
  { to: '/', label: 'Discover', end: true },
  { to: '/explore', label: 'Places' },
  { to: '/planner', label: 'Day planner' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isAdmin = localStorage.getItem('token') && localStorage.getItem('userRole') === 'admin'
  const userName = localStorage.getItem('userName')
  const { language, setLanguage, theme, toggleTheme, t } = useSitePreferences()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userName')
    setOpen(false)
    navigate('/')
  }

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="nav-wrap">
        <Link to="/" className="brand" aria-label="RajaRata DayTrail home">
          <span className="brand-mark"><Compass size={22} /></span>
          <span className="brand-copy">
            <strong>RajaRata</strong>
            <small>DAYTRAIL · ANURADHAPURA</small>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {links.map((link) => (
            <NavLink key={link.to} {...link} className={({ isActive }) => isActive ? 'active' : ''}>
              {link.to === '/' ? t('discover') : link.to === '/explore' ? t('places') : t('planner')}
            </NavLink>
          ))}
          {isAdmin ? (
            <NavLink to="/admin" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
              <ShieldCheck size={14} /> {t('admin')}
            </NavLink>
          ) : (
            <NavLink to="/login" className={({ isActive }) => `admin-login-link${isActive ? ' active' : ''}`}>
              <ShieldCheck size={14} /> {t('adminLogin')}
            </NavLink>
          )}
        </nav>

        <div className="nav-actions">
          {isAdmin ? (
            <button className="user-pill" onClick={logout} title="Sign out">
              <span>{userName?.split(' ')[0] || 'Admin'}</span><LogOut size={15} />
            </button>
          ) : (
            <Link className="nav-map-link" to="/explore"><Map size={16} /> {t('liveMap')}</Link>
          )}
          <div className="preference-controls">
            <label title={t('language')}><Languages /><select value={language} onChange={(event) => setLanguage(event.target.value)} aria-label={t('language')}><option value="en">EN</option><option value="ta">தமிழ்</option><option value="si">සිං</option></select></label>
            <button type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} title={t('theme')}>{theme === 'dark' ? <Sun /> : <Moon />}</button>
          </div>
          <Link className="nav-cta" to="/planner"><Route size={16} /> {t('planDay')}</Link>
          <button className="menu-button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Toggle navigation">
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {open && (
        <div className="mobile-menu">
          <div className="mobile-menu-inner">
            <p className="mobile-menu-label">Explore the ancient capital</p>
            {links.map((link) => (
              <NavLink key={link.to} {...link} className={({ isActive }) => isActive ? 'active' : ''}>
                <span>{link.to === '/' ? t('discover') : link.to === '/explore' ? t('places') : t('planner')}</span><span aria-hidden="true">↗</span>
              </NavLink>
            ))}
            {isAdmin ? (
              <NavLink to="/admin" className="mobile-admin-link"><span>{t('admin')}</span><ShieldCheck size={18} /></NavLink>
            ) : (
              <NavLink to="/login" className="mobile-admin-link"><span>{t('adminLogin')}</span><ShieldCheck size={18} /></NavLink>
            )}
            <div className="mobile-preferences">
              <label><Languages /><span>{t('language')}</span><select value={language} onChange={(event) => setLanguage(event.target.value)}><option value="en">English</option><option value="ta">தமிழ்</option><option value="si">සිංහල</option></select></label>
              <button type="button" onClick={toggleTheme}>{theme === 'dark' ? <Sun /> : <Moon />}<span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span></button>
            </div>
            <div className="mobile-menu-foot">
              <span>Heritage-aware routes</span><span>•</span><span>Live maps</span><span>•</span><span>Local guidance</span>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
