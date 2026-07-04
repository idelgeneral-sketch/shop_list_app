import { createContext, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'shopping-list-settings-v1'

const defaultSettings = {
  smartSearch: true,
  confirmBeforeDelete: false,
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultSettings
    return { ...defaultSettings, ...JSON.parse(raw) }
  } catch {
    return defaultSettings
  }
}

const SettingsContext = createContext({
  settings: defaultSettings,
  setSettings: () => {},
})

export function SettingsProvider({ children }) {
  const [settings, setSettingsState] = useState(loadSettings)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  function setSettings(patch) {
    setSettingsState((prev) => ({ ...prev, ...patch }))
  }

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  return useContext(SettingsContext)
}
