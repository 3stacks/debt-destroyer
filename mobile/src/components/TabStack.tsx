import { Stack } from 'expo-router'
import { useColors } from '../lib/theme'

// Each tab has its own stack, so that it gets a native large title.
export function TabStack({ title }: { title: string }) {
  const c = useColors()
  return (
    <Stack
      screenOptions={{
        headerLargeTitle: true,
        headerTransparent: process.env.EXPO_OS === 'ios',
        headerBlurEffect: 'systemMaterial',
        headerLargeStyle: { backgroundColor: 'transparent' },
        headerShadowVisible: false,
        headerTintColor: c.accent,
        headerTitleStyle: { color: c.text },
        headerLargeTitleStyle: { color: c.text },
        headerStyle: process.env.EXPO_OS === 'ios' ? undefined : { backgroundColor: c.bg },
        contentStyle: { backgroundColor: c.bg },
      }}>
      <Stack.Screen name="index" options={{ title }} />
    </Stack>
  )
}
