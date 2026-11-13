import { SymbolView } from 'expo-symbols'
import { Pressable, Text } from 'react-native'
import { useColors } from '../lib/theme'

export function HeaderIcon({
  onPress,
  ios,
  android,
  label,
}: {
  onPress: () => void
  ios: 'info.circle' | 'plus'
  android: 'info' | 'add'
  label: string
}) {
  const c = useColors()
  return (
    <Pressable onPress={onPress} hitSlop={10} accessibilityRole="button" accessibilityLabel={label}>
      <SymbolView name={{ ios, android, web: android }} tintColor={c.accent} size={24} />
    </Pressable>
  )
}

export function HeaderText({ onPress, title, bold }: { onPress: () => void; title: string; bold?: boolean }) {
  const c = useColors()
  return (
    <Pressable onPress={onPress} hitSlop={10} accessibilityRole="button">
      <Text style={{ color: c.accent, fontSize: 17, fontWeight: bold ? '600' : '400' }}>{title}</Text>
    </Pressable>
  )
}
