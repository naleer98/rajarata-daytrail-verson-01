const toMinutes = (value = '08:00') => {
  const [hours, minutes] = value.split(':').map(Number)
  return (hours || 0) * 60 + (minutes || 0)
}

const toTime = (minutes) => {
  const normalized = ((Math.round(minutes) % 1440) + 1440) % 1440
  return `${String(Math.floor(normalized / 60)).padStart(2, '0')}:${String(normalized % 60).padStart(2, '0')}`
}

export const distanceBetween = (a, b) => {
  const radius = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const haversine =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return radius * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
}

export function buildLocalItinerary(selectedPlaces, startTime = '08:00', pace = 'Balanced') {
  if (!selectedPlaces.length) return null

  const paceMultiplier = { Relaxed: 1.2, Balanced: 1, Fast: 0.82 }[pace] || 1
  const restMinutes = { Relaxed: 20, Balanced: 12, Fast: 5 }[pace] || 12
  const home = { lat: 8.3448, lng: 80.397 }
  const remaining = [...selectedPlaces]
  const routeOrder = []
  const warnings = []
  const culturalTips = new Set()
  let current = home
  let clock = toMinutes(startTime)
  let totalDistanceKm = 0
  let totalTravelTimeMinutes = 0

  while (remaining.length) {
    let nextIndex = 0
    let nextDistance = Infinity
    remaining.forEach((place, index) => {
      const distance = distanceBetween(current, place.coordinates)
      if (distance < nextDistance) {
        nextDistance = distance
        nextIndex = index
      }
    })

    const place = remaining.splice(nextIndex, 1)[0]
    const travel = Math.max(5, Math.round((nextDistance / 28) * 60 + 3))
    clock += travel
    const opening = toMinutes(place.openingTime)
    const closing = toMinutes(place.closingTime)
    if (clock < opening) clock = opening

    const arrivalTime = toTime(clock)
    const visitDurationMinutes = Math.round((place.visitDuration || 45) * paceMultiplier)
    const departure = clock + visitDurationMinutes

    if (departure > closing) {
      warnings.push(`${place.name} may be closed before this visit ends at ${toTime(departure)}.`)
    }
    if (place.dressCode && ['Religious', 'Heritage'].includes(place.category)) {
      culturalTips.add(`${place.name}: ${place.dressCode}`)
    }

    routeOrder.push({
      place,
      sequence: routeOrder.length + 1,
      arrivalTime,
      departureTime: toTime(departure),
      visitDurationMinutes,
      travelTimeFromPrevMinutes: travel,
      distanceFromPrevKm: Number(nextDistance.toFixed(1)),
    })

    totalDistanceKm += nextDistance
    totalTravelTimeMinutes += travel
    current = place.coordinates
    clock = departure + restMinutes
  }

  return {
    _id: `local-${Date.now()}`,
    routeOrder,
    totalDistanceKm: Number(totalDistanceKm.toFixed(1)),
    totalTravelTimeMinutes,
    expectedEndTime: routeOrder.at(-1)?.departureTime,
    warnings,
    culturalTips: [...culturalTips],
  }
}

