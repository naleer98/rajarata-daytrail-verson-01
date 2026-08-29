const Place = require('../models/Place');

const NVIDIA_API_URL =
  'https://integrate.api.nvidia.com/v1/chat/completions';

function createPlaceContext(places) {
  return places
    .slice(0, 30)
    .map((place) => {
      return [
        `Name: ${place.name}`,
        `Category: ${place.category || 'Not specified'}`,
        `Description: ${place.description || 'Not specified'}`,
        `Address: ${place.address || 'Not specified'}`,
        `Opening time: ${place.openingTime || 'Not specified'}`,
        `Closing time: ${place.closingTime || 'Not specified'}`,
        `Entry fee: ${place.entryFee || 'Not specified'}`,
        `Visit duration: ${place.visitDuration || 'Not specified'} minutes`,
        `Best visit time: ${place.bestVisitTime || 'Not specified'}`,
        `Dress code: ${place.dressCode || 'Not specified'}`,
        `Distance: ${place.distanceFromHome || 'Not specified'} km`,
      ].join('\n');
    })
    .join('\n\n');
}

exports.chatWithAssistant = async (req, res) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const message = String(req.body?.message || '').trim();

    if (!message) {
      return res.status(400).json({
        message: 'Please enter a question.',
      });
    }

    if (message.length > 500) {
      return res.status(400).json({
        message: 'Please keep your question under 500 characters.',
      });
    }

    if (!process.env.NVIDIA_API_KEY) {
      return res.status(503).json({
        message: 'AI assistant API key is not configured.',
      });
    }

    const places = await Place.find({ isActive: true })
      .sort({ distanceFromHome: 1 })
      .lean();

    const placeContext = createPlaceContext(places);

    const history = Array.isArray(req.body?.history)
      ? req.body.history.slice(-6).map((item) => ({
          role: item?.role === 'assistant' ? 'assistant' : 'user',
          content: String(item?.text || '').slice(0, 500),
        }))
      : [];

    const systemPrompt = `
You are RajaRata AI Guide, a helpful tourism assistant for
Anuradhapura, Sri Lanka.

Rules:
- Answer using the destination data given below.
- Never invent opening times, prices, addresses or historical facts.
- If information is unavailable, clearly say it is not available.
- Keep answers clear, friendly and practical.
- Prefer short answers below 180 words.
- Reply in the same language style used by the visitor.
- For sacred sites, respectfully mention relevant dress etiquette.
- Mention that fees and opening times may change when appropriate.

AVAILABLE DESTINATION DATA:

${placeContext || 'No destination data is currently available.'}
`.trim();

    const apiResponse = await fetch(NVIDIA_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model:
          process.env.NVIDIA_MODEL ||
          'deepseek-ai/deepseek-v4-flash-0731',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          ...history,
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.7,
        top_p: 0.95,
        max_tokens: 900,
        stream: false,
        chat_template_kwargs: {
          thinking: true,
          reasoning_effort: 'high',
        },
      }),
      signal: controller.signal,
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error(
        'NVIDIA API error:',
        apiResponse.status,
        data?.error?.message || data
      );

      return res.status(502).json({
        message: 'AI service is temporarily unavailable.',
      });
    }

    const reply = data?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return res.status(502).json({
        message: 'AI service returned an empty response.',
      });
    }

    return res.json({
      reply,
      suggestions: [
        'Plan a calm 4-hour route',
        'Which places are free?',
        'Temple dress code',
      ],
      actions: [
        {
          label: 'Explore all places',
          to: '/explore',
          type: 'explore',
        },
        {
          label: 'Open Day planner',
          to: '/planner',
          type: 'planner',
        },
      ],
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      return res.status(504).json({
        message: 'AI request took too long. Please try again.',
      });
    }

    console.error('Chat assistant error:', error.message);

    return res.status(500).json({
      message: 'The travel assistant is temporarily unavailable.',
    });
  } finally {
    clearTimeout(timeout);
  }
};
