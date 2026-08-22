import { useEffect, useMemo, useState } from 'react'
import {
  BarChart3,
  CalendarDays,
  Eye,
  Heart,
  Route,
  Search,
  Share2,
  TrendingUp
} from 'lucide-react'

import useFavourites from '../hooks/useFavourites.js'
import { getAnalytics } from '../utils/analytics.js'

const pageLabels = {
  '/': 'Home',
  '/login': 'Login Page',
  '/admin': 'Admin Dashboard',
  '/explore': 'Explore Places',
  '/planner': 'Day Planner',
  '/register': 'Register',
  '/places': 'Places'
}

const getPageLabel = (path) => {
  return pageLabels[path] || path
}

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(getAnalytics)
  const { favourites } = useFavourites()

  useEffect(() => {
    const timer = setInterval(() => {
      setAnalytics(getAnalytics())
    }, 3000)

    return () => clearInterval(timer)
  }, [])

  const topPages = useMemo(() => {
    return Object.entries(analytics.pages || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  }, [analytics.pages])

  const maxCount = Math.max(
    1,
    ...topPages.map(([, count]) => count)
  )

  const totalPageViews = analytics.totalViews || 0

  const metrics = [
    {
      label: 'Page views',
      value: totalPageViews,
      icon: Eye,
      hint: totalPageViews > 0 ? 'Tracking active' : 'No activity yet',
      type: 'views'
    },
    {
      label: 'Favourites',
      value: favourites.length,
      icon: Heart,
      hint:
        favourites.length > 0
          ? `${favourites.length} saved place${favourites.length === 1 ? '' : 's'}`
          : 'Nothing saved yet',
      type: 'favourites'
    },
    {
      label: 'Plans made',
      value: analytics.plans || 0,
      icon: Route,
      hint:
        analytics.plans > 0
          ? 'Traveller planning'
          : 'No plans yet',
      type: 'plans'
    },
    {
      label: 'Plans shared',
      value: analytics.shares || 0,
      icon: Share2,
      hint:
        analytics.shares > 0
          ? 'Sharing activity'
          : 'No shares yet',
      type: 'shares'
    },
    {
      label: 'Search sessions',
      value: analytics.searches || 0,
      icon: Search,
      hint:
        analytics.searches > 0
          ? 'Destination discovery'
          : 'No searches yet',
      type: 'searches'
    }
  ]

  const formattedDate = analytics.lastVisit
    ? new Date(analytics.lastVisit).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'No activity yet'

  return (
    <section className="premium-analytics">
      <header className="premium-analytics-header">
        <div className="premium-analytics-heading">
          <span className="premium-analytics-eyebrow">
            <BarChart3 />
            Local insight
          </span>

          <h2>Traveller activity</h2>

          <p>
            A quick snapshot of how travellers interact with RajaRata
            DayTrail.
          </p>
        </div>

        <div className="premium-analytics-date">
          <CalendarDays />
          <span>
            <small>Last activity</small>
            <strong>{formattedDate}</strong>
          </span>
        </div>
      </header>

      <div className="premium-metric-grid">
        {metrics.map((metric) => {
          const Icon = metric.icon

          return (
            <article
              className={`premium-metric-card premium-metric-${metric.type}`}
              key={metric.label}
            >
              <div className="premium-metric-top">
                <div className="premium-metric-icon">
                  <Icon />
                </div>

                <span className="premium-metric-status">
                  <TrendingUp />
                  Live
                </span>
              </div>

              <div className="premium-metric-content">
                <small>{metric.label}</small>
                <strong>{metric.value}</strong>
                <p>{metric.hint}</p>
              </div>

              <div className="premium-metric-decoration" />
            </article>
          )
        })}
      </div>

      <div className="premium-route-panel">
        <div className="premium-route-header">
          <div>
            <span>Top destinations</span>
            <h3>Most visited pages</h3>
          </div>

          <small>
            {totalPageViews} total view{totalPageViews === 1 ? '' : 's'}
          </small>
        </div>

        {topPages.length > 0 ? (
          <div className="premium-route-list">
            {topPages.map(([path, count], index) => {
              const percentage =
                totalPageViews > 0
                  ? Math.round((count / totalPageViews) * 100)
                  : 0

              const barWidth =
                maxCount > 0
                  ? Math.max(3, (count / maxCount) * 100)
                  : 0

              return (
                <div className="premium-route-row" key={path}>
                  <div className="premium-route-rank">
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  <div className="premium-route-info">
                    <div className="premium-route-title">
                      <span>{getPageLabel(path)}</span>

                      <div>
                        <strong>{count}</strong>
                        <small>{percentage}%</small>
                      </div>
                    </div>

                    <div className="premium-route-track">
                      <span
                        style={{
                          width: `${barWidth}%`
                        }}
                      />
                    </div>

                    <small className="premium-route-path">
                      {path}
                    </small>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="premium-empty-analytics">
            <BarChart3 />
            <strong>No traveller activity yet</strong>
            <p>
              Analytics will appear here as visitors start exploring the
              website.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}