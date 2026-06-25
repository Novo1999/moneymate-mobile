export type ThemeMode = 'light' | 'dark'
export type ThemePreference = 'system' | ThemeMode

export type ThemeColors = {
  screen: string
  surface: string
  surfaceAlt: string
  heading: string
  text: string
  muted: string
  mutedSoft: string
  border: string
  borderStrong: string
  inputBg: string
  segmentBg: string
  segmentActiveBg: string
  segmentActiveText: string
  dashBorder: string
  dashBg: string
  primary: string
  primaryDeep: string
  primarySoftBg: string
  onPrimary: string
  secondary: string
  income: string
  danger: string
  dangerBorder: string
  dangerSoftBg: string
  warning: string
  overlay: string
  tabInactive: string
  /** gradient stops for hero / brand surfaces */
  gradient: [string, string, string]
  gradientDeep: [string, string]
  /** donut / chart series */
  chart: [string, string, string, string, string]
  statusBar: 'light' | 'dark'
}

export const lightColors: ThemeColors = {
  screen: '#F0FDFA',
  surface: '#ffffff',
  surfaceAlt: '#CCFBF1',
  heading: '#134E4A',
  text: '#134E4A',
  muted: '#0F766E',
  mutedSoft: '#5b9b92',
  border: 'rgba(20,184,166,0.16)',
  borderStrong: 'rgba(20,184,166,0.30)',
  inputBg: '#ffffff',
  segmentBg: 'rgba(20,184,166,0.10)',
  segmentActiveBg: '#0D9488',
  segmentActiveText: '#ffffff',
  dashBorder: 'rgba(13,148,136,0.40)',
  dashBg: 'rgba(204,251,241,0.40)',
  primary: '#0D9488',
  primaryDeep: '#0F766E',
  primarySoftBg: 'rgba(204,251,241,0.6)',
  onPrimary: '#ffffff',
  secondary: '#5EEAD4',
  income: '#0D9488',
  danger: '#ef4444',
  dangerBorder: 'rgba(239,68,68,0.3)',
  dangerSoftBg: 'rgba(254,226,226,0.7)',
  warning: '#f59e0b',
  overlay: 'rgba(11,60,73,0.45)',
  tabInactive: '#9fc7c0',
  gradient: ['#0D9488', '#14B8A6', '#5EEAD4'],
  gradientDeep: ['#0B3C49', '#0D9488'],
  chart: ['#0D9488', '#14B8A6', '#5EEAD4', '#99F6E4', '#0F766E'],
  statusBar: 'dark',
}

export const darkColors: ThemeColors = {
  screen: '#0A1A1C',
  surface: '#10282A',
  surfaceAlt: '#163436',
  heading: '#ECFDF8',
  text: '#D6F5EE',
  muted: '#7FB5AC',
  mutedSoft: '#5d8e86',
  border: 'rgba(94,234,212,0.12)',
  borderStrong: 'rgba(94,234,212,0.22)',
  inputBg: '#10282A',
  segmentBg: 'rgba(94,234,212,0.10)',
  segmentActiveBg: '#14B8A6',
  segmentActiveText: '#04211C',
  dashBorder: 'rgba(45,212,191,0.45)',
  dashBg: 'rgba(20,184,166,0.10)',
  primary: '#2DD4BF',
  primaryDeep: '#14B8A6',
  primarySoftBg: 'rgba(20,184,166,0.16)',
  onPrimary: '#04211C',
  secondary: '#5EEAD4',
  income: '#2DD4BF',
  danger: '#f87171',
  dangerBorder: 'rgba(248,113,113,0.35)',
  dangerSoftBg: 'rgba(248,113,113,0.14)',
  warning: '#fbbf24',
  overlay: 'rgba(0,0,0,0.6)',
  tabInactive: '#557d77',
  gradient: ['#0F766E', '#14B8A6', '#2DD4BF'],
  gradientDeep: ['#04211C', '#0F766E'],
  chart: ['#2DD4BF', '#14B8A6', '#5EEAD4', '#99F6E4', '#0F766E'],
  statusBar: 'light',
}

export const fonts = {
  heading: 'Inter_800ExtraBold',
  bold: 'Inter_700Bold',
  semibold: 'Inter_600SemiBold',
  medium: 'Inter_500Medium',
  body: 'Inter_400Regular',
}

export const radii = { sm: 10, md: 14, lg: 18, xl: 22, xxl: 28, pill: 999 }

export const shadow = {
  sm: {
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 3,
  },
  md: {
    shadowColor: '#0B3C49',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 6,
  },
}

export function colorsFor(mode: ThemeMode): ThemeColors {
  return mode === 'dark' ? darkColors : lightColors
}
