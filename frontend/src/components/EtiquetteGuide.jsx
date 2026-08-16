import { Camera, Footprints, HeartHandshake, Shirt } from 'lucide-react'

const guidelines = [
  { icon: Shirt, title: 'Dress with respect', text: 'Cover shoulders and knees at sacred sites; light clothing works best in the heat.' },
  { icon: Footprints, title: 'Step barefoot', text: 'Remove shoes and hats before entering temple terraces. Socks help on warm stone.' },
  { icon: Camera, title: 'Photograph mindfully', text: 'Never pose with your back directly toward a Buddha image or interrupt worship.' },
  { icon: HeartHandshake, title: 'Keep the calm', text: 'Use a quiet voice, follow local signs and ask permission before photographing people.' },
]

export default function EtiquetteGuide({ compact = false }) {
  return (
    <div className={`etiquette-grid ${compact ? 'compact' : ''}`}>
      {guidelines.map(({ icon: Icon, title, text }) => (
        <article key={title} className="etiquette-item">
          <span><Icon size={20} /></span>
          <div><h3>{title}</h3><p>{text}</p></div>
        </article>
      ))}
    </div>
  )
}

