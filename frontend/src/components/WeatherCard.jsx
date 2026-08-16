import { useEffect, useState } from 'react'
import { CloudSun, Droplets, Sunrise, Sunset, ThermometerSun } from 'lucide-react'

const weatherLabels = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Misty', 48: 'Foggy',
  51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle', 61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
  80: 'Rain showers', 81: 'Rain showers', 82: 'Heavy showers', 95: 'Thunderstorms',
}

const timeOnly = (value) => value ? new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'

export default function WeatherCard({ coordinates }) {
  const [weather, setWeather] = useState(null)
  const [failed, setFailed] = useState(false)
  const latitude = Number(coordinates?.lat)
  const longitude = Number(coordinates?.lng)

  useEffect(() => {
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return
    const controller = new AbortController()
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code&daily=sunrise,sunset&forecast_days=1&timezone=Asia%2FColombo`
    fetch(url, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Weather unavailable')
        return response.json()
      })
      .then(setWeather)
      .catch((error) => { if (error.name !== 'AbortError') setFailed(true) })
    return () => controller.abort()
  }, [latitude, longitude])

  if (failed) return <div className="weather-card weather-unavailable"><CloudSun /><span><b>Weather unavailable</b><small>Check your connection before travelling.</small></span></div>
  if (!weather) return <div className="weather-card weather-loading" aria-busy="true"><span /><span /><span /></div>

  return (
    <section className="weather-card" aria-label="Current local weather">
      <div className="weather-card-head"><span><CloudSun /></span><div><small>LIVE LOCAL WEATHER</small><h3>{weatherLabels[weather.current.weather_code] || 'Current conditions'}</h3></div></div>
      <div className="weather-temperature"><strong>{Math.round(weather.current.temperature_2m)}°</strong><span><small>Feels like</small><b>{Math.round(weather.current.apparent_temperature)}°C</b></span></div>
      <div className="weather-facts">
        <span><Droplets /><small>Humidity</small><b>{weather.current.relative_humidity_2m}%</b></span>
        <span><Sunrise /><small>Sunrise</small><b>{timeOnly(weather.daily.sunrise?.[0])}</b></span>
        <span><Sunset /><small>Sunset</small><b>{timeOnly(weather.daily.sunset?.[0])}</b></span>
      </div>
      <p><ThermometerSun /> Carry water and check the sky before entering exposed heritage areas.</p>
    </section>
  )
}
