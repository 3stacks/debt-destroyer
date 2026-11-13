// The app's clock. The end-to-end tests set a fixed month, so that the month
// names in the tests do not change with the real date. See src/app/e2e/seed.tsx.

let fixed: Date | null = null

export function now(): Date {
  return fixed ? new Date(fixed) : new Date()
}

/** Fix the clock to the middle of a month ("YYYY-MM"), or clear it with null. */
export function setClock(month: string | null): void {
  if (!month) {
    fixed = null
    return
  }
  const [y, m] = month.split('-').map(Number)
  fixed = new Date(y, m - 1, 15, 12)
}

/** True in a build for the end-to-end tests (EXPO_PUBLIC_E2E=1). */
export const E2E = process.env.EXPO_PUBLIC_E2E === '1'
