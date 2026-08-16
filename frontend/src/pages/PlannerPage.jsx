import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AlertTriangle, ArrowRight, Check, Clock3, Download, Gauge, MapPin, Route, Share2, Sparkles, Timer, X } from 'lucide-react'
import { createItinerary, fetchPlaces } from '../services/api.js'
import { findLocalPlace, places as localPlaces } from '../data/places.js'
import { mergeWithLocalPlaces } from '../utils/placeImage.js'
import { buildLocalItinerary } from '../utils/planner.js'
import PlaceCard from '../components/PlaceCard.jsx'
import MapView from '../components/MapView.jsx'
import { showToast } from '../components/ToastHost.jsx'
import { trackAction } from '../utils/analytics.js'
import { useSitePreferences } from '../context/SitePreferencesContext.jsx'

export default function PlannerPage() {
  const location = useLocation()
  const [places, setPlaces] = useState(localPlaces)
  const [selectedIds, setSelectedIds] = useState([])
  const [startTime, setStartTime] = useState('08:00')
  const [pace, setPace] = useState('Balanced')
  const [title, setTitle] = useState('My Anuradhapura DayTrail')
  const [itinerary, setItinerary] = useState(null)
  const [loading, setLoading] = useState(false)
  const { t } = useSitePreferences()

  useEffect(() => {
    fetchPlaces()
      .then(({ data }) => setPlaces(mergeWithLocalPlaces(data)))
      .catch(() => setPlaces(localPlaces))
  }, [])

  useEffect(() => {
    const requested = findLocalPlace(location.state?.selectedPlaceId)
    if (!requested) return
    const matching = places.find((place) => place.name === requested.name)
    if (matching) {
      setSelectedIds((current) => {
        const staleIds = new Set([location.state?.selectedPlaceId, requested._id])
        const cleaned = current.filter((id) => !staleIds.has(id) || id === matching._id)
        return cleaned.includes(matching._id) ? cleaned : [matching._id, ...cleaned]
      })
    }
  }, [location.state, places])

  const selectedPlaces = useMemo(() => places.filter((place) => selectedIds.includes(place._id)), [places, selectedIds])
  const routePlaces = itinerary?.routeOrder?.map((step) => step.place).filter(Boolean) || []
  const totalVisitMinutes = itinerary?.routeOrder?.reduce((total, step) => total + Number(step.visitDurationMinutes || 0), 0) || 0

  const togglePlace = (place) => {
    if (selectedIds.includes(place._id)) {
      setSelectedIds((current) => current.filter((id) => id !== place._id))
      return
    }
    if (selectedIds.length >= 6) {
      showToast({ type: 'warning', title: 'Six-stop limit', message: 'A one-day route works best with a maximum of six places.' })
      return
    }
    setSelectedIds((current) => [...current, place._id])
  }

  const generate = async (event) => {
    event.preventDefault()
    if (!selectedPlaces.length) {
      showToast({ type: 'warning', title: 'Choose a destination', message: 'Select at least one place before generating your route.' })
      return
    }
    setLoading(true)
    try {
      const { data } = await createItinerary({ placeIds: selectedIds, startTime, pace, title })
      setItinerary(data)
      trackAction('plans')
    } catch {
      setItinerary(buildLocalItinerary(selectedPlaces, startTime, pace))
      trackAction('plans')
      showToast({ type: 'info', title: 'Route created locally', message: 'Connect the server when you want to save this itinerary to an account.' })
    } finally {
      setLoading(false)
      setTimeout(() => document.getElementById('your-route')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120)
    }
  }

  const shareItinerary = async () => {
    if (!itinerary) return
    const stops = itinerary.routeOrder.map((step, index) => `${index + 1}. ${step.arrivalTime} — ${step.place?.name}`).join('\n')
    const text = `${title}\n${stops}\nFinish: ${itinerary.expectedEndTime}\nCreated with RajaRata DayTrail`
    try {
      if (navigator.share) await navigator.share({ title, text })
      else { await navigator.clipboard.writeText(text); showToast({ type: 'success', title: 'Itinerary copied', message: 'Paste it into WhatsApp or any message.' }) }
      trackAction('shares')
    } catch (error) {
      if (error.name !== 'AbortError') showToast({ type: 'error', title: 'Could not share', message: 'Please try again.' })
    }
  }

  const downloadPdf = () => {
    showToast({ type: 'info', title: 'Print view ready', message: 'Choose “Save as PDF” in the print window.' })
    setTimeout(() => window.print(), 180)
  }

  return (
    <main className="planner-page">
      <section className="page-hero planner-hero">
        <div className="page-hero-orb" />
        <div className="container planner-hero-grid">
          <div><span className="eyebrow eyebrow-light"><Sparkles size={14} /> {t('plannerKicker')}</span><h1>{t('plannerTitle')}<br /><em>{t('plannerAccent')}</em></h1><p>{t('plannerCopy')}</p></div>
          <div className="planner-hero-stats"><span><b>01</b><small>Choose</small></span><i /><span><b>02</b><small>Personalise</small></span><i /><span><b>03</b><small>Follow</small></span></div>
        </div>
      </section>

      <section className="section planner-builder-section">
        <div className="container planner-builder-grid">
          <aside className="planner-controls">
            <div className="planner-controls-head"><span><Route size={19} /></span><div><small>YOUR DAYTRAIL</small><h2>Set the rhythm</h2></div></div>
            <form onSubmit={generate}>
              <label><span>Plan name</span><input value={title} onChange={(event) => setTitle(event.target.value)} maxLength="80" /></label>
              <div className="control-row">
                <label><span><Clock3 size={14} /> Start time</span><input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} /></label>
                <label><span><Gauge size={14} /> Pace</span><select value={pace} onChange={(event) => setPace(event.target.value)}><option>Relaxed</option><option>Balanced</option><option>Fast</option></select></label>
              </div>
              <div className="selected-summary">
                <div><span>{selectedIds.length}/6</span><div><b>Places selected</b><small>{selectedIds.length ? 'Ready to arrange' : 'Choose from the list'}</small></div></div>
                {selectedPlaces.length > 0 && <div className="selected-chips">{selectedPlaces.map((place) => <button type="button" key={place._id} onClick={() => togglePlace(place)}>{place.name}<X size={12} /></button>)}</div>}
              </div>
              <button className="button button-gold planner-generate" disabled={loading || !selectedIds.length}>{loading ? <><span className="spinner" /> Designing your route…</> : <><Route size={17} /> Generate smart route <ArrowRight size={16} /></>}</button>
              <p className="planner-assurance"><Check size={13} /> Works locally; an account is not required.</p>
            </form>
          </aside>

          <div className="planner-destinations">
            <div className="results-meta"><div><MapPin size={15} /><span><b>Choose your stops</b></span></div><small>Up to 6 places · tap to select</small></div>
            <div className="planner-card-grid">{places.map((place, index) => <PlaceCard key={place._id} place={place} index={index} onSelect={togglePlace} isSelected={selectedIds.includes(place._id)} />)}</div>
          </div>
        </div>
      </section>

      {itinerary && (
        <section className="section itinerary-section" id="your-route">
          <div className="container">
            <div className="section-heading split-heading itinerary-heading"><div><span className="eyebrow"><Sparkles size={14} /> Route ready</span><h2>{title}</h2></div><div className="itinerary-export"><button type="button" onClick={shareItinerary}><Share2 /> Share route</button><button type="button" onClick={downloadPdf}><Download /> Save PDF</button></div></div>
            <div className="itinerary-stats">
              <div><Route /><span><small>Total distance</small><b>{itinerary.totalDistanceKm} km</b></span></div>
              <div><Timer /><span><small>Time on the move</small><b>{itinerary.totalTravelTimeMinutes} min</b></span></div>
              <div><Clock3 /><span><small>Experience time</small><b>{Math.floor(totalVisitMinutes / 60)}h {totalVisitMinutes % 60}m</b></span></div>
              <div><Sparkles /><span><small>Finish around</small><b>{itinerary.expectedEndTime}</b></span></div>
            </div>

            <div className="itinerary-content-grid">
              <div className="itinerary-timeline">
                {itinerary.routeOrder.map((step, index) => (
                  <article key={step.place?._id || index} className="timeline-stop">
                    <div className="timeline-rail"><span>{index + 1}</span>{index < itinerary.routeOrder.length - 1 && <i />}</div>
                    <div className="timeline-time"><b>{step.arrivalTime}</b><small>to {step.departureTime}</small></div>
                    <div className="timeline-card"><small>{step.place?.category} · {step.distanceFromPrevKm} km from previous</small><h3>{step.place?.name}</h3><div><span><Clock3 size={13} /> {step.visitDurationMinutes} min visit</span><span><Route size={13} /> {step.travelTimeFromPrevMinutes} min travel</span></div></div>
                  </article>
                ))}
              </div>
              <MapView places={routePlaces} showRoute className="itinerary-map" />
            </div>

            {(itinerary.warnings?.length > 0 || itinerary.culturalTips?.length > 0) && (
              <div className="route-notes">
                {itinerary.warnings?.length > 0 && <div><span><AlertTriangle size={18} /></span><section><h3>Timing notes</h3>{itinerary.warnings.map((warning) => <p key={warning}>{warning}</p>)}</section></div>}
                {itinerary.culturalTips?.length > 0 && <div><span><Sparkles size={18} /></span><section><h3>Cultural notes</h3>{itinerary.culturalTips.map((tip) => <p key={tip}>{tip}</p>)}</section></div>}
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  )
}
