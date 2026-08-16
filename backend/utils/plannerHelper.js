function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes) {
  const hrs = Math.floor(totalMinutes / 60) % 24;
  const mins = totalMinutes % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

function generateSmartItinerary(places, startTimeStr = "08:00", pace = "Balanced", homeCoords = { lat: 8.3114, lng: 80.4037 }) {
  if (!places || places.length === 0) return null;

  let durationMultiplier = 1.0;
  let restBufferMinutes = 15;
  if (pace === 'Relaxed') {
    durationMultiplier = 1.25;
    restBufferMinutes = 25;
  } else if (pace === 'Fast') {
    durationMultiplier = 0.85;
    restBufferMinutes = 5;
  }

  let unvisited = [...places];
  let routeOrder = [];
  let currentLat = homeCoords.lat;
  let currentLng = homeCoords.lng;
  let currentMinutes = timeToMinutes(startTimeStr);

  let totalDistanceKm = 0;
  let totalTravelTimeMinutes = 0;
  let warnings = [];
  let culturalTips = new Set();
  let sequence = 1;

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let minDistance = Infinity;

    unvisited.forEach((p, idx) => {
      const dist = calculateHaversineDistance(currentLat, currentLng, p.coordinates.lat, p.coordinates.lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIndex = idx;
      }
    });

    const currentPlace = unvisited.splice(nearestIndex, 1)[0];
    const travelTimeMinutes = Math.round((minDistance / 30) * 60) + 3;
    currentMinutes += travelTimeMinutes;

    const arrivalTime = minutesToTime(currentMinutes);
    const openMins = timeToMinutes(currentPlace.openingTime);
    const closeMins = timeToMinutes(currentPlace.closingTime);

    if (currentMinutes < openMins) {
      warnings.push(`Arrival at ${currentPlace.name} (${arrivalTime}) is before opening time (${currentPlace.openingTime}). You may need to wait.`);
    } else if (currentMinutes > closeMins) {
      warnings.push(`Arrival at ${currentPlace.name} (${arrivalTime}) is after closing time (${currentPlace.closingTime}).`);
    }

    const visitDurationMins = Math.round(currentPlace.visitDuration * durationMultiplier);
    const departureMinutes = currentMinutes + visitDurationMins;
    const departureTime = minutesToTime(departureMinutes);

    if (departureMinutes > closeMins && currentMinutes <= closeMins) {
      warnings.push(`Visit to ${currentPlace.name} extends past closing time (${currentPlace.closingTime}).`);
    }

    if (currentPlace.category === 'Religious' || currentPlace.category === 'Heritage') {
      if (currentPlace.dressCode) {
        culturalTips.add(`${currentPlace.name}: ${currentPlace.dressCode}`);
      }
    }

    routeOrder.push({
      place: currentPlace,
      sequence: sequence++,
      arrivalTime,
      departureTime,
      visitDurationMinutes: visitDurationMins,
      travelTimeFromPrevMinutes: travelTimeMinutes,
      distanceFromPrevKm: minDistance
    });

    totalDistanceKm += minDistance;
    totalTravelTimeMinutes += travelTimeMinutes;

    currentLat = currentPlace.coordinates.lat;
    currentLng = currentPlace.coordinates.lng;
    currentMinutes = departureMinutes + restBufferMinutes;
  }

  const expectedEndTime = minutesToTime(currentMinutes - restBufferMinutes);

  return {
    routeOrder,
    totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
    totalTravelTimeMinutes,
    expectedEndTime,
    warnings,
    culturalTips: Array.from(culturalTips)
  };
}

module.exports = {
  calculateHaversineDistance,
  generateSmartItinerary
};