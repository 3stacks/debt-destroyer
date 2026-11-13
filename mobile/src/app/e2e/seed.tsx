import { router, useLocalSearchParams } from 'expo-router'
import { useEffect } from 'react'
import { Body, Screen } from '../../components/ui'
import { SCENARIOS, TODAY } from '../../e2e/scenarios'
import { E2E } from '../../lib/clock'
import { usePlan } from '../../lib/plan'

// Load a test scenario: debtdestroyer://e2e/seed?scenario=<name>. This only
// works in a build for the end-to-end tests (EXPO_PUBLIC_E2E=1).
export default function Seed() {
  const { scenario } = useLocalSearchParams<{ scenario?: string }>()
  const { loadScenario } = usePlan()
  const make = scenario ? SCENARIOS[scenario] : undefined

  useEffect(() => {
    if (!E2E || !make) return
    loadScenario(make(), TODAY)
    if (router.canDismiss()) router.dismissAll()
    router.replace('/')
  }, [make, loadScenario])

  return (
    <Screen>
      <Body muted>
        {!E2E
          ? 'Test scenarios are not available in this build.'
          : make
            ? 'Loading the scenario.'
            : `Unknown scenario. Use one of: ${Object.keys(SCENARIOS).join(', ')}.`}
      </Body>
    </Screen>
  )
}
