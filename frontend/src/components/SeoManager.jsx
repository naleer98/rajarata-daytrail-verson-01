import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPage } from '../utils/analytics.js'

const pageMeta = {
  '/': ['Explore Anuradhapura Beautifully', 'Discover curated heritage places and build a thoughtful Anuradhapura day trail.'],
  '/explore': ['Explore Places', 'Search Anuradhapura destinations with live map context, practical details and local guidance.'],
  '/planner': ['Smart Day Planner', 'Build a beautifully timed one-day Anuradhapura itinerary.'],
  '/admin': ['Destination Studio', 'Manage RajaRata DayTrail destination content.'],
}

export default function SeoManager() {
  const { pathname } = useLocation()

  useEffect(() => {
    const isPlace = pathname.startsWith('/place/')
    const [title, description] = isPlace
      ? ['Destination Guide', 'Opening hours, directions, weather, visitor tips and cultural guidance for Anuradhapura.']
      : pageMeta[pathname] || ['Page not found', 'Return to RajaRata DayTrail and continue exploring Anuradhapura.']

    document.title = `${title} | RajaRata DayTrail`
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', `${title} | RajaRata DayTrail`)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description)
    trackPage(pathname)
  }, [pathname])

  return null
}
