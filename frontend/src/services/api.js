import axios from 'axios'


const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    '/api',

  timeout: 10000
})


api.interceptors.request.use(
  (config) => {

    const token =
      localStorage.getItem('token')


    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`
    }


    return config
  }
)


/* =========================================================
   PLACES
========================================================= */

export const fetchPlaces = (
  category = 'All',
  search = ''
) =>
  api.get('/places', {
    params: {
      category,
      search
    }
  })


export const fetchPlaceById = (id) =>
  api.get(`/places/${id}`)


export const createPlace = (
  placeData
) =>
  api.post(
    '/places',
    placeData
  )


export const updatePlace = (
  id,
  placeData
) =>
  api.put(
    `/places/${id}`,
    placeData
  )


export const deletePlace = (id) =>
  api.delete(
    `/places/${id}`
  )


/* =========================================================
   AUTH
========================================================= */

export const loginUser = (
  credentials
) =>
  api.post(
    '/auth/login',
    credentials
  )


export const registerUser = (
  userData
) =>
  api.post(
    '/auth/register',
    userData
  )


/* =========================================================
   ITINERARY
========================================================= */

export const createItinerary = (
  itineraryData
) =>
  api.post(
    '/itineraries',
    itineraryData
  )


/* =========================================================
   CHATBOT
========================================================= */

export const chatWithAssistant = (
  message,
  history = []
) =>
  api.post(
    '/chat',
    {
      message,
      history
    }
  )


export default api