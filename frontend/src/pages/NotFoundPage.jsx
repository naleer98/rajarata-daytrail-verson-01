import { ArrowLeft, Compass, Map } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return <main className="custom-not-found"><div className="not-found-orbit" /><section><span>404 · TRAIL NOT FOUND</span><Compass /><h1>This path has<br /><em>faded into history.</em></h1><p>The destination may have moved, but your Anuradhapura journey can continue from here.</p><div><Link className="button button-gold" to="/"><ArrowLeft /> Back home</Link><Link className="button button-ghost" to="/explore"><Map /> Explore places</Link></div></section></main>
}
