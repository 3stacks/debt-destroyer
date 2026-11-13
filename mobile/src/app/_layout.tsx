import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { PlanProvider, usePlan } from '../lib/plan'
import { useColors } from '../lib/theme'

SplashScreen.preventAutoHideAsync().catch(() => {})

function Root() {
  const c = useColors()
  const { ready } = usePlan()
  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {})
  }, [ready])
  if (!ready) return null

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerTintColor: c.accent,
          headerTitleStyle: { color: c.text },
          headerStyle: { backgroundColor: c.bg },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: c.bg },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="debt/[id]"
          options={{ presentation: 'formSheet', title: 'Debt', sheetAllowedDetents: [0.75, 1], sheetGrabberVisible: true }}
        />
        <Stack.Screen name="methods" options={{ presentation: 'formSheet', title: 'Payoff methods', sheetGrabberVisible: true, sheetAllowedDetents: [0.6, 1] }} />
        <Stack.Screen name="about" options={{ presentation: 'modal', title: 'About' }} />
        <Stack.Screen name="reconcile/[month]" options={{ presentation: 'modal', title: 'Reconcile' }} />
        <Stack.Screen name="revise" options={{ presentation: 'modal', title: 'Revise plan' }} />
      </Stack>
    </>
  )
}

export default function Layout() {
  return (
    <PlanProvider>
      <Root />
    </PlanProvider>
  )
}
