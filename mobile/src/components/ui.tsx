import { ReactNode } from 'react'
import {
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native'
import { Colors, radius, space, useColors } from '../lib/theme'

export function Screen({ children }: { children: ReactNode }) {
  const c = useColors()
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentInsetAdjustmentBehavior="automatic"
      keyboardDismissMode="interactive"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.screen}>
      {children}
    </ScrollView>
  )
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const c = useColors()
  return <View style={[styles.card, { backgroundColor: c.surface }, style]}>{children}</View>
}

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  const c = useColors()
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: c.muted }]}>{title.toUpperCase()}</Text>
      {action}
    </View>
  )
}

export function Body({ children, muted, style }: { children: ReactNode; muted?: boolean; style?: StyleProp<TextStyle> }) {
  const c = useColors()
  return <Text style={[styles.body, { color: muted ? c.muted : c.text }, style]}>{children}</Text>
}

export function Heading({ children, color }: { children: ReactNode; color?: string }) {
  const c = useColors()
  return <Text style={[styles.heading, { color: color ?? c.text }]}>{children}</Text>
}

type Tone = 'neutral' | 'good' | 'bad' | 'warn' | 'info' | 'violet'

function toneColors(c: Colors, tone: Tone): { fg: string; bg: string } {
  switch (tone) {
    case 'good':
      return { fg: c.good, bg: c.goodSoft }
    case 'bad':
      return { fg: c.bad, bg: c.badSoft }
    case 'warn':
      return { fg: c.warn, bg: c.warnSoft }
    case 'info':
      return { fg: c.info, bg: c.infoSoft }
    case 'violet':
      return { fg: c.violet, bg: c.violetSoft }
    default:
      return { fg: c.text, bg: c.surface }
  }
}

export function Stat({ value, label, tone = 'neutral', note }: { value: string; label: string; tone?: Tone; note?: string }) {
  const c = useColors()
  const t = toneColors(c, tone)
  return (
    <View style={[styles.stat, { backgroundColor: t.bg }]}>
      <Text style={[styles.statValue, { color: t.fg }]} adjustsFontSizeToFit numberOfLines={1}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: c.muted }]}>{label}</Text>
      {note ? <Text style={[styles.statNote, { color: c.muted }]}>{note}</Text> : null}
    </View>
  )
}

export function StatGrid({ children }: { children: ReactNode }) {
  return <View style={styles.grid}>{children}</View>
}

export function Callout({ tone, title, children }: { tone: Tone; title?: string; children: ReactNode }) {
  const c = useColors()
  const t = toneColors(c, tone)
  return (
    <View style={[styles.callout, { backgroundColor: t.bg }]}>
      {title ? <Text style={[styles.calloutTitle, { color: t.fg }]}>{title}</Text> : null}
      <Text style={[styles.body, { color: c.text }]}>{children}</Text>
    </View>
  )
}

export function Em({ children, color }: { children: ReactNode; color: string }) {
  return <Text style={{ color, fontWeight: '600' }}>{children}</Text>
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  const c = useColors()
  return (
    <View style={[styles.segmented, { backgroundColor: c.surface2 }]} accessibilityRole="tablist">
      {options.map(o => {
        const selected = o.value === value
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(o.value)}
            style={[styles.segment, selected && { backgroundColor: c.surface, ...styles.segmentShadow }]}>
            <Text style={[styles.segmentText, { color: selected ? c.text : c.muted }]}>{o.label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

export function Field({
  label,
  prefix,
  suffix,
  error,
  hint,
  ...input
}: TextInputProps & { label: string; prefix?: string; suffix?: string; error?: string; hint?: string }) {
  const c = useColors()
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: c.muted }]}>{label}</Text>
      <View
        style={[
          styles.fieldBox,
          { backgroundColor: c.surface, borderColor: error ? c.bad : c.line },
        ]}>
        {prefix ? <Text style={[styles.affix, { color: c.muted }]}>{prefix}</Text> : null}
        <TextInput
          placeholderTextColor={c.muted}
          style={[styles.input, { color: c.text }]}
          {...input}
        />
        {suffix ? <Text style={[styles.affix, { color: c.muted }]}>{suffix}</Text> : null}
      </View>
      {error ? (
        <Text style={[styles.fieldHint, { color: c.bad }]}>{error}</Text>
      ) : hint ? (
        <Text style={[styles.fieldHint, { color: c.muted }]}>{hint}</Text>
      ) : null}
    </View>
  )
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  small,
}: {
  title: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'destructive' | 'plain'
  small?: boolean
}) {
  const c = useColors()
  const bg =
    variant === 'primary' ? c.accent : variant === 'secondary' ? c.accentSoft : variant === 'destructive' ? c.badSoft : 'transparent'
  const fg = variant === 'primary' ? c.accentInk : variant === 'destructive' ? c.bad : c.accent
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        small && styles.buttonSmall,
        { backgroundColor: bg, opacity: pressed ? 0.7 : 1 },
      ]}>
      <Text style={[styles.buttonText, small && styles.buttonTextSmall, { color: fg }]}>{title}</Text>
    </Pressable>
  )
}

export function Empty({ title, body }: { title: string; body: string }) {
  const c = useColors()
  return (
    <View style={styles.empty}>
      <Text style={[styles.heading, { color: c.text, textAlign: 'center' }]}>{title}</Text>
      <Text style={[styles.body, { color: c.muted, textAlign: 'center' }]}>{body}</Text>
    </View>
  )
}

export function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  const c = useColors()
  return (
    <View style={styles.row}>
      <Text style={[styles.body, { color: c.muted }]}>{label}</Text>
      <Text style={[styles.body, { color: color ?? c.text, fontWeight: '600' }]}>{value}</Text>
    </View>
  )
}

export function Divider() {
  const c = useColors()
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: c.line }} />
}

const styles = StyleSheet.create({
  screen: { padding: space.lg, gap: space.lg, paddingBottom: space.xl * 2 },
  card: {
    borderRadius: radius.lg,
    padding: space.lg,
    gap: space.md,
    borderCurve: 'continuous',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: -space.sm,
    paddingHorizontal: space.xs,
  },
  sectionTitle: { fontSize: 13, fontWeight: '600', letterSpacing: 0.4 },
  body: { fontSize: 15, lineHeight: 21 },
  heading: { fontSize: 20, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  stat: {
    flexGrow: 1,
    flexBasis: '45%',
    borderRadius: radius.md,
    padding: space.md,
    alignItems: 'center',
    gap: 2,
    borderCurve: 'continuous',
  },
  statValue: { fontSize: 22, fontWeight: '700', fontVariant: ['tabular-nums'] },
  statLabel: { fontSize: 13 },
  statNote: { fontSize: 11 },
  callout: { borderRadius: radius.md, padding: space.md, gap: space.xs, borderCurve: 'continuous' },
  calloutTitle: { fontSize: 15, fontWeight: '700' },
  segmented: { flexDirection: 'row', borderRadius: 9, padding: 2 },
  segment: { flex: 1, paddingVertical: 7, borderRadius: 7, alignItems: 'center' },
  segmentShadow: Platform.select<ViewStyle>({
    ios: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
    android: { elevation: 1 },
    default: {},
  }),
  segmentText: { fontSize: 14, fontWeight: '600' },
  field: { gap: space.xs },
  fieldLabel: { fontSize: 13, fontWeight: '500' },
  fieldBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: space.md,
    minHeight: 46,
  },
  input: { flex: 1, fontSize: 17, paddingVertical: space.sm },
  affix: { fontSize: 17 },
  fieldHint: { fontSize: 12 },
  button: {
    borderRadius: radius.md,
    paddingVertical: 13,
    paddingHorizontal: space.lg,
    alignItems: 'center',
    borderCurve: 'continuous',
  },
  buttonSmall: { paddingVertical: 8, paddingHorizontal: space.md, borderRadius: 20 },
  buttonText: { fontSize: 17, fontWeight: '600' },
  buttonTextSmall: { fontSize: 14 },
  empty: { paddingVertical: space.xl * 2, paddingHorizontal: space.lg, gap: space.sm, alignItems: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: space.md },
})
