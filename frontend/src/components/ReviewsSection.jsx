import { useMemo, useState } from 'react'
import { MessageSquareText, Star, Trash2 } from 'lucide-react'
import { showToast } from './ToastHost.jsx'

const keyFor = (id) => `rajarata-reviews:${id}`
const readReviews = (id) => {
  try { return JSON.parse(localStorage.getItem(keyFor(id)) || '[]') }
  catch { return [] }
}

export default function ReviewsSection({ place }) {
  const [reviews, setReviews] = useState(() => readReviews(place._id))
  const [name, setName] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const average = useMemo(() => reviews.length ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : place.rating || '4.8', [reviews, place.rating])

  const submit = (event) => {
    event.preventDefault()
    const review = { id: Date.now(), name: name.trim(), rating: Number(rating), comment: comment.trim(), date: new Date().toISOString() }
    const next = [review, ...reviews].slice(0, 30)
    localStorage.setItem(keyFor(place._id), JSON.stringify(next))
    setReviews(next)
    setName('')
    setComment('')
    setRating(5)
    showToast({ type: 'success', title: 'Review added', message: 'Thank you for sharing your local experience.' })
  }

  const remove = (id) => {
    const next = reviews.filter((review) => review.id !== id)
    localStorage.setItem(keyFor(place._id), JSON.stringify(next))
    setReviews(next)
  }

  return (
    <section className="reviews-section section">
      <div className="container reviews-grid">
        <div className="reviews-summary">
          <span className="eyebrow"><MessageSquareText /> Visitor notes</span><h2>Real experiences,<br />shared simply.</h2>
          <div className="reviews-score"><strong>{average}</strong><span><span>{[1,2,3,4,5].map((item) => <Star key={item} fill="currentColor" />)}</span><small>{reviews.length ? `${reviews.length} local review${reviews.length === 1 ? '' : 's'}` : 'Be the first to add a local review'}</small></span></div>
        </div>
        <form className="review-form" onSubmit={submit}>
          <h3>Share your visit</h3>
          <label><span>Your name</span><input required maxLength="40" value={name} onChange={(event) => setName(event.target.value)} placeholder="Traveller name" /></label>
          <label><span>Rating</span><select value={rating} onChange={(event) => setRating(event.target.value)}>{[5,4,3,2,1].map((value) => <option key={value} value={value}>{value} stars</option>)}</select></label>
          <label><span>Your experience</span><textarea required minLength="8" maxLength="400" rows="4" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="What should future visitors know?" /></label>
          <button className="button button-dark">Publish review</button>
        </form>
      </div>
      {reviews.length > 0 && <div className="container review-list">{reviews.map((review) => <article key={review.id}><header><span>{review.name.slice(0, 1).toUpperCase()}</span><div><b>{review.name}</b><small>{new Date(review.date).toLocaleDateString()}</small></div><em><Star fill="currentColor" /> {review.rating}</em></header><p>{review.comment}</p><button type="button" onClick={() => remove(review.id)} aria-label={`Remove ${review.name}'s review`}><Trash2 /> Remove</button></article>)}</div>}
    </section>
  )
}
