import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { router, useLocalSearchParams } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Confetti } from '../components/Confetti'
import { buildJourney } from '../lib/journey'
import { money } from '../lib/metrics'
import { usePlan } from '../lib/plan'
import { space } from '../lib/theme'
import { monthShort } from '../lib/tracking'

const TARGET_MS = 8000
const GOOD = '#4ade80'

function haptic(kind: 'step' | 'done') {
  if (process.env.EXPO_OS === 'web') return
  if (kind === 'done') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
  else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {})
}

// The payoff journey, month by month. ?clean=1 hides the controls for a screen
// recording, and waits for a tap. ?privacy=amounts shows dollars.
export default function JourneyScreen() {
  const insets = useSafeAreaInsets()
  const { clean, privacy } = useLocalSearchParams<{ clean?: string; privacy?: string }>()
  const recording = clean === '1'
  const amounts = privacy === 'amounts'
  const { tracking, analysis } = usePlan()
  const journey = useMemo(() => (tracking && analysis ? buildJourney(tracking, analysis) : null), [tracking, analysis])

  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<'ready' | 'count' | 'play' | 'done'>(recording ? 'ready' : 'play')
  const [count, setCount] = useState(3)
  const [toast, setToast] = useState<string | null>(null)
  const toastScale = useRef(new Animated.Value(0)).current

  const frames = journey?.frames ?? []
  const step = Math.max(60, Math.min(450, TARGET_MS / Math.max(1, frames.length)))

  const restart = useCallback(() => {
    setIndex(0)
    setToast(null)
    setPhase(recording ? 'count' : 'play')
    setCount(3)
  }, [recording])

  useEffect(() => {
    if (phase !== 'count') return
    if (count === 0) {
      setPhase('play')
      return
    }
    const t = setTimeout(() => setCount(n => n - 1), 800)
    return () => clearTimeout(t)
  }, [phase, count])

  useEffect(() => {
    if (phase !== 'play' || frames.length === 0) return
    if (index >= frames.length - 1) {
      setPhase('done')
      haptic('done')
      return
    }
    const t = setTimeout(() => setIndex(i => i + 1), index === 0 ? 700 : step)
    return () => clearTimeout(t)
  }, [phase, index, frames.length, step])

  const frame = frames[index]
  useEffect(() => {
    if (!frame || frame.paidOff.length === 0 || !journey) return
    haptic('step')
    setToast(`${frame.paidOff.map(id => journey.debts[id]?.name || 'A debt').join(' and ')} paid off!`)
    toastScale.setValue(0.6)
    Animated.spring(toastScale, { toValue: 1, friction: 4, useNativeDriver: true }).start()
  }, [frame, journey, toastScale])

  if (!journey || !frame) {
    return (
      <View style={[styles.fill, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#1e2a78' }]}>
        <Text style={styles.label}>Start a plan to see your journey.</Text>
        <Pressable onPress={() => router.back()} style={styles.pill}>
          <Text style={styles.pillText}>Close</Text>
        </Pressable>
      </View>
    )
  }

  const progress = journey.startTotal > 0 ? Math.max(0, Math.min(1, 1 - frame.total / journey.startTotal)) : 0
  const ids = Object.keys(frame.balances)
  const done = phase === 'done'
  const showControls = !recording || done

  return (
    <LinearGradient colors={['#3f51b5', '#1e2a78', '#0b0f1a']} style={styles.fill}>
      <StatusBar style="light" />
      <Pressable
        style={[styles.fill, { paddingTop: insets.top + space.lg, paddingBottom: insets.bottom + space.lg }]}
        onPress={phase === 'ready' ? () => setPhase('count') : undefined}
        // Only the ready screen is one big button. In the other phases, iOS must
        // see the text and the Replay and Share buttons inside it.
        accessible={phase === 'ready'}
        accessibilityRole={phase === 'ready' ? 'button' : undefined}
        accessibilityLabel={phase === 'ready' ? 'Start your screen recording, then tap to play' : undefined}>
        <View style={styles.top}>
          <Text style={styles.brand}>MY DEBT PAYOFF</Text>
          {showControls ? (
            <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
              <Text style={styles.close}>✕</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.center}>
          <Text style={styles.month}>{monthShort(frame.month)}</Text>
          {frame.projected && !done ? <Text style={styles.badge}>PROJECTED</Text> : null}
          <Text style={[styles.big, done && journey.finished && { fontSize: 56 }]} adjustsFontSizeToFit numberOfLines={1}>
            {done && journey.finished ? 'Debt free!' : amounts ? money(frame.total) : `${Math.round(progress * 100)}%`}
          </Text>
          <Text style={styles.label}>
            {done && journey.finished
              ? `in ${journey.totalMonths} months`
              : amounts
                ? 'left to pay'
                : 'paid off'}
          </Text>
          <View style={styles.track}>
            <View style={[styles.bar, { width: `${progress * 100}%` }]} />
          </View>

          <View style={styles.debts}>
            {ids.map(id => {
              const b = frame.balances[id]
              const peak = journey.peaks[id] || 1
              const off = b <= 0
              return (
                <View key={id} style={styles.debt}>
                  <View style={styles.debtTop}>
                    <Text style={[styles.debtName, off && { color: GOOD }]} numberOfLines={1}>
                      {journey.debts[id]?.name || 'Debt'}
                    </Text>
                    <Text style={[styles.debtValue, off && { color: GOOD }]}>
                      {off ? 'Paid off ✓' : amounts ? money(b) : `${Math.round((1 - b / peak) * 100)}%`}
                    </Text>
                  </View>
                  <View style={styles.debtTrack}>
                    <View style={[styles.debtBar, { width: `${(1 - Math.min(1, b / peak)) * 100}%` }, off && { backgroundColor: GOOD }]} />
                  </View>
                </View>
              )
            })}
          </View>

          {toast && !done ? (
            <Animated.View style={[styles.toast, { transform: [{ scale: toastScale }] }]}>
              <Text style={styles.toastText}>{toast}</Text>
            </Animated.View>
          ) : null}
        </View>

        {phase === 'ready' ? <Text style={styles.hint}>Start your screen recording, then tap to play</Text> : null}
        {phase === 'count' ? <Text style={styles.count}>{count || 'Go!'}</Text> : null}

        {done ? (
          <View style={styles.end}>
            <Text style={styles.endText}>
              {journey.finished
                ? `${journey.realMonths} months of real payments${journey.realMonths < journey.totalMonths ? `, ${journey.totalMonths - journey.realMonths} to go` : ''}`
                : 'Keep going: the plan does not reach zero yet'}
            </Text>
            <Text style={styles.footer}>Made with Debt Destroyer</Text>
            {showControls ? (
              <View style={styles.buttons}>
                <Pressable onPress={restart} style={styles.pill} accessibilityRole="button">
                  <Text style={styles.pillText}>Replay</Text>
                </Pressable>
                {!recording ? (
                  <Pressable onPress={() => router.replace('/share')} style={[styles.pill, styles.pillSolid]} accessibilityRole="button">
                    <Text style={[styles.pillText, { color: '#1e2a78' }]}>Share</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </View>
        ) : null}
      </Pressable>
      {done && journey.finished ? <Confetti /> : null}
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: space.xl },
  brand: { color: '#c7d2fe', fontSize: 13, fontWeight: '800', letterSpacing: 2 },
  close: { color: '#ffffff', fontSize: 22, fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', paddingHorizontal: space.xl, gap: space.sm },
  month: { color: '#ffffff', fontSize: 22, fontWeight: '700', textAlign: 'center' },
  badge: {
    alignSelf: 'center',
    color: '#fbbf24',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    borderWidth: 1,
    borderColor: '#fbbf24',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  big: { color: '#ffffff', fontSize: 72, fontWeight: '900', textAlign: 'center', fontVariant: ['tabular-nums'] },
  label: { color: '#c7d2fe', fontSize: 18, textAlign: 'center' },
  track: { height: 14, borderRadius: 7, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden', marginTop: space.md },
  bar: { height: '100%', backgroundColor: GOOD, borderRadius: 7 },
  debts: { marginTop: space.xl, gap: space.md },
  debt: { gap: 4 },
  debtTop: { flexDirection: 'row', justifyContent: 'space-between', gap: space.md },
  debtName: { color: '#ffffff', fontSize: 16, fontWeight: '600', flex: 1 },
  debtValue: { color: '#c7d2fe', fontSize: 15, fontVariant: ['tabular-nums'] },
  debtTrack: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' },
  debtBar: { height: '100%', backgroundColor: '#a5b4fc' },
  toast: {
    alignSelf: 'center',
    marginTop: space.lg,
    backgroundColor: GOOD,
    borderRadius: 20,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  toastText: { color: '#052e16', fontSize: 16, fontWeight: '800' },
  hint: { color: '#ffffff', fontSize: 16, textAlign: 'center', paddingHorizontal: space.xl, opacity: 0.9 },
  count: { color: '#ffffff', fontSize: 64, fontWeight: '900', textAlign: 'center' },
  end: { alignItems: 'center', gap: space.sm, paddingHorizontal: space.xl },
  endText: { color: '#ffffff', fontSize: 17, fontWeight: '600', textAlign: 'center' },
  footer: { color: '#c7d2fe', fontSize: 13, letterSpacing: 1 },
  buttons: { flexDirection: 'row', gap: space.md, marginTop: space.sm },
  pill: {
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: space.xl,
    marginTop: space.lg,
  },
  pillSolid: { backgroundColor: '#ffffff' },
  pillText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
})
