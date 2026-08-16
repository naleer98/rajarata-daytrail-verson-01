import { places as localPlaces } from '../data/places.js'

const FALLBACK = '/images/destinations/ruwanwelisaya.jpg'

const normaliseName = (value) => String(value || '')
  .toLowerCase()
  .replace(/\([^)]*\)/g, ' ')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim()

const findLocalMatch = (place) => {
  if (!place) return null

  const id = String(place._id || place.id || '').toLowerCase()
  const name = normaliseName(place.name)

  return localPlaces.find((item) => {
    const localId = String(item._id || '').toLowerCase()
    const localName = normaliseName(item.name)

    return localId === id || (
      name && localName && (
        name === localName ||
        name.startsWith(localName) ||
        localName.startsWith(name)
      )
    )
  }) || null
}

const resolveImageSource = (source) => {
  const value = String(source || '').trim()
  if (!value) return ''

  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('data:') ||
    value.startsWith('blob:') ||
    value.startsWith('/images/')
  ) return value

  if (value.startsWith('/uploads/')) {
    const apiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '')
    return `${apiBase || 'http://localhost:5000'}${value}`
  }

  return value
}

export function getPlaceImages(place) {
  const localMatch = findLocalMatch(place)
  const candidates = [
    place?.image,
    ...(Array.isArray(place?.images) ? place.images : []),
    localMatch?.image,
    ...(Array.isArray(localMatch?.images) ? localMatch.images : []),
    FALLBACK,
  ]

  return [...new Set(candidates.map(resolveImageSource).filter(Boolean))]
}

export function getPlaceImage(place) {
  return getPlaceImages(place)[0] || FALLBACK
}

export function getPlaceSlug(place) {
  if (!place) return ''
  const localMatch = findLocalMatch(place)
  return localMatch?._id || place._id
}

export function mergeWithLocalPlaces(apiPlaces = []) {
  if (!Array.isArray(apiPlaces) || apiPlaces.length === 0) return localPlaces
  return apiPlaces.map((place) => {
    const local = findLocalMatch(place)
    if (!local) return place

    const images = [...new Set([
      place.image,
      ...(Array.isArray(place.images) ? place.images : []),
      local.image,
      ...(Array.isArray(local.images) ? local.images : []),
    ].filter(Boolean))]

    return {
      ...local,
      ...place,
      image: images[0] || local.image,
      images,
    }
  })
}

export { FALLBACK as FALLBACK_IMAGE }
