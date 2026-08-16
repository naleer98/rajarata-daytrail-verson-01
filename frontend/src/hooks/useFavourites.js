import { useEffect, useState } from 'react'

const STORAGE_KEY = 'rajarata-favourites'
const EVENT_NAME = 'rajarata:favourites'

const readFavourites = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') }
  catch { return [] }
}

export default function useFavourites() {
  const [favourites, setFavourites] = useState(readFavourites)

  useEffect(() => {
    const sync = () => setFavourites(readFavourites())
    window.addEventListener(EVENT_NAME, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVENT_NAME, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const toggleFavourite = (id) => {
    const current = readFavourites()
    const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    window.dispatchEvent(new Event(EVENT_NAME))
    return next.includes(id)
  }

  return { favourites, isFavourite: (id) => favourites.includes(id), toggleFavourite }
}
