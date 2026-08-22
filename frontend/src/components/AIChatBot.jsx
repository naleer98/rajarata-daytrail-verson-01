import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Bot,
  ChevronDown,
  Clock3,
  Compass,
  MapPin,
  MessageCircle,
  Mic,
  MicOff,
  Route,
  Send,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { chatWithAssistant } from '../services/api.js'
import { places } from '../data/places.js'

const welcomeMessage = {
  id: 'welcome',
  role: 'assistant',
  text: 'Ayubowan! I’m your RajaRata guide. Tell me how much time you have, what you enjoy, or ask about any sacred site.',
  time: 'Now',
  actions: [{ label: 'Explore all places', to: '/explore', type: 'explore' }],
}

const quickPrompts = [
  'Plan a calm 4-hour route',
  'Which places are free?',
  'Best places for sunset',
  'Temple dress code',
]

const newId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`
const now = () => new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(new Date())

const plannerAction = { label: 'Open Day planner', to: '/planner', type: 'planner' }
const exploreAction = { label: 'Explore all places', to: '/explore', type: 'explore' }
const placeAction = (place) => ({ label: 'View place guide', to: `/place/${place._id}`, type: 'place' })

function localAnswer(message, history = []) {
  const query = message.toLowerCase()
  const previousText = history.map((item) => item.text).join(' ').toLowerCase()
  const mentionedNow = places.find((place) =>
    query.includes(place.name.toLowerCase()) || query.includes(place._id.replaceAll('-', ' ')),
  )
  const mentionedBefore = places.find((place) => previousText.includes(place.name.toLowerCase()))
  const mentioned = mentionedNow || mentionedBefore
  const currentHours = Number(query.match(/(\d+(?:\.\d+)?)\s*(?:hour|hours|hr|hrs)/)?.[1])
  const previousHours = Number(previousText.match(/(\d+(?:\.\d+)?)\s*(?:hour|hours|hr|hrs)/)?.[1])
  const result = (reply, suggestions = quickPrompts, actions = []) => ({ reply, suggestions, actions })

  if (/^(hi|hello|hey|ayubowan|good morning|good evening)\b/.test(query)) {
    return result(
      'Ayubowan! Tell me how much time you have and the kind of experience you prefer. I can shape a practical Anuradhapura route for you.',
      ['I have 4 hours', 'Quiet heritage places', 'Best sunset route'],
      [exploreAction],
    )
  }

  if (/thank|thanks|helpful|great/.test(query)) {
    return result(
      'You’re welcome. I’m here whenever you want to adjust the pace, compare places or check practical visit details.',
      ['Plan another route', 'What should I wear?', 'Show nearest places'],
      [plannerAction],
    )
  }

  if (/build this|open planner|add.*planner|fine.?tune/.test(query)) {
    return result(
      'Your route is ready to refine. Open the Day planner to choose the exact start time, pace and destinations.',
      ['Make it more relaxed', 'Add a sunset stop', 'Temple dress code'],
      [plannerAction],
    )
  }

  if (mentioned) {
    const actions = [placeAction(mentioned), plannerAction]
    if (/open|close|time|hour/.test(query)) {
      return result(`${mentioned.name} is open ${mentioned.openingTime}–${mentioned.closingTime}. Allow around ${mentioned.visitDuration} minutes for an unhurried visit.`, ['What is the entry fee?', 'What should I wear?', 'Add it to my day'], actions)
    }
    if (/fee|price|cost|ticket|free/.test(query)) {
      return result(`${mentioned.name}: ${mentioned.entryFee}. Fees can change, so confirm at the entrance on the day.`, ['When should I visit?', 'What should I wear?', 'Add it to my day'], actions)
    }
    if (/dress|wear|cloth|shoe|etiquette/.test(query)) {
      return result(`${mentioned.name} etiquette: ${mentioned.dressCode}`, ['Opening time?', 'Entry fee?', 'Show the place guide'], actions)
    }
    if (/where|location|address|direction/.test(query)) {
      return result(`${mentioned.name} is at ${mentioned.address}. It is about ${mentioned.distanceFromHome} km from the city centre.`, ['When should I visit?', 'Add it to my day', 'Show nearby places'], actions)
    }
    return result(`${mentioned.name} is a ${mentioned.category.toLowerCase()} highlight. ${mentioned.tagline}\n\nBest time: ${mentioned.bestVisitTime}. Allow ${mentioned.visitDuration} minutes.`, ['Opening time?', 'Entry fee?', 'What should I wear?'], actions)
  }

  if (/free|no fee|budget/.test(query)) {
    const free = places.filter((place) => place.entryFee.toLowerCase().startsWith('free')).slice(0, 5)
    return result(`Good free choices are:\n${free.map((place, index) => `${index + 1}. ${place.name} · ${place.visitDuration} min`).join('\n')}\n\nTemple donations are optional but appreciated.`, ['Plan a budget route', 'Show nearest places', 'Temple dress code'], [exploreAction, plannerAction])
  }

  if (/sunset|evening|golden/.test(query)) {
    return result('For sunset, start at Isurumuniya, walk beside Tissa Wewa, then finish at illuminated Ruwanwelisaya. Begin around 4:30 PM and carry a light temple shawl.', ['Build this in planner', 'Isurumuniya entry fee', 'Temple dress code'], [plannerAction])
  }

  if (/dress|wear|cloth|shoe|etiquette/.test(query)) {
    return result('At sacred sites, cover shoulders and knees, remove shoes and hats, keep voices low, and avoid posing with your back to Buddha images. Socks are useful on hot stone.', ['Plan a sacred-city route', 'Which places are free?', 'Show nearest places'], [exploreAction])
  }

  if (/near|nearest|closest/.test(query)) {
    return result(`Closest to the sacred-city centre:\n${[...places].sort((a, b) => a.distanceFromHome - b.distanceFromHome).slice(0, 5).map((place, index) => `${index + 1}. ${place.name} · ${place.distanceFromHome} km`).join('\n')}`, ['Build this in planner', 'Which places are free?', 'Best sunset route'], [exploreAction, plannerAction])
  }

  if (currentHours || /plan|route|day|itinerary/.test(query)) {
    const available = Math.max(2, Math.min(currentHours || previousHours || 6, 10))
    const options = [...places].sort((a, b) => a.distanceFromHome - b.distanceFromHome)
    let used = 0
    const selected = []
    for (const place of options) {
      if (used + place.visitDuration + 18 <= available * 60) {
        selected.push(place)
        used += place.visitDuration + 18
      }
    }
    return result(`Here’s a realistic ${available}-hour outline:\n${selected.slice(0, 6).map((place, index) => `${index + 1}. ${place.name} · ${place.visitDuration} min`).join('\n')}\n\nI included short travel buffers. Open Day planner to fine-tune the pace and start time.`, ['Build this in planner', 'Make it more relaxed', 'Add a sunset stop'], [plannerAction])
  }

  if (/relig|temple|stupa|sacred/.test(query)) {
    return result('For a sacred-city circuit, combine Jaya Sri Maha Bodhi, Ruwanwelisaya, Thuparamaya and Samadhi Buddha. Start early, dress modestly and carry water.', ['Build this in planner', 'Which places are free?', 'Temple dress code'], [plannerAction])
  }

  if (/nature|lake|water/.test(query)) {
    return result('Tissa Wewa is the best relaxed nature stop, especially during the final hour before sunset. Pair it with nearby Isurumuniya.', ['Build this in planner', 'Tissa Wewa details', 'Best sunset route'], [placeAction(places.find((place) => place._id === 'tissa-wewa')), plannerAction])
  }

  return result('I can help with opening times, entry fees, etiquette, nearby places, sunset ideas or a route based on your available hours. Try: “I have 5 hours and prefer heritage.”', ['I have 5 hours', 'Best free places', 'Quiet heritage route'], [exploreAction])
}

function MessageText({ text }) {
  const lines = String(text).split('\n')
  return (
    <div className="message-copy">
      {lines.map((line, index) => {
        if (!line) return <span className="message-spacer" key={`space-${index}`} />
        const numbered = /^\d+\./.test(line)
        return <span className={numbered ? 'message-list-line' : ''} key={`${line}-${index}`}>{line}</span>
      })}
    </div>
  )
}

export default function AIChatBot() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const [voiceNotice, setVoiceNotice] = useState('')
  const [assistantMode, setAssistantMode] = useState('ready')
  const [suggestions, setSuggestions] = useState(quickPrompts)
  const [messages, setMessages] = useState(() => {
    try {
      const stored = JSON.parse(sessionStorage.getItem('rajarata-chat'))
      return Array.isArray(stored) && stored.length ? stored : [welcomeMessage]
    } catch {
      return [welcomeMessage]
    }
  })
  const endRef = useRef(null)
  const inputRef = useRef(null)
  const recognitionRef = useRef(null)

  const pageContext = useMemo(() => {
    if (pathname.startsWith('/place/')) return 'Place guide context'
    if (pathname === '/explore') return 'Explore page context'
    if (pathname === '/planner') return 'Day planner context'
    if (pathname === '/admin') return 'Destination studio context'
    return 'Anuradhapura travel context'
  }, [pathname])

  useEffect(() => {
    sessionStorage.setItem('rajarata-chat', JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, open])

  useEffect(() => {
    if (!open) return undefined
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 220)
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      window.clearTimeout(focusTimer)
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  useEffect(() => {
    if (!inputRef.current) return
    inputRef.current.style.height = 'auto'
    inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 96)}px`
  }, [input])

  useEffect(() => () => recognitionRef.current?.stop?.(), [])

  const sendMessage = async (preset) => {
    const text = String(preset ?? input).trim()
    if (!text || loading) return

    const userMessage = { id: newId(), role: 'user', text, time: now() }
    const conversation = [...messages, userMessage]
    setMessages(conversation)
    setInput('')
    setVoiceNotice('')
    setLoading(true)

    let response
    try {
      const history = messages.slice(-6).map(({ role, text: historyText }) => ({ role, text: historyText }))
      const { data } = await chatWithAssistant(text, history)
      response = data?.reply ? data : localAnswer(text, messages)
      setAssistantMode('online')
    } catch {
      await new Promise((resolve) => window.setTimeout(resolve, 620))
      response = localAnswer(text, messages)
      setAssistantMode('local')
    }

    setMessages((current) => [...current, {
      id: newId(),
      role: 'assistant',
      text: response.reply,
      time: now(),
      actions: Array.isArray(response.actions) ? response.actions : [],
      source: assistantMode === 'local' ? 'local' : undefined,
    }])
    setSuggestions(Array.isArray(response.suggestions) && response.suggestions.length ? response.suggestions : quickPrompts)
    setLoading(false)
  }

  const clear = () => {
    setMessages([{ ...welcomeMessage, id: newId() }])
    setSuggestions(quickPrompts)
    setAssistantMode('ready')
    setVoiceNotice('')
  }

  const toggleListening = () => {
    if (listening) {
      recognitionRef.current?.stop?.()
      setListening(false)
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setVoiceNotice('Voice input is not supported in this browser.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-LK'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onstart = () => {
      setListening(true)
      setVoiceNotice('Listening… speak now')
    }
    recognition.onresult = (event) => {
      setInput(event.results[0][0].transcript)
      setVoiceNotice('Voice message ready to send')
    }
    recognition.onerror = () => setVoiceNotice('Could not hear you. Please try again.')
    recognition.onend = () => setListening(false)
    recognitionRef.current = recognition
    recognition.start()
  }

  return (
    <>
      {!open && (
  <button
    className="chat-launcher ai-assistant-launcher"
    onClick={() => setOpen(true)}
    aria-label="Open RajaRata AI guide"
  >
    <span className="ai-assistant-person">
      <img
        src="/images/ai-assistant-girl.png"
        alt=""
        aria-hidden="true"
      />
    </span>

    <span className="ai-assistant-button">
      <MessageCircle size={22} />
      <b>Ask AI</b>
    </span>

    <span className="ai-assistant-status">
      <span />
    </span>
  </button>
)}

      {open && (
        <section className="chat-window premium-chat-window" aria-label="RajaRata AI travel guide">
          <header className="chat-header premium-chat-header">
            <div className="ai-avatar"><Compass size={22} /><span /></div>
            <div className="premium-chat-title">
              <span><small>RAJARATA</small><Sparkles size={11} /></span>
              <strong>Travel concierge</strong>
              <small><i /> Ready · destination specialist</small>
            </div>
            <button onClick={clear} title="Start a new conversation" aria-label="Start a new conversation"><Trash2 size={16} /></button>
            <button onClick={() => setOpen(false)} title="Minimise chat" aria-label="Minimise chat"><ChevronDown size={20} /></button>
            <button className="chat-close-mobile" onClick={() => setOpen(false)} title="Close chat" aria-label="Close chat"><X size={19} /></button>
          </header>

          <div className="chat-context-bar premium-chat-context">
            <span><MapPin size={12} /> {pageContext}</span>
            <b>{assistantMode === 'local' ? 'Local mode' : '10 places live'}</b>
          </div>

          <div className="chat-messages premium-chat-messages" aria-live="polite">
            <div className="chat-day-divider"><span>Today</span></div>
            {messages.map((message) => (
              <div key={message.id} className={`chat-row ${message.role}`}>
                {message.role === 'assistant' && <span className="mini-avatar"><Bot size={14} /></span>}
                <div className="chat-message-stack">
                  {message.role === 'assistant' && <small className="message-author">RajaRata guide</small>}
                  <div className="chat-bubble">
                    <MessageText text={message.text} />
                    <time>{message.time}</time>
                  </div>
                  {message.actions?.length > 0 && (
                    <div className="chat-message-actions">
                      {message.actions.map((action) => (
                        <Link to={action.to} key={`${message.id}-${action.to}`} onClick={() => setOpen(false)}>
                          {action.type === 'planner' ? <Route size={13} /> : <Compass size={13} />}
                          {action.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-row assistant">
                <span className="mini-avatar"><Bot size={14} /></span>
                <div className="chat-message-stack">
                  <small className="message-author">Checking your options…</small>
                  <div className="typing-bubble"><i /><i /><i /></div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="chat-prompts premium-chat-prompts">
            <span>Suggested</span>
            <div>
              {suggestions.map((prompt) => (
                <button key={prompt} type="button" onClick={() => sendMessage(prompt)} disabled={loading}>{prompt}</button>
              ))}
            </div>
          </div>

          <form className="chat-composer premium-chat-composer" onSubmit={(event) => { event.preventDefault(); sendMessage() }}>
            <div className="composer-hint">
              <span><Sparkles size={11} /> Ask naturally—follow-up questions work too</span>
              <b>{input.length}/300</b>
            </div>
            <div className={listening ? 'is-listening' : ''}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    sendMessage()
                  }
                }}
                rows="1"
                maxLength="300"
                placeholder="Ask about a place or plan your day…"
                aria-label="Message RajaRata AI"
              />
              <button className="voice-button" type="button" onClick={toggleListening} aria-label={listening ? 'Stop listening' : 'Use voice input'} aria-pressed={listening}>
                {listening ? <MicOff size={17} /> : <Mic size={17} />}
              </button>
              <button className="chat-send-button" type="submit" disabled={!input.trim() || loading} aria-label="Send message"><Send size={17} /></button>
            </div>
            <small className={voiceNotice ? 'has-notice' : ''}>
              <Clock3 size={11} /> {voiceNotice || 'Travel guidance remains available when the server is offline.'}
            </small>
          </form>
        </section>
      )}
    </>
  )
}