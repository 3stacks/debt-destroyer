import { useColorScheme } from 'react-native'

// The brand colour is the indigo of the web app (#3f51b5). The chart colours
// are the same hues as the web chart.
const light = {
  bg: '#f2f3f8',
  surface: '#ffffff',
  surface2: '#eceef5',
  text: '#0b1020',
  muted: '#667085',
  line: '#e3e6ee',
  accent: '#3f51b5',
  accentInk: '#ffffff',
  accentSoft: '#e8eaf6',
  good: '#16a34a',
  goodSoft: '#16a34a1a',
  bad: '#dc2626',
  badSoft: '#dc26261a',
  warn: '#d97706',
  warnSoft: '#f59e0b1f',
  info: '#2563eb',
  infoSoft: '#2563eb1a',
  violet: '#9333ea',
  violetSoft: '#9333ea1a',
}

const dark: typeof light = {
  bg: '#0b0f1a',
  surface: '#161b2b',
  surface2: '#1f2538',
  text: '#f1f3f9',
  muted: '#98a2b3',
  line: '#2a3147',
  accent: '#8c9eff',
  accentInk: '#0b0f1a',
  accentSoft: '#3f51b533',
  good: '#4ade80',
  goodSoft: '#4ade801f',
  bad: '#f87171',
  badSoft: '#f871711f',
  warn: '#fbbf24',
  warnSoft: '#fbbf241f',
  info: '#60a5fa',
  infoSoft: '#60a5fa1f',
  violet: '#c084fc',
  violetSoft: '#c084fc1f',
}

export type Colors = typeof light

export function useColors(): Colors {
  return useColorScheme() === 'dark' ? dark : light
}

export const CHART_COLORS = ['#dc2626', '#3b82f6', '#22c55e', '#ec4899', '#f97316']

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 }
export const radius = { sm: 8, md: 12, lg: 16 }
