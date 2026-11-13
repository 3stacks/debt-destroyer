import { SymbolView } from 'expo-symbols'
import { ReactNode } from 'react'
import { Pressable, Text, View } from 'react-native'
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

// Header buttons on the right, with space between them. Android aligns the
// title to the left, so a button on the left touches the title.
export function HeaderActions({ children }: { children: ReactNode }) {
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20, paddingHorizontal: 4 }}>{children}</View>
}
