import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Clock3, Compass, MapPin, Route, Sparkles, SunMedium } from 'lucide-react'
import { fetchPlaces } from '../services/api.js'
import { places as localPlaces } from '../data/places.js'
import { mergeWithLocalPlaces } from '../utils/placeImage.js'
import PlaceCard from '../components/PlaceCard.jsx'
import MapView from '../components/MapView.jsx'
import EtiquetteGuide from '../components/EtiquetteGuide.jsx'
import { useSitePreferences } from '../context/SitePreferencesContext.jsx'

const dayPreview = [
  { time: '07:30', place: 'Jaya Sri Maha Bodhi', note: 'Quiet morning ritual' },
  { time: '09:15', place: 'Ruwanwelisaya', note: 'Grand stupa walk' },
  { time: '16:45', place: 'Tissa Wewa', note: 'Golden-hour finish' },
]

export default function HomePage() {
  const [destinations, setDestinations] = useState(localPlaces)
  const { t } = useSitePreferences()

  useEffect(() => {
    fetchPlaces()
      .then(({ data }) => setDestinations(mergeWithLocalPlaces(data)))
      .catch(() => setDestinations(localPlaces))
  }, [])

  return (
    <main>
      <section className="home-hero">
        <img className="hero-image" src="/images/hero-ruwanwelisaya-hd.png" alt="Ruwanwelisaya stupa in Anuradhapura at golden hour" fetchPriority="high" decoding="async" />
        <div className="hero-overlay" />
        <div className="hero-grain" />
        <div className="container hero-layout">
          <div className="hero-copy animate-in">
            <span className="eyebrow eyebrow-light"><Sparkles size={14} /> {t('homeKicker')}</span>
            <h1>{t('homeTitle')} <em>{t('homeAccent')}</em></h1>
            <p>{t('homeCopy')}</p>
            <div className="hero-actions">
              <Link to="/planner" className="button button-gold"><Route size={18} /> Build my day <ArrowRight size={17} /></Link>
              <Link to="/explore" className="button button-ghost">Explore places</Link>
            </div>
            <div className="hero-proof">
              <div className="avatar-stack"><span>RK</span><span>ND</span><span>SL</span></div>
              <div><strong>10 verified stops</strong><small>Local details · live route context</small></div>
            </div>
          </div>

          <aside className="day-preview animate-in delay-2">
            <div className="preview-top">
              <span><SunMedium size={17} /> Your balanced day</span>
              <small>6h 20m</small>
            </div>
            <div className="preview-route">
              {dayPreview.map((stop, index) => (
                <div className="preview-stop" key={stop.place}>
                  <span className="stop-number">{index + 1}</span>
                  <time>{stop.time}</time>
                  <div><strong>{stop.place}</strong><small>{stop.note}</small></div>
                  {index < dayPreview.length - 1 && <i />}
                </div>
              ))}
            </div>
            <Link to="/planner">Make this route yours <ArrowRight size={15} /></Link>
          </aside>
        </div>
        <div className="hero-facts">
          <div className="container">
            <span><b>2,300+</b> years of history</span>
            <span><b>UNESCO</b> World Heritage City</span>
            <span><b>Live</b> maps & directions</span>
            <span><b>Respectful</b> cultural guidance</span>
          </div>
        </div>
      </section>

      <section className="section featured-section">
        <div className="container">
          <div className="section-heading split-heading">
            <div>
              <span className="eyebrow"><Compass size={14} /> Start with the icons</span>
              <h2>Three places. Three completely different moods.</h2>
            </div>
            <div>
              <p>From dawn rituals to vast brick monuments and wide-open sunsets, discover the city through experiences that feel distinct.</p>
              <Link to="/explore" className="text-link">See all destinations <ArrowRight size={16} /></Link>
            </div>
          </div>
          <div className="place-grid">
            {destinations.slice(0, 3).map((place, index) => <PlaceCard key={place._id} place={place} index={index} />)}
          </div>
        </div>
      </section>

      <section className="section planner-story-section">
        <div className="container planner-story-grid">
          <div className="story-image-wrap">
            <img src="/images/destinations/jaya-sri-maha-bodhi.webp" alt="Jaya Sri Maha Bodhi sacred precinct" loading="lazy" decoding="async" />
            <div className="story-float story-float-top"><CheckCircle2 size={17} /><span><b>Route optimised</b><small>Less travel, more wonder</small></span></div>
            <div className="story-float story-float-bottom"><Clock3 size={17} /><span><b>Closes at 18:00</b><small>Timing warning added</small></span></div>
          </div>
          <div className="story-copy">
            <span className="eyebrow"><Route size={14} /> A day that flows</span>
            <h2>Your interests in.<br />A graceful route out.</h2>
            <p>Select the sites that call to you, choose a pace and start time, then let DayTrail arrange the shortest practical route with opening-hour awareness.</p>
            <div className="story-steps">
              <div><span>01</span><div><b>Choose your places</b><small>Pick up to six destinations.</small></div></div>
              <div><span>02</span><div><b>Set your rhythm</b><small>Relaxed, balanced or fast.</small></div></div>
              <div><span>03</span><div><b>Follow a clear timeline</b><small>Travel, visit and finish times included.</small></div></div>
            </div>
            <Link to="/planner" className="button button-dark">Create a smart route <ArrowRight size={17} /></Link>
          </div>
        </div>
      </section>

      <section className="section map-showcase-section">
        <div className="container">
          <div className="section-heading split-heading map-heading">
            <div><span className="eyebrow"><MapPin size={14} /> See the city clearly</span><h2>Every stop, in context.</h2></div>
            <p>The sacred city is compact, but the right order matters. Tap a numbered marker for essential visit details and direct navigation.</p>
          </div>
          <MapView places={destinations.slice(0, 8)} className="home-map" />
        </div>
      </section>

      <section className="section etiquette-section">
        <div className="container">
          <div className="section-heading centered-heading">
            <span className="eyebrow"><Sparkles size={14} /> Travel with respect</span>
            <h2>Small gestures. A better journey.</h2>
            <p>Anuradhapura is a living sacred landscape, not just an archaeological site.</p>
          </div>
          <EtiquetteGuide />
        </div>
      </section>

      <section className="final-cta-section">
        <div className="container final-cta">
          <div><span className="eyebrow eyebrow-light">Ready when you are</span><h2>Turn one day into a story worth keeping.</h2></div>
          <div><p>Start with the places you love. We’ll help with the order, timing and cultural details.</p><Link to="/planner" className="button button-gold">Plan my DayTrail <ArrowRight size={17} /></Link></div>
        </div>
      </section>
    </main>
  )
}
