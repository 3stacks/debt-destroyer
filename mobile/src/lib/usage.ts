// Anonymous usage counts, so that we know how many people use the app, and in
// which countries. The app sends at most two kinds of event:
// - "install": once, the first time the app opens.
// - "daily-open": once on each day that the app opens.
// Each event has the platform, the app version, the language and the screen
// size, and whether there is a plan. It has no ID, and no debt data. The
// count of "daily-open" events on a day is the number of daily users.
//
// The events go to the analytics proxy of the website (functions/_lib/
// analytics.ts), which sends them on to Umami. Umami finds the country from
// the IP address, and it does not keep the address.
//
// The person can turn this off in the About screen. Development builds, test
// builds and the web build send nothing.
import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'
import { Dimensions, Platform } from 'react-native'
import { E2E } from './clock'

const KEY = 'debt-destroyer:usage'
const ENDPOINT = 'https://debtdestroyer.app/a/api/send'
const HOST = 'debtdestroyer.app'

export type PlanStage = 'none' | 'draft' | 'tracking'

interface UsageState {
  enabled: boolean
  installSent: boolean
  lastDay: string | null
}

const DEFAULT: UsageState = { enabled: true, installSent: false, lastDay: null }

export async function readUsage(): Promise<UsageState> {
  try {
    const raw = await AsyncStorage.getItem(KEY)
    return raw ? { ...DEFAULT, ...(JSON.parse(raw) as Partial<UsageState>) } : DEFAULT
  } catch {
    return DEFAULT
  }
}

async function writeUsage(state: UsageState) {
  await AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {})
}

export async function setUsageEnabled(enabled: boolean) {
  await writeUsage({ ...(await readUsage()), enabled })
}

export const usageActive = () => Platform.OS !== 'web' && !__DEV__ && !E2E

/** The local date, for example 2026-11-13. */
export function dayKey(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** The events to send now, from the saved state and today's date. */
export function dueEvents(state: UsageState, today: string): ('install' | 'daily-open')[] {
  if (!state.enabled) return []
  const due: ('install' | 'daily-open')[] = []
  if (!state.installSent) due.push('install')
  if (state.lastDay !== today) due.push('daily-open')
  return due
}

export interface Device {
  os: 'ios' | 'android'
  osVersion: string
  appVersion: string
  language: string
  screen: string
}

/** The body that Umami takes at /api/send. The proxy adds the website ID. */
export function eventBody(name: string, device: Device, stage: PlanStage) {
  return {
    type: 'event',
    payload: {
      hostname: HOST,
      url: `/native/${device.os}`,
      title: 'Debt Destroyer app',
      language: device.language,
      screen: device.screen,
      referrer: '',
      name,
      data: { platform: device.os, version: device.appVersion, plan: stage },
    },
  }
}

/** A browser-like user agent, so that Umami can read the operating system. */
export function userAgent(d: Device): string {
  const os = d.os === 'ios' ? `iPhone; CPU iPhone OS ${d.osVersion.replace(/\./g, '_')} like Mac OS X` : `Linux; Android ${d.osVersion}; Mobile`
  return `Mozilla/5.0 (${os}) DebtDestroyer/${d.appVersion}`
}

function device(): Device | null {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') return null
  const { width, height } = Dimensions.get('screen')
  const osVersion =
    Platform.OS === 'android'
      ? String((Platform.constants as { Release?: string }).Release ?? Platform.Version)
      : String(Platform.Version)
  let language = 'en'
  try {
    language = Intl.DateTimeFormat().resolvedOptions().locale
  } catch {}
  return {
    os: Platform.OS,
    osVersion,
    appVersion: Constants.expoConfig?.version ?? '0',
    language,
    screen: `${Math.round(width)}x${Math.round(height)}`,
  }
}

async function send(name: string, d: Device, stage: PlanStage): Promise<boolean> {
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'user-agent': userAgent(d) },
      body: JSON.stringify(eventBody(name, d, stage)),
    })
    return res.ok
  } catch {
    return false
  }
}

let running: Promise<void> | null = null

/** Send the events that are due. Call it when the app opens. A failure tries again next time. */
export function reportOpen(stage: PlanStage): Promise<void> {
  if (!usageActive()) return Promise.resolve()
  running ??= report(stage).finally(() => {
    running = null
  })
  return running
}

async function report(stage: PlanStage): Promise<void> {
  const d = device()
  if (!d) return
  const state = await readUsage()
  const today = dayKey(new Date())
  const next = { ...state }
  for (const name of dueEvents(state, today)) {
    if (!(await send(name, d, stage))) break
    if (name === 'install') next.installSent = true
    else next.lastDay = today
  }
  if (next.installSent !== state.installSent || next.lastDay !== state.lastDay) await writeUsage(next)
}
