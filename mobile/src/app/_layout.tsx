import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { Platform, Settings } from 'react-native'
import { SCENARIOS, TODAY } from '../e2e/scenarios'
import { E2E } from '../lib/clock'
import { PlanProvider, usePlan } from '../lib/plan'
import { useColors } from '../lib/theme'

SplashScreen.preventAutoHideAsync().catch(() => {})

// The end-to-end tests on iOS start the app with the launch argument
// "-e2eScenario <name>", and iOS puts it in the user defaults. The seed link
// (e2e/seed) works too, but iOS asks the user before it opens a link, and that
// question comes at a different time on each run.
const launchScenario: string | undefined =
  E2E && Platform.OS === 'ios' ? (Settings.get('e2eScenario') ?? undefined) : undefined

function Root() {
  const c = useColors()
  const { ready, loadScenario } = usePlan()
  const [seeded, setSeeded] = useState(!launchScenario)
  // Load the scenario after the app reads its saved state. Otherwise that read
  // can end later, and replace the scenario.
  useEffect(() => {
    if (!ready || seeded || !launchScenario) return
    const make = SCENARIOS[launchScenario]
    if (make) loadScenario(make(), TODAY)
    setSeeded(true)
  }, [ready, seeded, loadScenario])
  useEffect(() => {
    if (ready && seeded) SplashScreen.hideAsync().catch(() => {})
  }, [ready, seeded])
  if (!ready || !seeded) return null

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
        {/* Full-height modals: a part-height form sheet does not scroll its content on iOS, so the keyboard
            and the header hid the first field. */}
        <Stack.Screen name="debt/[id]" options={{ presentation: 'modal', title: 'Debt' }} />
        <Stack.Screen name="methods" options={{ presentation: 'modal', title: 'Payoff methods' }} />
        <Stack.Screen name="about" options={{ presentation: 'modal', title: 'About' }} />
        <Stack.Screen name="reconcile/[month]" options={{ presentation: 'modal', title: 'Reconcile' }} />
        <Stack.Screen name="revise" options={{ presentation: 'modal', title: 'Revise plan' }} />
        <Stack.Screen name="consolidate" options={{ presentation: 'modal', title: 'Consolidate' }} />
        <Stack.Screen name="history/[id]" options={{ presentation: 'modal', title: 'Debt' }} />
        <Stack.Screen name="share" options={{ presentation: 'modal', title: 'Share' }} />
        <Stack.Screen name="journey" options={{ presentation: 'fullScreenModal', headerShown: false, animation: 'fade' }} />
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
