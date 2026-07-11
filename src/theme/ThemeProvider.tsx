import AsyncStorage from '@react-native-async-storage/async-storage'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useColorScheme } from 'react-native'
import { colorsFor, fonts, radii, shadow, type ThemeColors, type ThemeMode, type ThemePreference } from './tokens'

const PREFERENCE_KEY = 'moneymate_theme_preference'

type ThemeContextValue = {
  mode: ThemeMode
  preference: ThemePreference
  colors: ThemeColors
  fonts: typeof fonts
  radii: typeof radii
  shadow: typeof shadow
  setPreference: (preference: ThemePreference) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme()
  const [preference, setPreferenceState] = useState<ThemePreference>('system')

  useEffect(() => {
    const loadPreference = async () => {
      const stored = await AsyncStorage.getItem(PREFERENCE_KEY)
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setPreferenceState(stored)
      }
    }
    loadPreference()
  }, [])

  const setPreference = (next: ThemePreference) => {
    setPreferenceState(next)
    AsyncStorage.setItem(PREFERENCE_KEY, next)
  }

  const mode: ThemeMode = preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, preference, colors: colorsFor(mode), fonts, radii, shadow, setPreference }),
    [mode, preference],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
