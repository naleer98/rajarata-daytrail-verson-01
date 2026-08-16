import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Clock3,
  Compass,
  MapPin,
  Navigation,
  Phone,
  Route,
  ShieldCheck,
  Shirt,
  Sparkles,
  Star,
  Tag,
  Trees,
  Heart,
  Share2,
} from 'lucide-react'
import { fetchPlaceById } from '../services/api.js'
import { findLocalPlace, places } from '../data/places.js'
import { getPlaceImage, mergeWithLocalPlaces } from '../utils/placeImage.js'
import MapView from '../components/MapView.jsx'
import EtiquetteGuide from '../components/EtiquetteGuide.jsx'
import PhotoGallery from '../components/PhotoGallery.jsx'
import ReviewsSection from '../components/ReviewsSection.jsx'
import WeatherCard from '../components/WeatherCard.jsx'
import { DetailPageSkeleton } from '../components/Skeletons.jsx'
import useFavourites from '../hooks/useFavourites.js'
import { showToast } from '../components/ToastHost.jsx'
import { trackAction } from '../utils/analytics.js'

const toMinutes = (value) => {
  const [hours, minutes] = String(value || '').split(':').map(Number)
  return Number.isFinite(hours) && Number.isFinite(minutes) ? (hours * 60) + minutes : null
}

function getOpenStatus(openingTime, closingTime) {
  const opens = toMinutes(openingTime)
  const closes = toMinutes(closingTime)
  if (opens == null || closes == null) return { label: 'Hours available', open: true }

  const date = new Date()
  const current = (date.getHours() * 60) + date.getMinutes()
  const isOpen = closes >= opens
    ? current >= opens && current <= closes
    : current >= opens || current <= closes

  return { label: isOpen ? 'Open now' : 'Closed now', open: isOpen }
}

export default function PlaceDetailPage() {
  const { id } = useParams()
  const [place, setPlace] = useState(() => findLocalPlace(id))
  const [loading, setLoading] = useState(!findLocalPlace(id))
  const { isFavourite, toggleFavourite } = useFavourites()

  useEffect(() => {
    const local = findLocalPlace(id)
    if (local) {
      setPlace(local)
      setLoading(false)
      return
    }

    setLoading(true)
    fetchPlaceById(id)
      .then(({ data }) => setPlace(mergeWithLocalPlaces([data])[0]))
      .catch(() => setPlace(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <DetailPageSkeleton />
  }

  if (!place) {
    return (
      <main className="not-found-state">
        <Compass size={32} />
        <h1>That trail has gone quiet.</h1>
        <p>We couldn’t find this destination.</p>
        <Link className="button button-dark" to="/explore"><ArrowLeft size={16} /> Back to places</Link>
      </main>
    )
  }

  const parsedLatitude = Number(place.coordinates?.lat)
  const parsedLongitude = Number(place.coordinates?.lng)
  const latitude = Number.isFinite(parsedLatitude) ? parsedLatitude : 8.3114
  const longitude = Number.isFinite(parsedLongitude) ? parsedLongitude : 80.4037
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
  const related = places
    .filter((item) => item._id !== place._id && item.category === place.category)
    .slice(0, 2)
  const openStatus = getOpenStatus(place.openingTime, place.closingTime)
  const saved = isFavourite(place._id)

  const savePlace = () => {
    const active = toggleFavourite(place._id)
    showToast({ type: active ? 'success' : 'info', title: active ? 'Saved to favourites' : 'Removed from favourites', message: place.name })
  }

  const sharePlace = async () => {
    const data = { title: place.name, text: `Explore ${place.name} with RajaRata DayTrail`, url: window.location.href }
    try {
      if (navigator.share) await navigator.share(data)
      else { await navigator.clipboard.writeText(window.location.href); showToast({ type: 'success', title: 'Link copied', message: 'Share this destination with your travel group.' }) }
      trackAction('shares')
    } catch (error) {
      if (error.name !== 'AbortError') showToast({ type: 'error', title: 'Could not share', message: 'Copy the page address from your browser instead.' })
    }
  }

  return (
    <main className="place-detail-page premium-detail-page">
      <section className="detail-hero premium-detail-hero">
        <img src={getPlaceImage(place)} alt={place.name} fetchPriority="high" decoding="async" />
        <div className="detail-hero-overlay premium-detail-hero-overlay" />
        <div className="premium-detail-grain" />

        <div className="container detail-hero-content premium-detail-hero-content">
          <div className="premium-detail-topline">
            <Link to="/explore" className="back-link premium-back-link">
              <ArrowLeft size={15} />
              Explore destinations
            </Link>

            <span className="premium-rating-pill">
              <Star size={13} fill="currentColor" />
              {place.rating || '4.8'}
              <small>visitor rating</small>
            </span>
          </div>

          <div className="premium-detail-hero-grid">
            <div className="detail-hero-bottom premium-detail-hero-copy">
              <span className="eyebrow eyebrow-light">
                <MapPin size={13} />
                {place.category} · Anuradhapura
              </span>
              <h1>{place.name}</h1>
              <p>{place.tagline || place.description}</p>

              <div className="detail-hero-actions premium-detail-actions">
                <Link
                  to="/planner"
                  state={{ selectedPlaceId: place._id }}
                  className="button button-gold"
                >
                  <Route size={17} />
                  Add to my day
                </Link>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="button button-ghost"
                >
                  <Navigation size={17} />
                  Get directions
                </a>
                <button type="button" className={`button detail-save-button ${saved ? 'is-saved' : ''}`} onClick={savePlace}><Heart size={17} fill={saved ? 'currentColor' : 'none'} /> {saved ? 'Saved' : 'Save place'}</button>
                <button type="button" className="button detail-share-button" onClick={sharePlace}><Share2 size={17} /> Share</button>
              </div>
            </div>

            <aside className="premium-hero-visit-card">
              <div className="premium-visit-status">
                <span className={openStatus.open ? 'is-open' : 'is-closed'}><i /> {openStatus.label}</span>
                <small>Today</small>
              </div>
              <h2>Plan with confidence.</h2>
              <div className="premium-hero-visit-facts">
                <div><Clock3 size={16} /><span><small>Opening hours</small><b>{place.openingTime}–{place.closingTime}</b></span></div>
                <div><Trees size={16} /><span><small>Recommended stay</small><b>{place.visitDuration} minutes</b></span></div>
                <div><MapPin size={16} /><span><small>From city centre</small><b>{place.distanceFromHome} km</b></span></div>
              </div>
            </aside>
          </div>

          <a className="premium-scroll-cue" href="#visit-guide">
            <span>Discover the story</span>
            <ArrowDown size={14} />
          </a>
        </div>
      </section>

      <PhotoGallery place={place} />

      <section className="detail-quickbar premium-detail-quickbar">
        <div className="container detail-quick-grid premium-detail-quick-grid">
          <div><Clock3 /><span><small>Opening hours</small><b>{place.openingTime}–{place.closingTime}</b></span></div>
          <div><Tag /><span><small>Entry</small><b>{place.entryFee}</b></span></div>
          <div><MapPin /><span><small>Distance</small><b>{place.distanceFromHome} km</b></span></div>
          <div><Trees /><span><small>Ideal visit</small><b>{place.visitDuration} minutes</b></span></div>
        </div>
      </section>

      <section id="visit-guide" className="section detail-main-section premium-detail-main">
        <div className="container detail-main-grid premium-detail-main-grid">
          <article className="detail-story premium-detail-story">
            <div className="premium-story-heading">
              <span className="premium-section-number">01</span>
              <div>
                <span className="eyebrow"><Sparkles size={14} /> The essential guide</span>
                <h2>Why this place stays with you.</h2>
              </div>
            </div>

            <p className="detail-lead premium-detail-lead">{place.description}</p>

            <div className="travel-tip-card premium-travel-tip">
              <span><Compass size={23} /></span>
              <div>
                <small>LOCAL NOTE</small>
                <h3>Know before you go</h3>
                <p>{place.travelTips}</p>
              </div>
            </div>

            <div className="premium-subsection-heading">
              <div>
                <span className="premium-section-number">02</span>
                <div><small>Practical details</small><h3>Visit with confidence</h3></div>
              </div>
              <ShieldCheck size={20} />
            </div>

            <div className="detail-info-grid premium-detail-info-grid">
              <div><span><Shirt size={19} /></span><small>Dress code</small><b>{place.dressCode}</b></div>
              <div><span><Clock3 size={19} /></span><small>Best time</small><b>{place.bestVisitTime}</b></div>
              <div><span><Phone size={19} /></span><small>Contact</small><b>{place.contactNumber}</b></div>
              <div><span><MapPin size={19} /></span><small>Address</small><b>{place.address}</b></div>
            </div>

            <div className="premium-facilities-heading">
              <div><span className="premium-section-number">03</span><div><small>On-site comfort</small><h3>Available facilities</h3></div></div>
              <span>{place.facilities?.length || 0} available</span>
            </div>

            <div className="facility-list premium-facility-list">
              {place.facilities?.length
                ? place.facilities.map((facility) => <span key={facility}><i /> {facility}</span>)
                : <span><i /> Essential visitor facilities</span>}
            </div>
          </article>

          <aside className="detail-map-card premium-detail-map-card">
            <div className="premium-detail-map-head">
              <div><small>YOUR LOCATION GUIDE</small><strong>Find your way there</strong></div>
              <span><MapPin size={15} /></span>
            </div>

            <MapView
              places={[place]}
              center={[latitude, longitude]}
              zoom={15}
              className="detail-map premium-detail-map"
            />

            <div className="detail-map-copy premium-detail-map-copy">
              <div>
                <MapPin size={18} />
                <span>
                  <b>{place.address}</b>
                  <small>{latitude.toFixed(4)}, {longitude.toFixed(4)}</small>
                </span>
              </div>
              <a href={mapsUrl} target="_blank" rel="noreferrer">
                Start directions
                <ArrowRight size={15} />
              </a>
            </div>
            <WeatherCard coordinates={{ lat: latitude, lng: longitude }} />
          </aside>
        </div>
      </section>

      <ReviewsSection place={place} />

      <section className="section detail-etiquette-section premium-detail-etiquette">
        <div className="container">
          <div className="section-heading split-heading">
            <div>
              <span className="eyebrow"><ShieldCheck size={14} /> Sacred-city etiquette</span>
              <h2>Travel gently.</h2>
            </div>
            <p>These simple habits protect the atmosphere of living religious sites and help every visitor feel welcome.</p>
          </div>
          <EtiquetteGuide compact />
        </div>
      </section>

      {related.length > 0 && (
        <section className="detail-next-section premium-detail-next">
          <div className="container">
            <div className="premium-related-heading">
              <div><span className="eyebrow eyebrow-light">Continue the trail</span><h2>More {place.category.toLowerCase()} places nearby.</h2></div>
              <Link to="/explore">View all places <ArrowRight size={15} /></Link>
            </div>

            <div className="detail-related-grid premium-detail-related-grid">
              {related.map((item) => (
                <Link to={`/place/${item._id}`} key={item._id}>
                  <img src={getPlaceImage(item)} alt={item.name} loading="lazy" decoding="async" />
                  <span className="premium-related-category">{item.category}</span>
                  <span className="premium-related-copy">
                    <small>{item.distanceFromHome} km · {item.visitDuration} min</small>
                    <b>{item.name}</b>
                    <i><ArrowRight size={17} /></i>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
