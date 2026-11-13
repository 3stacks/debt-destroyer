import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import * as Sharing from 'expo-sharing'
import { type ComponentRef, useMemo, useRef, useState } from 'react'
import { Alert, StyleSheet, Text, useWindowDimensions, View } from 'react-native'
import { captureRef } from 'react-native-view-shot'
import { Body, Button, Screen, Segmented } from '../components/ui'
import { money } from '../lib/metrics'
import { usePlan } from '../lib/plan'
import { space } from '../lib/theme'
import { closedDebts, monthDiff, monthShort, shiftMonth } from '../lib/tracking'

type Privacy = 'percent' | 'amounts'

// A 9:16 card to share, and the clean replay for a screen recording. The card
// shows percentages by default, so that nobody shares their balances by mistake.
export default function ShareScreen() {
  const { tracking, analysis: a } = usePlan()
  const { width } = useWindowDimensions()
  const card = useRef<ComponentRef<typeof View>>(null)
  const [privacy, setPrivacy] = useState<Privacy>('percent')
  const cardWidth = Math.min(width - space.lg * 2, 340)

  const data = useMemo(() => {
    if (!a || !tracking) return null
    const balance = Object.values(a.balances).reduce((x, y) => x + y, 0)
    const progress = a.startTotal > 0 ? Math.max(0, Math.min(1, 1 - balance / a.startTotal)) : 0
    const after = a.lastReconciled ?? shiftMonth(a.current.startMonth, -1)
    const monthsIn = Math.max(0, monthDiff(a.original.startMonth, after) + 1)
    const toGo = a.projectedPayoff ? Math.max(0, monthDiff(after, a.projectedPayoff)) : null
    const debts = [
      // A closed debt counts as done when it was paid off, not when a loan took it over.
      ...closedDebts(tracking, a)
        .filter(d => !tracking.versions.some(v => v.debts.some(x => x.from?.includes(d.id))))
        .map(d => ({ name: d.name, done: true })),
      ...a.current.debts.map(d => ({ name: d.name, done: (a.balances[d.id] ?? 0) <= 0 })),
    ]
    return { balance, progress, monthsIn, toGo, debts, free: balance <= 0 }
  }, [a, tracking])

  if (!a || !data) {
    return (
      <Screen>
        <Body muted>Start a plan to share your progress.</Body>
      </Screen>
    )
  }

  const pct = Math.round(data.progress * 100)
  const headline = data.free ? "I'm debt free!" : `${pct}% paid off`
  const sub =
    privacy === 'amounts'
      ? `${money(a.totalActualPaid)} paid${data.free ? '' : ` · ${money(data.balance)} to go`}`
      : `${data.monthsIn} months in${data.toGo !== null && !data.free ? ` · ${data.toGo} to go` : ''}`

  const share = async () => {
    try {
      // React Native 0.88 types a View ref as an element, which view-shot's types do not know yet.
      const uri = await captureRef(card as unknown as Parameters<typeof captureRef>[0], { format: 'png', quality: 1, result: 'tmpfile' })
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Sharing is not available on this device')
        return
      }
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share your progress' })
    } catch {
      Alert.alert('The image could not be made. Take a screenshot of the card instead.')
    }
  }

  return (
    <Screen>
      <Segmented<Privacy>
        value={privacy}
        options={[
          { value: 'percent', label: 'Percentages' },
          { value: 'amounts', label: 'Dollar amounts' },
        ]}
        onChange={setPrivacy}
      />

      <View style={{ alignItems: 'center' }}>
        <View ref={card} collapsable={false} style={{ width: cardWidth, aspectRatio: 9 / 16, borderRadius: 24, overflow: 'hidden' }}>
          <LinearGradient colors={['#3f51b5', '#1e2a78', '#0b0f1a']} style={styles.card}>
            <Text style={styles.brand}>MY DEBT PAYOFF</Text>
            <View style={{ gap: space.sm }}>
              <Text style={styles.headline} adjustsFontSizeToFit numberOfLines={2}>
                {headline}
              </Text>
              <Text style={styles.sub}>{sub}</Text>
              <View style={styles.track}>
                <View style={[styles.bar, { width: `${pct}%` }]} />
              </View>
            </View>
            <View style={{ gap: 6 }}>
              {data.debts.slice(0, 6).map((d, i) => (
                <Text key={i} style={[styles.debt, d.done && styles.debtDone]} numberOfLines={1}>
                  {d.done ? '✓ ' : '○ '}
                  {d.name || 'Debt'}
                </Text>
              ))}
            </View>
            <View>
              {!data.free && a.projectedPayoff ? (
                <Text style={styles.date}>Debt free by {monthShort(a.projectedPayoff)}</Text>
              ) : null}
              <Text style={styles.footer}>Made with Debt Destroyer</Text>
            </View>
          </LinearGradient>
        </View>
      </View>

      <Button title="Share image" onPress={share} />
      <Body muted>
        For TikTok, Reels or Shorts: start a screen recording, then play the journey. The controls stay hidden until the
        end.
      </Body>
      <Button
        title="Play the journey for a recording"
        variant="secondary"
        onPress={() => router.push({ pathname: '/journey', params: { clean: '1', privacy } })}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  card: { flex: 1, padding: space.xl, justifyContent: 'space-between' },
  brand: { color: '#c7d2fe', fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  headline: { color: '#ffffff', fontSize: 44, fontWeight: '900', lineHeight: 48 },
  sub: { color: '#c7d2fe', fontSize: 16 },
  track: { height: 12, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden', marginTop: space.sm },
  bar: { height: '100%', backgroundColor: '#4ade80' },
  debt: { color: '#e0e7ff', fontSize: 15 },
  debtDone: { color: '#4ade80', textDecorationLine: 'line-through' },
  date: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  footer: { color: '#c7d2fe', fontSize: 12, marginTop: 4, letterSpacing: 1 },
})
