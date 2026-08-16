const Place = require('../models/Place');

const normalize = (value = '') => String(value).toLowerCase().trim();
const listPlaces = (items, detail = '') => items.map((place, index) =>
  `${index + 1}. ${place.name}${detail === 'distance' ? ` · ${place.distanceFromHome} km` : ` · ${place.visitDuration} min`}`,
).join('\n');

const defaultSuggestions = ['Plan a calm 4-hour route', 'Which places are free?', 'Temple dress code'];
const placeAction = (place) => ({ label: 'View place guide', to: `/place/${place._id}`, type: 'place' });
const plannerAction = { label: 'Open Day planner', to: '/planner', type: 'planner' };
const exploreAction = { label: 'Explore all places', to: '/explore', type: 'explore' };

const findCategory = (text) => [
  'Religious', 'Heritage', 'Nature', 'Cultural', 'Museum', 'Recreational', 'Restaurant', 'Public Place',
].find((category) => text.includes(category.toLowerCase()));

function buildTimedRoute(places, hours) {
  const budget = Math.max(2, Math.min(hours, 10)) * 60;
  let used = 0;
  const chosen = [];
  for (const place of places) {
    const stop = Number(place.visitDuration || 45) + 18;
    if (used + stop <= budget) {
      chosen.push(place);
      used += stop;
    }
  }
  return chosen.slice(0, 6);
}

exports.chatWithAssistant = async (req, res) => {
  try {
    const message = String(req.body?.message || '').trim();
    if (!message) return res.status(400).json({ message: 'Please enter a question.' });
    if (message.length > 300) return res.status(400).json({ message: 'Please keep your question under 300 characters.' });

    const history = Array.isArray(req.body?.history)
      ? req.body.history.slice(-6).map((item) => String(item?.text || '').slice(0, 300)).filter(Boolean)
      : [];
    const places = await Place.find({ isActive: true }).sort({ distanceFromHome: 1 }).lean();
    if (!places.length) {
      return res.json({ reply: 'No active destinations are available yet. Please check again after the destination list is updated.', suggestions: [], actions: [] });
    }

    const text = normalize(message);
    const previousContext = normalize(history.join(' '));
    const mentionedNow = places.find((place) => text.includes(normalize(place.name)));
    const mentionedBefore = [...places]
      .sort((a, b) => normalize(b.name).length - normalize(a.name).length)
      .find((place) => previousContext.includes(normalize(place.name)));
    const mentioned = mentionedNow || mentionedBefore;
    const respond = (reply, suggestions = defaultSuggestions, actions = []) => res.json({ reply, suggestions, actions });

    if (/^(hi|hello|hey|ayubowan|good morning|good evening)\b/.test(text)) {
      return respond(
        'Ayubowan! Tell me how much time you have and the kind of experience you prefer. I can shape a practical Anuradhapura route for you.',
        ['I have 4 hours', 'Quiet heritage places', 'Best sunset route'],
        [exploreAction],
      );
    }

    if (/thank|thanks|helpful|great/.test(text)) {
      return respond(
        'You’re welcome. I’m here whenever you want to adjust the pace, compare places or check practical visit details.',
        ['Plan another route', 'What should I wear?', 'Show nearest places'],
        [plannerAction],
      );
    }

    if (/build this|open planner|add.*planner|fine.?tune/.test(text)) {
      return respond(
        'Your route is ready to refine. Open the Day planner to choose the exact start time, pace and destinations.',
        ['Make it more relaxed', 'Add a sunset stop', 'Temple dress code'],
        [plannerAction],
      );
    }

    if (mentioned) {
      const actions = [placeAction(mentioned), plannerAction];
      if (/open|close|time|hour/.test(text)) {
        return respond(`${mentioned.name} is open ${mentioned.openingTime}–${mentioned.closingTime}. Allow around ${mentioned.visitDuration} minutes for an unhurried visit.`, ['What is the entry fee?', 'What should I wear?', 'Add it to my day'], actions);
      }
      if (/fee|price|cost|ticket|free/.test(text)) {
        return respond(`${mentioned.name}: ${mentioned.entryFee || 'Free'}. Fees can change, so confirm at the entrance on the day.`, ['When should I visit?', 'What should I wear?', 'Add it to my day'], actions);
      }
      if (/dress|wear|cloth|shoe|etiquette/.test(text)) {
        return respond(`${mentioned.name} etiquette: ${mentioned.dressCode || 'Cover shoulders and knees and remove footwear in sacred areas.'}`, ['Opening time?', 'Entry fee?', 'Show the place guide'], actions);
      }
      if (/where|location|address|direction/.test(text)) {
        return respond(`${mentioned.name} is at ${mentioned.address}. It is about ${mentioned.distanceFromHome} km from the configured city-centre point.`, ['When should I visit?', 'Add it to my day', 'Show nearby places'], actions);
      }
      return respond(`${mentioned.name} is a ${normalize(mentioned.category)} highlight. ${mentioned.description}\n\nBest time: ${mentioned.bestVisitTime}. Allow ${mentioned.visitDuration} minutes.`, ['Opening time?', 'Entry fee?', 'What should I wear?'], actions);
    }

    if (/free|no fee|budget/.test(text)) {
      const free = places.filter((place) => normalize(place.entryFee).startsWith('free')).slice(0, 6);
      return respond(free.length ? `Good free choices are:\n${listPlaces(free)}\n\nTemple donations are optional but appreciated.` : 'No places are currently marked as free.', ['Plan a budget route', 'Show nearest places', 'Temple dress code'], [exploreAction, plannerAction]);
    }
    if (/near|nearest|closest/.test(text)) {
      return respond(`Closest places from the city-centre point:\n${listPlaces(places.slice(0, 5), 'distance')}`, ['Build this in planner', 'Which places are free?', 'Best sunset route'], [exploreAction, plannerAction]);
    }
    if (/sunset|evening|golden/.test(text)) {
      return respond('For sunset, start at Isurumuniya, continue beside Tissa Wewa, then finish at illuminated Ruwanwelisaya. Begin around 4:30 PM and carry a light temple shawl.', ['Build this in planner', 'Isurumuniya entry fee', 'Temple dress code'], [plannerAction]);
    }
    if (/dress|wear|cloth|shoe|etiquette/.test(text)) {
      return respond('At sacred sites, cover shoulders and knees, remove shoes and hats, keep voices low, and avoid posing with your back toward Buddha images. Socks help on hot stone.', ['Plan a sacred-city route', 'Which places are free?', 'Show nearest places'], [exploreAction]);
    }

    const category = findCategory(text);
    if (category) {
      const matches = places.filter((place) => place.category === category).slice(0, 6);
      return respond(matches.length ? `${category} places to consider:\n${listPlaces(matches, 'distance')}` : `No active ${normalize(category)} places are available.`, ['Build this in planner', 'Show nearest places', 'Which places are free?'], [exploreAction, plannerAction]);
    }

    const currentHours = Number(text.match(/(\d+(?:\.\d+)?)\s*(?:hour|hours|hr|hrs)/)?.[1]);
    const previousHours = Number(previousContext.match(/(\d+(?:\.\d+)?)\s*(?:hour|hours|hr|hrs)/)?.[1]);
    if (currentHours || /plan|route|day|itinerary/.test(text)) {
      const duration = currentHours || previousHours || 6;
      const route = buildTimedRoute(places, duration);
      return respond(`Here’s a realistic ${duration}-hour outline:\n${listPlaces(route)}\n\nI included short travel buffers. Use the Day planner to set an exact start time and pace.`, ['Build this in planner', 'Make it more relaxed', 'Add a sunset stop'], [plannerAction]);
    }

    return respond('I can help with opening times, entry fees, etiquette, nearby places, sunset ideas or a route based on your available hours. Try: “I have 5 hours and prefer heritage.”', ['I have 5 hours', 'Best free places', 'Quiet heritage route'], [exploreAction]);
  } catch (error) {
    console.error(`Chat assistant error: ${error.message}`);
    return res.status(500).json({ message: 'The travel assistant is temporarily unavailable.' });
  }
};