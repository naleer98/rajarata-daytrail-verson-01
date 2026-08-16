import { useEffect, useMemo, useState } from 'react'
import {
  Compass,
  Grid2X2,
  Map,
  MapPin,
  Route,
  Search,
  SlidersHorizontal,
  Sparkles,
  Heart,
  X,
} from 'lucide-react'
import { fetchPlaces } from '../services/api.js'
import { categories, places as localPlaces } from '../data/places.js'
import { mergeWithLocalPlaces } from '../utils/placeImage.js'
import PlaceCard from '../components/PlaceCard.jsx'
import MapView from '../components/MapView.jsx'
import useFavourites from '../hooks/useFavourites.js'
import { trackAction } from '../utils/analytics.js'
import { useSitePreferences } from '../context/SitePreferencesContext.jsx'

export default function ExplorePage() {
  const [allPlaces, setAllPlaces] = useState(localPlaces)
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')
  const [focusedPlace, setFocusedPlace] = useState(null)
  const [mobileView, setMobileView] = useState('list')
  const [showFavourites, setShowFavourites] = useState(false)
  const { favourites } = useFavourites()
  const { t } = useSitePreferences()

  useEffect(() => {
    fetchPlaces()
      .then(({ data }) => setAllPlaces(mergeWithLocalPlaces(data)))
      .catch(() => setAllPlaces(localPlaces))
  }, [])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()

    return allPlaces.filter((place) => {
      const categoryMatch =
        category === 'All' || place.category === category

      const searchMatch =
        !term ||
        [
          place.name,
          place.description,
          place.category,
          place.tagline,
        ].some((value) =>
          String(value || '').toLowerCase().includes(term),
        )

      const favouriteMatch = !showFavourites || favourites.includes(place._id)
      return categoryMatch && searchMatch && favouriteMatch
    })
  }, [allPlaces, category, query, showFavourites, favourites])

  useEffect(() => {
    if (!query.trim()) return undefined
    const timer = setTimeout(() => trackAction('searches'), 900)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    if (
      focusedPlace &&
      !filtered.some((place) => place._id === focusedPlace._id)
    ) {
      setFocusedPlace(null)
    }
  }, [filtered, focusedPlace])

  const hasFilters = category !== 'All' || query.trim() !== '' || showFavourites

  const resetFilters = () => {
    setQuery('')
    setCategory('All')
    setFocusedPlace(null)
    setShowFavourites(false)
  }

  return (
    <main className="explore-page premium-explore-page">
      <section className="page-hero compact-hero premium-explore-hero">
        <div className="page-hero-orb" />

        <div className="container page-hero-content premium-explore-hero-content">
          <div>
            <span className="eyebrow eyebrow-light">
              <Sparkles size={14} />
              {t('exploreKicker')}
            </span>

            <h1>
              {t('exploreTitle')}
              <br />
              <em>{t('exploreAccent')}</em>
            </h1>

            <p>
              {t('exploreCopy')}
            </p>
          </div>

          <div className="premium-explore-hero-stats">
            <div>
              <strong>{allPlaces.length}</strong>
              <span>Curated places</span>
            </div>

            <div>
              <MapPin size={19} />
              <span>Live map context</span>
            </div>

            <div>
              <Route size={19} />
              <span>Planner ready</span>
            </div>
          </div>
        </div>
      </section>

      <section className="explore-toolbar-wrap premium-explore-toolbar-wrap">
        <div className="container explore-toolbar premium-explore-toolbar">
          <label className="search-box premium-search-box">
            <span className="premium-search-icon">
              <Search size={19} />
            </span>

            <span className="premium-search-copy">
              <small>Search destinations</small>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Temple, lake, heritage…"
              />
            </span>

            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </label>

          <div className="premium-filter-group">
            <span className="premium-filter-label">
              <SlidersHorizontal size={15} />
              Filter
            </span>

            <div
              className="category-scroll"
              aria-label="Destination categories"
            >
              {categories.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setCategory(item)}
                  className={category === item ? 'active' : ''}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <button type="button" className={`favourites-filter ${showFavourites ? 'active' : ''}`} onClick={() => setShowFavourites((value) => !value)}><Heart fill={showFavourites ? 'currentColor' : 'none'} /><span>Saved</span><b>{favourites.length}</b></button>

          <div className="mobile-view-toggle">
            <button
              type="button"
              className={mobileView === 'list' ? 'active' : ''}
              onClick={() => setMobileView('list')}
            >
              <Grid2X2 size={16} />
              List
            </button>

            <button
              type="button"
              className={mobileView === 'map' ? 'active' : ''}
              onClick={() => setMobileView('map')}
            >
              <Map size={16} />
              Map
            </button>
          </div>
        </div>
      </section>

      <section className="container explore-layout premium-explore-layout">
        <div
          className={`explore-results ${
            mobileView === 'list' ? 'mobile-active' : ''
          }`}
        >
          <header className="premium-results-header">
            <div className="premium-results-heading">
              <span>
                <Compass size={20} />
              </span>

              <div>
                <small>Discover Anuradhapura</small>
                <h2>
                  {category === 'All'
                    ? 'Handpicked destinations'
                    : `${category} places`}
                </h2>
              </div>
            </div>

            <div className="premium-results-count" aria-live="polite">
              <strong>{filtered.length}</strong>
              <span>places found</span>
            </div>
          </header>

          <div className="results-meta premium-results-meta">
            <div>
              <SlidersHorizontal size={15} />
              <span>
                {hasFilters
                  ? 'Showing your filtered collection'
                  : 'Every place is locally curated'}
              </span>
            </div>

            {hasFilters ? (
              <button type="button" onClick={resetFilters}>
                <X size={14} />
                Clear filters
              </button>
            ) : (
              <small>Hover a card to focus its map marker</small>
            )}
          </div>

          {filtered.length ? (
            <div className="explore-card-grid">
              {filtered.map((place, index) => (
                <div
                  key={place._id}
                  onMouseEnter={() => setFocusedPlace(place)}
                  onFocus={() => setFocusedPlace(place)}
                >
                  <PlaceCard place={place} index={index} />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state premium-empty-state">
              <span><Compass size={28} /></span>
              <small>No matching route stops</small>
              <h2>No places found</h2>
              <p>
                Try a broader search or choose another destination category.
              </p>
              <button type="button" onClick={resetFilters}>
                Reset all filters
              </button>
            </div>
          )}
        </div>

        <aside
          className={`explore-map-panel ${
            mobileView === 'map' ? 'mobile-active' : ''
          }`}
        >
          <div className="premium-explore-map-card">
            <div className="premium-map-panel-heading">
              <div>
                <small>Geographic context</small>
                <strong>Explore on the map</strong>
              </div>

              <span>
                <i />
                {filtered.length} pinned
              </span>
            </div>

            <MapView
              places={filtered}
              focusedPlace={focusedPlace}
              onFocusPlace={setFocusedPlace}
              className="explore-map"
            />

            <div className="map-legend premium-map-legend">
              <span>
                <i />
                Numbered heritage stops
              </span>
              <span>Scroll to zoom · tap for details</span>
            </div>
          </div>
        </aside>
      </section>
    </main>
  )
}
