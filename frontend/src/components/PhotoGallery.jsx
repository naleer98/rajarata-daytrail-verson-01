import { useEffect, useMemo, useState } from 'react'
import { Expand, X } from 'lucide-react'
import { getPlaceImages } from '../utils/placeImage.js'

export default function PhotoGallery({ place }) {
  const [active, setActive] = useState(null)
  const [failedImages, setFailedImages] = useState(() => new Set())
  const candidates = useMemo(() => getPlaceImages(place), [place])
  const images = useMemo(() => {
    return candidates.filter((image) => !failedImages.has(image))
  }, [candidates, failedImages])

  useEffect(() => {
    setFailedImages(new Set())
    setActive(null)
  }, [place])

  const removeBrokenImage = (image) => {
    setFailedImages((current) => {
      const next = new Set(current)
      next.add(image)
      return next
    })
    setActive(null)
  }

  useEffect(() => {
    if (active == null) return undefined
    document.body.style.overflow = 'hidden'
    const close = (event) => { if (event.key === 'Escape') setActive(null) }
    window.addEventListener('keydown', close)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', close)
    }
  }, [active])

  return (
    <section className="detail-gallery-section">
      <div className="container">
        <div className="detail-gallery-heading"><div><small>VISUAL STORY</small><h2>See the atmosphere.</h2></div><span>{images.length} HD {images.length === 1 ? 'image' : 'images'}</span></div>
        <div className={`detail-gallery-grid image-count-${Math.min(images.length, 4)}`}>
          {images.map((image, index) => (
            <button type="button" key={image} onClick={() => setActive(index)} aria-label={`Open ${place.name} image ${index + 1}`}>
              <img
                src={image}
                alt={`${place.name} view ${index + 1}`}
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
                onError={() => removeBrokenImage(image)}
              />
              <span><Expand /> View full screen</span>
            </button>
          ))}
        </div>
      </div>

      {active != null && (
        <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label={`${place.name} photo viewer`} onMouseDown={(event) => { if (event.target === event.currentTarget) setActive(null) }}>
          <button type="button" onClick={() => setActive(null)} aria-label="Close photo viewer"><X /></button>
          <img src={images[active]} alt={`${place.name} full-screen view`} onError={() => removeBrokenImage(images[active])} />
          <p>{place.name} · Image {active + 1} of {images.length}</p>
        </div>
      )}
    </section>
  )
}
