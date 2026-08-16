const KEY = 'rajarata-analytics'

export function getAnalytics() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{"totalViews":0,"pages":{},"searches":0,"plans":0,"shares":0}')
  } catch {
    return { totalViews: 0, pages: {}, searches: 0, plans: 0, shares: 0 }
  }
}

const save = (data) => localStorage.setItem(KEY, JSON.stringify(data))

export function trackPage(pathname) {
  const data = getAnalytics()
  data.totalViews += 1
  data.pages[pathname] = (data.pages[pathname] || 0) + 1
  data.lastVisit = new Date().toISOString()
  save(data)
}

export function trackAction(action) {
  const data = getAnalytics()
  data[action] = (data[action] || 0) + 1
  save(data)
}
