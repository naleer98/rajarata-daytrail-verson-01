import { Link } from 'react-router-dom'
import { ArrowUpRight, Check, Clock3, Heart, MapPin, Plus, Star } from 'lucide-react'
import { getPlaceImage, getPlaceSlug } from '../utils/placeImage.js'
import useFavourites from '../hooks/useFavourites.js'
import { showToast } from './ToastHost.jsx'

export default function PlaceCard({ place, onSelect, isSelected, index = 0 }) {
  const image = getPlaceImage(place)
  const slug = getPlaceSlug(place)
  const { isFavourite, toggleFavourite } = useFavourites()
  const saved = isFavourite(place._id)

  const toggleSaved = (event) => {
    event.preventDefault()
    event.stopPropagation()
    const active = toggleFavourite(place._id)
    showToast({ type: active ? 'success' : 'info', title: active ? 'Saved to favourites' : 'Removed from favourites', message: place.name })
  }

  return (
    <article className={`place-card ${isSelected ? 'is-selected' : ''}`} style={{ '--delay': `${index * 60}ms` }}>
      <Link to={`/place/${slug}`} className="place-card-media" aria-label={`View ${place.name}`}>
        <img src={image} alt={place.name} loading="lazy" decoding="async" />
        <span className="image-wash" />
        <span className="category-chip">{place.category}</span>
        <span className="rating-chip"><Star size={12} fill="currentColor" /> {place.rating || '4.8'}</span>
        <span className="place-card-index">0{index + 1}</span>
      </Link>
      <button type="button" className={`favourite-button ${saved ? 'is-saved' : ''}`} onClick={toggleSaved} aria-label={`${saved ? 'Remove' : 'Save'} ${place.name} ${saved ? 'from' : 'to'} favourites`}><Heart fill={saved ? 'currentColor' : 'none'} /></button>
      <div className="place-card-body">
        <div className="place-card-heading">
          <div>
            <p className="place-distance"><MapPin size={13} /> {place.distanceFromHome ?? 0} km from city centre</p>
            <h3>{place.name}</h3>
          </div>
          <Link to={`/place/${slug}`} className="icon-link" aria-label={`Open ${place.name}`}><ArrowUpRight /></Link>
        </div>
        <p className="place-tagline">{place.tagline || place.description}</p>
        <div className="place-card-meta">
          <span><Clock3 size={15} /> {place.openingTime}–{place.closingTime}</span>
          <span>{place.visitDuration || 45} min</span>
        </div>
        {onSelect && (
          <button className={`select-place-button ${isSelected ? 'selected' : ''}`} onClick={() => onSelect(place)}>
            {isSelected ? <><Check size={16} /> Added to your day</> : <><Plus size={16} /> Add to day plan</>}
          </button>
        )}
      </div>
    </article>
  )
}
