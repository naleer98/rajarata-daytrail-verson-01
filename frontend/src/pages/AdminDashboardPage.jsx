import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
  Edit3,
  Eye,
  ImagePlus,
  LayoutDashboard,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { createPlace, deletePlace, fetchPlaces, updatePlace } from '../services/api.js'
import { categories, places as localPlaces } from '../data/places.js'
import { getPlaceImage, getPlaceSlug, mergeWithLocalPlaces } from '../utils/placeImage.js'
import AdminAnalytics from '../components/AdminAnalytics.jsx'
import { AdminTableSkeleton } from '../components/Skeletons.jsx'

const blankForm = {
  name: '',
  tagline: '',
  category: 'Heritage',
  description: '',
  address: 'Anuradhapura, Sri Lanka',
  lat: '8.3448',
  lng: '80.3970',
  openingTime: '07:00',
  closingTime: '18:00',
  visitDuration: '60',
  entryFee: 'Free',
  contactNumber: '',
  rating: '4.8',
  bestVisitTime: 'Morning or late afternoon',
  dressCode: 'Cover shoulders and knees.',
  travelTips: '',
  facilities: '',
  image: null,
}

export default function AdminDashboardPage() {
  const [places, setPlaces] = useState([])
  const [query, setQuery] = useState('')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editingPlace, setEditingPlace] = useState(null)
  const [form, setForm] = useState(blankForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [offlineMode, setOfflineMode] = useState(false)
  const [notice, setNotice] = useState(null)
  const [imagePreview, setImagePreview] = useState('')

  const loadPlaces = async ({ keepNotice = false } = {}) => {
    setLoading(true)
    if (!keepNotice) setNotice(null)
    try {
      const { data } = await fetchPlaces()
      const livePlaces = Array.isArray(data) ? mergeWithLocalPlaces(data) : []
      setPlaces(livePlaces)
      setOfflineMode(false)
    } catch {
      setPlaces(localPlaces)
      setOfflineMode(true)
      setNotice({
        type: 'warning',
        text: 'Destination API is offline. Local preview data is shown; start MongoDB and the backend to edit live content.',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPlaces()
  }, [])

  useEffect(() => {
    if (!editorOpen) return undefined
    document.body.style.overflow = 'hidden'
    const closeOnEscape = (event) => {
      if (event.key === 'Escape' && !saving) setEditorOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [editorOpen, saving])

  useEffect(() => () => {
    if (imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview)
  }, [imagePreview])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return places
    return places.filter((place) =>
      [place.name, place.category, place.address]
        .some((value) => String(value || '').toLowerCase().includes(term)),
    )
  }, [places, query])

  const categoryCount = new Set(places.map((place) => place.category)).size
  const averageDuration = places.length
    ? Math.round(places.reduce((sum, place) => sum + Number(place.visitDuration || 0), 0) / places.length)
    : 0
  const mediaReady = places.length
    ? Math.round((places.filter((place) => place.image || place.images?.[0]).length / places.length) * 100)
    : 0

  const openEditor = (place = null) => {
    if (offlineMode) {
      setNotice({ type: 'warning', text: 'Editing needs the live backend. Start MongoDB and backend, then press Refresh data.' })
      return
    }

    if (place) {
      setEditingId(place._id)
      setEditingPlace(place)
      setImagePreview(getPlaceImage(place))
      setForm({
        name: place.name || '',
        tagline: place.tagline || '',
        category: place.category || 'Heritage',
        description: place.description || '',
        address: place.address || '',
        lat: String(place.coordinates?.lat ?? ''),
        lng: String(place.coordinates?.lng ?? ''),
        openingTime: place.openingTime || '07:00',
        closingTime: place.closingTime || '18:00',
        visitDuration: String(place.visitDuration || 60),
        entryFee: place.entryFee || 'Free',
        contactNumber: place.contactNumber || '',
        rating: String(place.rating || 4.8),
        bestVisitTime: place.bestVisitTime || '',
        dressCode: place.dressCode || '',
        travelTips: place.travelTips || '',
        facilities: Array.isArray(place.facilities) ? place.facilities.join(', ') : '',
        image: null,
      })
    } else {
      setEditingId(null)
      setEditingPlace(null)
      setImagePreview('')
      setForm({ ...blankForm })
    }

    setNotice(null)
    setEditorOpen(true)
  }

  const updateField = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }))
  }

  const selectImage = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setNotice({ type: 'error', text: 'The selected image is larger than 5 MB.' })
      event.target.value = ''
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setNotice({ type: 'error', text: 'Choose a JPG, PNG or WEBP image.' })
      event.target.value = ''
      return
    }
    if (imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview)
    setImagePreview(URL.createObjectURL(file))
    setForm((current) => ({ ...current, image: file }))
  }

  const save = async (event) => {
    event.preventDefault()
    if (offlineMode) return

    setSaving(true)
    const payload = new FormData()
    const values = {
      name: form.name,
      tagline: form.tagline,
      category: form.category,
      description: form.description,
      address: form.address,
      coordinates: JSON.stringify({ lat: Number(form.lat), lng: Number(form.lng) }),
      openingTime: form.openingTime,
      closingTime: form.closingTime,
      visitDuration: Number(form.visitDuration),
      entryFee: form.entryFee,
      contactNumber: form.contactNumber,
      rating: Number(form.rating),
      bestVisitTime: form.bestVisitTime,
      dressCode: form.dressCode,
      travelTips: form.travelTips,
      facilities: JSON.stringify(form.facilities.split(',').map((item) => item.trim()).filter(Boolean)),
    }

    Object.entries(values).forEach(([key, value]) => payload.append(key, value))
    if (form.image) payload.append('image', form.image)

    try {
      if (editingId) await updatePlace(editingId, payload)
      else await createPlace(payload)
      setEditorOpen(false)
      setNotice({ type: 'success', text: editingId ? 'Destination updated successfully.' : 'Destination published successfully.' })
      await loadPlaces({ keepNotice: true })
    } catch (error) {
      setNotice({ type: 'error', text: error.response?.data?.message || 'Could not save this destination.' })
    } finally {
      setSaving(false)
    }
  }

  const remove = async (place) => {
    if (offlineMode) {
      setNotice({ type: 'warning', text: 'Deleting needs the live backend. Start MongoDB and backend, then press Refresh data.' })
      return
    }
    if (!window.confirm(`Remove ${place.name} from the public guide?`)) return

    try {
      await deletePlace(place._id)
      setNotice({ type: 'success', text: 'Destination removed from the public guide.' })
      await loadPlaces({ keepNotice: true })
    } catch (error) {
      setNotice({ type: 'error', text: error.response?.data?.message || 'Could not remove this destination.' })
    }
  }

  return (
    <main className="admin-page premium-admin-page">
      <section className="admin-hero premium-admin-hero">
        <div className="premium-admin-orb" />
        <div className="container admin-hero-row premium-admin-hero-row">
          <div>
            <span className="eyebrow eyebrow-light"><ShieldCheck size={14} /> Verified content workspace</span>
            <h1>Destination <em>studio.</em></h1>
            <p>Keep every place accurate, useful and visually ready for travellers.</p>
            <div className="premium-admin-status">
              <span className={offlineMode ? 'is-offline' : 'is-online'}><i /> {offlineMode ? 'Local preview mode' : 'Live API connected'}</span>
              <span>{places.length} destinations managed</span>
            </div>
          </div>

          <button
            type="button"
            className="button button-gold premium-admin-add"
            onClick={() => openEditor()}
            disabled={offlineMode}
            title={offlineMode ? 'Start the backend before adding a destination' : 'Add a destination'}
          >
            <Plus size={18} /> Add destination
          </button>
        </div>
      </section>

      <section className="container admin-content premium-admin-content">
        {notice && (
          <div className={`admin-notice premium-admin-notice ${notice.type}`}>
            <span>
              {notice.type === 'success' ? <CheckCircle2 size={17} /> : <AlertTriangle size={17} />}
              {notice.text}
            </span>
            <div>
              {notice.type === 'warning' && <button type="button" className="notice-retry" onClick={() => loadPlaces()}><RefreshCw size={14} /> Retry</button>}
              <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss message"><X size={15} /></button>
            </div>
          </div>
        )}

        <div className="admin-stats premium-admin-stats">
          <div><span><LayoutDashboard /></span><section><small>Active places</small><b>{places.length}</b><em>Published records</em></section></div>
          <div><span><BarChart3 /></span><section><small>Categories</small><b>{categoryCount}</b><em>Content groups</em></section></div>
          <div><span><Clock3 /></span><section><small>Average visit</small><b>{averageDuration} min</b><em>Traveller time</em></section></div>
          <div><span><ImagePlus /></span><section><small>Media ready</small><b>{mediaReady}%</b><em>Image coverage</em></section></div>
        </div>

        <div className="admin-panel premium-admin-panel">
          <div className="admin-panel-head premium-admin-panel-head">
            <div>
              <span className="premium-panel-kicker"><Sparkles size={12} /> Content library</span>
              <h2>Published destinations</h2>
              <p>Manage the content travellers see across cards, maps and the AI guide.</p>
            </div>

            <div className="premium-admin-tools">
              <label className="admin-search premium-admin-search">
                <Search size={17} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, category or address" />
                {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search"><X size={14} /></button>}
              </label>
              <button type="button" className="admin-refresh-button" onClick={() => loadPlaces()} disabled={loading} title="Refresh destinations">
                <RefreshCw size={17} className={loading ? 'is-spinning' : ''} />
              </button>
            </div>
          </div>

          {loading ? (
            <AdminTableSkeleton />
          ) : (
            <div className="admin-table-wrap premium-admin-table-wrap">
              <table className="admin-table premium-admin-table">
                <thead>
                  <tr><th>Destination</th><th>Category</th><th>Visit</th><th>Opening hours</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filtered.map((place) => (
                    <tr key={place._id}>
                      <td>
                        <div className="admin-place-cell premium-admin-place-cell">
                          <img src={getPlaceImage(place)} alt={place.name} loading="lazy" decoding="async" />
                          <span><b>{place.name}</b><small><MapPin size={11} /> {place.address}</small></span>
                        </div>
                      </td>
                      <td><span className="table-category premium-table-category">{place.category}</span></td>
                      <td><strong className="premium-table-value">{place.visitDuration} min</strong></td>
                      <td><strong className="premium-table-value">{place.openingTime}–{place.closingTime}</strong></td>
                      <td>
                        <div className="table-actions premium-table-actions">
                          <Link to={`/place/${getPlaceSlug(place)}`} title="View public page"><Eye size={15} /></Link>
                          <button type="button" onClick={() => openEditor(place)} disabled={offlineMode} title={offlineMode ? 'Backend required to edit' : 'Edit destination'}><Edit3 size={15} /><span>Edit</span></button>
                          <button type="button" onClick={() => remove(place)} disabled={offlineMode} className="danger" title={offlineMode ? 'Backend required to delete' : 'Remove destination'}><Trash2 size={15} /><span>Remove</span></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!filtered.length && (
                <div className="empty-table premium-empty-table">
                  <span><Search size={23} /></span><h3>No destinations found</h3><p>Try another name, category or address.</p><button type="button" onClick={() => setQuery('')}>Clear search</button>
                </div>
              )}
            </div>
          )}
        </div>
        <AdminAnalytics />
      </section>

      {editorOpen && (
        <div className="editor-backdrop premium-editor-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setEditorOpen(false) }}>
          <section className="place-editor premium-place-editor" aria-modal="true" role="dialog" aria-label={editingId ? 'Edit destination' : 'Add destination'}>
            <header>
              <div><small>{editingId ? 'UPDATE DESTINATION' : 'NEW DESTINATION'}</small><h2>{editingId ? 'Edit destination' : 'Create destination'}</h2><p>{editingId ? 'Update the live traveller experience.' : 'Publish a new place across the platform.'}</p></div>
              <button type="button" onClick={() => setEditorOpen(false)} disabled={saving} aria-label="Close editor"><X /></button>
            </header>

            <form onSubmit={save}>
              <div className="editor-grid premium-editor-grid">
                <div className="editor-section-title wide"><span>01</span><div><small>Identity</small><b>Destination basics</b></div></div>
                <label className="wide"><span>Destination name</span><input required maxLength="100" value={form.name} onChange={updateField('name')} placeholder="e.g. Ruwanwelisaya" /></label>
                <label className="wide"><span>Short tagline</span><input maxLength="150" value={form.tagline} onChange={updateField('tagline')} placeholder="A memorable one-line introduction" /></label>
                <label><span>Category</span><select value={form.category} onChange={updateField('category')}>{categories.filter((item) => item !== 'All').map((item) => <option key={item}>{item}</option>)}</select></label>
                <label><span>Visitor rating</span><input required min="0" max="5" step="0.1" type="number" value={form.rating} onChange={updateField('rating')} /></label>
                <label className="wide"><span>Description</span><textarea required maxLength="1500" rows="5" value={form.description} onChange={updateField('description')} placeholder="Tell travellers why this destination matters" /></label>

                <div className="editor-section-title wide"><span>02</span><div><small>Location</small><b>Map and address</b></div></div>
                <label className="wide"><span>Address</span><input required value={form.address} onChange={updateField('address')} /></label>
                <label><span>Latitude</span><input required min="-90" max="90" type="number" step="any" value={form.lat} onChange={updateField('lat')} /></label>
                <label><span>Longitude</span><input required min="-180" max="180" type="number" step="any" value={form.lng} onChange={updateField('lng')} /></label>

                <div className="editor-section-title wide"><span>03</span><div><small>Visit planning</small><b>Hours, fees and timing</b></div></div>
                <label><span>Opening time</span><input required type="time" value={form.openingTime} onChange={updateField('openingTime')} /></label>
                <label><span>Closing time</span><input required type="time" value={form.closingTime} onChange={updateField('closingTime')} /></label>
                <label><span>Visit duration (minutes)</span><input required min="10" max="480" type="number" value={form.visitDuration} onChange={updateField('visitDuration')} /></label>
                <label><span>Entry fee</span><input value={form.entryFee} onChange={updateField('entryFee')} /></label>
                <label><span>Contact number</span><input value={form.contactNumber} onChange={updateField('contactNumber')} /></label>
                <label><span>Best visit time</span><input value={form.bestVisitTime} onChange={updateField('bestVisitTime')} /></label>

                <div className="editor-section-title wide"><span>04</span><div><small>Traveller guidance</small><b>Etiquette and facilities</b></div></div>
                <label className="wide"><span>Dress code</span><input value={form.dressCode} onChange={updateField('dressCode')} /></label>
                <label className="wide"><span>Travel tip</span><textarea rows="3" value={form.travelTips} onChange={updateField('travelTips')} /></label>
                <label className="wide"><span>Facilities <small>(comma separated)</small></span><input value={form.facilities} onChange={updateField('facilities')} placeholder="Parking, restrooms, drinking water" /></label>

                <div className="editor-section-title wide"><span>05</span><div><small>Visual content</small><b>Destination photography</b></div></div>
                <label className="image-input premium-image-input wide">
                  {imagePreview ? <img src={imagePreview} alt="Destination preview" /> : <span className="premium-image-placeholder"><ImagePlus size={23} /></span>}
                  <span><b>{form.image?.name || (editingPlace ? 'Replace destination photo' : 'Upload destination photo')}</b><small>JPG, PNG or WEBP · maximum 5 MB</small></span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={selectImage} />
                </label>
              </div>

              <footer>
                <span><ShieldCheck size={13} /> Changes update cards, maps and the AI guide.</span>
                <div><button type="button" className="button button-soft" onClick={() => setEditorOpen(false)} disabled={saving}>Cancel</button><button className="button button-dark" disabled={saving}>{saving ? <><span className="spinner" /> Saving…</> : <>{editingId ? 'Save changes' : 'Publish destination'}</>}</button></div>
              </footer>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}
