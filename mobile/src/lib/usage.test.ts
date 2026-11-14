import { describe, expect, it, vi } from 'vitest'

vi.mock('react-native', () => ({ Platform: { OS: 'ios', Version: '18.1' }, Dimensions: { get: () => ({ width: 390, height: 844 }) } }))
vi.mock('expo-constants', () => ({ default: { expoConfig: { version: '1.0.0' } } }))
vi.mock('@react-native-async-storage/async-storage', () => ({ default: { getItem: async () => null, setItem: async () => {} } }))

const { dayKey, dueEvents, eventBody, userAgent } = await import('./usage')

const ios = { os: 'ios' as const, osVersion: '18.1', appVersion: '1.0.0', language: 'en-AU', screen: '390x844' }

describe('usage counts', () => {
  it('sends the install event once, and the daily event once a day', () => {
    expect(dueEvents({ enabled: true, installSent: false, lastDay: null }, '2026-11-13')).toEqual(['install', 'daily-open'])
    expect(dueEvents({ enabled: true, installSent: true, lastDay: '2026-11-13' }, '2026-11-13')).toEqual([])
    expect(dueEvents({ enabled: true, installSent: true, lastDay: '2026-11-12' }, '2026-11-13')).toEqual(['daily-open'])
  })

  it('sends nothing when the person turns it off', () => {
    expect(dueEvents({ enabled: false, installSent: false, lastDay: null }, '2026-11-13')).toEqual([])
  })

  it('sends no ID and no debt data', () => {
    const body = eventBody('daily-open', ios, 'tracking')
    expect(body.payload.data).toEqual({ platform: 'ios', version: '1.0.0', plan: 'tracking' })
    expect(Object.keys(body.payload).sort()).toEqual(['data', 'hostname', 'language', 'name', 'referrer', 'screen', 'title', 'url'])
    expect(body.payload.hostname).toBe('debtdestroyer.app')
  })

  it('uses a user agent that names the operating system', () => {
    expect(userAgent(ios)).toBe('Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) DebtDestroyer/1.0.0')
    expect(userAgent({ ...ios, os: 'android', osVersion: '14' })).toBe('Mozilla/5.0 (Linux; Android 14; Mobile) DebtDestroyer/1.0.0')
  })

  it('uses the local date', () => {
    expect(dayKey(new Date(2026, 10, 3, 23, 59))).toBe('2026-11-03')
  })
})
