import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const translations = {
  en: {
    discover: 'Discover', places: 'Places', planner: 'Day planner', admin: 'Admin dashboard', adminLogin: 'Admin login',
    liveMap: 'Live map', planDay: 'Plan my day', favourites: 'Favourites', install: 'Install app', language: 'Language', theme: 'Theme',
    homeKicker: 'Your ancient city, beautifully timed', homeTitle: 'Walk through a kingdom that', homeAccent: 'still breathes.', homeCopy: 'Discover Anuradhapura with thoughtful routes, cultural guidance and a live map designed around your day—not a generic checklist.',
    exploreKicker: 'Curated heritage guide', exploreTitle: 'Find the place that', exploreAccent: 'fits your moment.', exploreCopy: 'Search by feeling, category or name—then see every destination in its real geographic context.',
    plannerKicker: 'Smart route studio', plannerTitle: 'One day.', plannerAccent: 'Perfectly paced.', plannerCopy: 'Pick what inspires you. We will arrange a practical route around distance, opening hours and your preferred rhythm.',
  },
  ta: {
    discover: 'கண்டறியுங்கள்', places: 'இடங்கள்', planner: 'நாள் திட்டம்', admin: 'நிர்வாகப் பகுதி', adminLogin: 'நிர்வாக உள்நுழைவு',
    liveMap: 'நேரடி வரைபடம்', planDay: 'என் நாளைத் திட்டமிடு', favourites: 'விருப்பங்கள்', install: 'செயலியை நிறுவு', language: 'மொழி', theme: 'தோற்றம்',
    homeKicker: 'உங்கள் புராதன நகரம், அழகாகத் திட்டமிடப்பட்டது', homeTitle: 'இன்றும் உயிரோடு இருக்கும்', homeAccent: 'ஒரு இராச்சியத்தில் நடப்போம்.', homeCopy: 'சிந்தனையுடன் அமைந்த பாதைகள், பண்பாட்டு வழிகாட்டல் மற்றும் நேரடி வரைபடத்துடன் அனுராதபுரத்தை கண்டறியுங்கள்.',
    exploreKicker: 'தேர்ந்தெடுக்கப்பட்ட பாரம்பரிய வழிகாட்டி', exploreTitle: 'உங்கள் தருணத்திற்கு ஏற்ற', exploreAccent: 'இடத்தைக் கண்டறியுங்கள்.', exploreCopy: 'உணர்வு, வகை அல்லது பெயரால் தேடி, ஒவ்வொரு இடத்தையும் வரைபடத்தில் பாருங்கள்.',
    plannerKicker: 'ஸ்மார்ட் பயணத் திட்டம்', plannerTitle: 'ஒரே நாள்.', plannerAccent: 'சரியான வேகம்.', plannerCopy: 'உங்களுக்கு பிடித்த இடங்களைத் தேர்ந்தெடுக்கவும். தூரம், நேரம் மற்றும் வேகத்திற்கு ஏற்ப பாதையை அமைப்போம்.',
  },
  si: {
    discover: 'සොයා බලන්න', places: 'ස්ථාන', planner: 'දින සැලසුම', admin: 'පරිපාලක පුවරුව', adminLogin: 'පරිපාලක පිවිසුම',
    liveMap: 'සජීවී සිතියම', planDay: 'මගේ දවස සැලසුම් කරන්න', favourites: 'ප්‍රියතම', install: 'යෙදුම ස්ථාපනය', language: 'භාෂාව', theme: 'තේමාව',
    homeKicker: 'ඔබේ පුරාණ නගරය, අලංකාර ලෙස සැලසුම් කර ඇත', homeTitle: 'තවමත් හුස්ම ගන්නා', homeAccent: 'රාජධානියක ඇවිදින්න.', homeCopy: 'සැලසුම් කළ මාර්ග, සංස්කෘතික මඟපෙන්වීම් සහ සජීවී සිතියමක් සමඟ අනුරාධපුරය සොයා බලන්න.',
    exploreKicker: 'තෝරාගත් උරුම මාර්ගෝපදේශය', exploreTitle: 'ඔබේ මොහොතට ගැළපෙන', exploreAccent: 'ස්ථානය සොයන්න.', exploreCopy: 'හැඟීම, වර්ගය හෝ නම අනුව සොයා සෑම ගමනාන්තයක්ම සිතියමේ බලන්න.',
    plannerKicker: 'ස්මාර්ට් මාර්ග සැලසුම', plannerTitle: 'එක් දවසක්.', plannerAccent: 'නිවැරදි වේගයෙන්.', plannerCopy: 'ඔබ කැමති ස්ථාන තෝරන්න. දුර, විවෘත වේලාවන් සහ ඔබේ වේගය අනුව මාර්ගය සකස් කරමු.',
  },
}

const SitePreferencesContext = createContext(null)

export function SitePreferencesProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('rajarata-language') || 'en')
  const [theme, setTheme] = useState(() => localStorage.getItem('rajarata-theme') || 'light')

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dataset.language = language
    localStorage.setItem('rajarata-language', language)
  }, [language])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('rajarata-theme', theme)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#061b14' : '#0c2b21')
  }, [theme])

  const value = useMemo(() => ({
    language,
    setLanguage,
    theme,
    toggleTheme: () => setTheme((current) => current === 'dark' ? 'light' : 'dark'),
    t: (key) => translations[language]?.[key] || translations.en[key] || key,
  }), [language, theme])

  return <SitePreferencesContext.Provider value={value}>{children}</SitePreferencesContext.Provider>
}

export function useSitePreferences() {
  const value = useContext(SitePreferencesContext)
  if (!value) throw new Error('useSitePreferences must be used inside SitePreferencesProvider')
  return value
}
