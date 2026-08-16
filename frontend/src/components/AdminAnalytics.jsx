import { useEffect, useMemo, useState } from 'react'
import { BarChart3, CalendarDays, Eye, Heart, Route, Search, Share2 } from 'lucide-react'
import useFavourites from '../hooks/useFavourites.js'
import { getAnalytics } from '../utils/analytics.js'

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(getAnalytics)
  const { favourites } = useFavourites()
  useEffect(() => {
    const timer = setInterval(() => setAnalytics(getAnalytics()), 3000)
    return () => clearInterval(timer)
  }, [])

  const topPages = useMemo(() => Object.entries(analytics.pages || {}).sort((a, b) => b[1] - a[1]).slice(0, 4), [analytics.pages])
  const max = Math.max(1, ...topPages.map(([, count]) => count))

  return <section className="admin-analytics-panel"><header><div><span><BarChart3 /> Local insight</span><h2>Traveller activity</h2><p>Privacy-friendly usage stored in this browser.</p></div><small><CalendarDays /> {analytics.lastVisit ? new Date(analytics.lastVisit).toLocaleDateString() : 'No activity yet'}</small></header><div className="admin-analytics-metrics"><div><Eye /><span><small>Page views</small><b>{analytics.totalViews || 0}</b></span></div><div><Heart /><span><small>Favourites</small><b>{favourites.length}</b></span></div><div><Route /><span><small>Plans made</small><b>{analytics.plans || 0}</b></span></div><div><Share2 /><span><small>Plans shared</small><b>{analytics.shares || 0}</b></span></div><div><Search /><span><small>Search sessions</small><b>{analytics.searches || 0}</b></span></div></div>{topPages.length > 0 && <div className="analytics-bars">{topPages.map(([path, count]) => <div key={path}><span>{path === '/' ? 'Home' : path}</span><i><b style={{ width: `${(count / max) * 100}%` }} /></i><strong>{count}</strong></div>)}</div>}</section>
}
