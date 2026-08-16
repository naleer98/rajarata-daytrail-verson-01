import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, Marker, Popup, Polyline, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Clock3, Crosshair, ExternalLink, LocateFixed, MapPinned, Star } from 'lucide-react'
import { getPlaceImage, getPlaceSlug } from '../utils/placeImage.js'

const DEFAULT_CENTER = [8.3448, 80.397]

const markerIcon = (index, active) => L.divIcon({
  className: 'heritage-map-marker-wrap',
  html: `<span class="heritage-map-marker${active ? ' active' : ''}"><b>${index + 1}</b></span>`,
  iconSize: [40, 48],
  iconAnchor: [20, 45],
  popupAnchor: [0, -42],
})

function MapController({ places, focusedPlace, userPosition }) {
  const map = useMap()

  useEffect(() => {
    if (focusedPlace?.coordinates) {
      map.flyTo([focusedPlace.coordinates.lat, focusedPlace.coordinates.lng], Math.max(map.getZoom(), 14), { duration: 0.9 })
      return
    }
    const points = places
      .filter((place) => place.coordinates?.lat != null && place.coordinates?.lng != null)
      .map((place) => [Number(place.coordinates.lat), Number(place.coordinates.lng)])
    if (points.length > 1) map.fitBounds(points, { padding: [48, 48], maxZoom: 13 })
  }, [focusedPlace, map, places])

  useEffect(() => {
    if (userPosition) map.flyTo(userPosition, 14, { duration: 1 })
  }, [map, userPosition])

  return null
}

export default function MapView({
  places = [],
  center = DEFAULT_CENTER,
  zoom = 12,
  className = '',
  focusedPlace = null,
  onFocusPlace,
  showRoute = false,
}) {
  const [userPosition, setUserPosition] = useState(null)
  const [locationMessage, setLocationMessage] = useState('')
  const routePoints = useMemo(() => places
    .filter((place) => place.coordinates?.lat != null && place.coordinates?.lng != null)
    .map((place) => [Number(place.coordinates.lat), Number(place.coordinates.lng)]), [places])

  const locate = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Location is not supported on this device.')
      return
    }
    setLocationMessage('Finding you…')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserPosition([coords.latitude, coords.longitude])
        setLocationMessage('Your location')
      },
      () => setLocationMessage('Location permission was not available.'),
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  return (
    <div className={`map-experience ${className}`}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom className="map-canvas">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController places={places} focusedPlace={focusedPlace} userPosition={userPosition} />
        {showRoute && routePoints.length > 1 && (
          <Polyline positions={routePoints} pathOptions={{ color: '#d5a33f', weight: 5, opacity: 0.9, dashArray: '10 12' }} />
        )}
        {places.map((place, index) => {
          if (place.coordinates?.lat == null || place.coordinates?.lng == null) return null
          const active = focusedPlace?._id === place._id
          return (
            <Marker
              key={place._id || place.name}
              position={[Number(place.coordinates.lat), Number(place.coordinates.lng)]}
              icon={markerIcon(index, active)}
              eventHandlers={{ click: () => onFocusPlace?.(place) }}
            >
              <Popup className="place-map-popup" minWidth={258}>
                <img src={getPlaceImage(place)} alt={place.name} loading="lazy" decoding="async" />
                <div className="map-popup-body">
                  <div className="map-popup-tags">
                    <small>{place.category} · {place.distanceFromHome} km</small>
                    <span className="map-popup-rating"><Star size={11} fill="currentColor" /> {place.rating || '4.8'}</span>
                  </div>
                  <strong>{place.name}</strong>
                  <span className="map-popup-meta">
                    <Clock3 size={12} />
                    {place.openingTime}–{place.closingTime} · {place.visitDuration} min
                  </span>
                  <Link to={`/place/${getPlaceSlug(place)}`}>View guide <ExternalLink size={13} /></Link>
                </div>
              </Popup>
            </Marker>
          )
        })}
        {userPosition && (
          <Marker position={userPosition} icon={L.divIcon({ className: 'user-marker-wrap', html: '<span class="user-marker"><i></i></span>', iconSize: [30, 30], iconAnchor: [15, 15] })}>
            <Popup>You are here</Popup>
          </Marker>
        )}
      </MapContainer>

      <div className="map-brand premium-map-brand">
        <span><MapPinned size={16} /></span>
        <span>
          <b>RajaRata live map</b>
          <small>{places.length} destinations visible</small>
        </span>
      </div>
      <button
        type="button"
        className="locate-button premium-locate-button"
        onClick={locate}
        title="Use my location"
        aria-label="Use my location"
      >
        <LocateFixed size={17} />
        <span>Locate me</span>
      </button>
      {locationMessage && <div className="location-toast"><Crosshair size={13} /> {locationMessage}</div>}
    </div>
  )
}
