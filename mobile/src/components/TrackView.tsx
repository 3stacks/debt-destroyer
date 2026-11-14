import { router, Stack } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { Fragment, useMemo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { showAlert } from '../lib/alert'
import { getDebtPayoffOrder, money } from '../lib/metrics'
import { usePlan } from '../lib/plan'
import { space, useColors } from '../lib/theme'
import { Analysis, closedDebts, monthDiff, monthName, monthShort, planFor, plannedMonth, shiftMonth } from '../lib/tracking'
import { HeaderActions, HeaderIcon } from './HeaderButton'
import { Body, Button, Callout, Card, Divider, Row, Screen, SectionHeader, Stat, StatGrid } from './ui'

function signedMoney(v: number): string {
  const r = Math.round(v)
  if (r === 0) return '$0'
  return `${r > 0 ? '+' : '−'}${money(Math.abs(r))}`
}

function behindText(months: number | null, what: string): string {
  if (months === null) return ''
  if (months === 0) return `On track with the ${what}`
  const n = Math.abs(months)
  return `${n} month${n === 1 ? '' : 's'} ${months > 0 ? 'behind' : 'ahead of'} the ${what}`
}

// The Plan tab after the plan starts: status, months to reconcile, deviation
// from the plan, and the actions to revise or end the plan.
export function TrackView({ analysis: a }: { analysis: Analysis }) {
  const c = useColors()
  const { beginRevision, endPlan, tracking, today } = usePlan()

  const currentPlan = useMemo(() => planFor(a.current), [a.current])
  const plannedNow =
    currentPlan.ok && a.lastReconciled ? plannedMonth(a.current, currentPlan.schedule, a.lastReconciled) : null

  const behind = a.monthsBehindPlan
  // A small shortfall may not move the payoff month, so show the balance gap.
  const gap = a.balanceGap !== null && Math.abs(a.balanceGap) >= 1 ? a.balanceGap : 0
  const slipping = behind !== null && (behind > 0 || (behind === 0 && gap > 0))
  // Fixed dark tones, so that white text stays readable in both themes.
  const heroBg = behind === null ? '#b91c1c' : slipping ? '#b45309' : '#15803d'
  const balanceNow = Object.values(a.balances).reduce((x, y) => x + y, 0)
  const debtFree = balanceNow <= 0
  const due = a.dueMonths
  const toCheck = a.rows.filter(r => r.version === a.current && r.reconciled && r.missing.length > 0).map(r => r.month)
  const revised = (tracking?.versions.length ?? 0) > 1
  const closed = tracking ? closedDebts(tracking, a) : []

  // Progress and the countdown. Payments to go count from the month after the
  // last reconciled month to the projected payoff month.
  const progress = a.startTotal > 0 ? Math.max(0, Math.min(1, 1 - balanceNow / a.startTotal)) : 0
  const after = a.lastReconciled ?? shiftMonth(a.current.startMonth, -1)
  const paymentsLeft = a.projectedPayoff ? Math.max(0, monthDiff(after, a.projectedPayoff)) : null
  const next = a.forecast.ok ? getDebtPayoffOrder(a.forecast.schedule, a.forecastDebts)[0] : undefined
  const countdown = !debtFree && paymentsLeft !== null && paymentsLeft <= 12

  const revise = () => {
    beginRevision()
    router.push('/revise')
  }
  const confirmEnd = () =>
    showAlert(
      'End this plan?',
      'This deletes the plan versions and every reconciled month. Your debts stay, so you can start a new plan.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'End plan', style: 'destructive', onPress: endPlan },
      ],
    )

  const months = [...a.rows].reverse()

  return (
    <Screen>
      <Stack.Screen
        options={{
          headerRight: () => (
            <HeaderActions>
              <HeaderIcon onPress={() => router.push('/about')} ios="info.circle" android="info" label="About" testID="about-button" />
            </HeaderActions>
          ),
        }}
      />

      <Card style={{ backgroundColor: heroBg, gap: space.xs }}>
        {debtFree ? (
          <>
            <Text style={styles.heroValue}>Debt free!</Text>
            <Text style={styles.heroLabel}>You paid off every debt in this plan.</Text>
            <Pressable
              onPress={() => router.push('/journey')}
              style={({ pressed }) => [styles.heroButton, pressed && { opacity: 0.8 }]}
              accessibilityRole="button">
              <Text style={styles.heroButtonText}>Play your journey</Text>
            </Pressable>
          </>
        ) : a.projectedPayoff ? (
          <>
            <Text style={styles.heroLabel}>On your payments so far, debt free by</Text>
            <Text style={styles.heroValue}>{monthShort(a.projectedPayoff)}</Text>
            <Text style={styles.heroLabel}>
              {behind === 0 && gap !== 0
                ? `Same month as the plan, but ${money(Math.abs(gap))} ${gap > 0 ? 'behind' : 'ahead of'} the plan balance`
                : behindText(behind, 'plan')}
            </Text>
            {revised && a.monthsBehindOriginal !== null ? (
              <Text style={styles.heroLabel}>{behindText(a.monthsBehindOriginal, 'original plan')}</Text>
            ) : null}
          </>
        ) : (
          <>
            <Text style={styles.heroValue}>Off course</Text>
            <Text style={styles.heroLabel}>At these balances the repayments do not cover the interest. Revise the plan.</Text>
          </>
        )}
      </Card>

      {!debtFree ? (
        <Card style={{ gap: space.sm }}>
          <View style={styles.between}>
            <Text style={{ color: c.text, fontSize: 17, fontWeight: '700' }}>{Math.round(progress * 100)}% paid off</Text>
            <Text style={{ color: c.muted, fontSize: 15 }}>{money(balanceNow)} to go</Text>
          </View>
          <View style={{ height: 12, borderRadius: 6, backgroundColor: c.surface2, overflow: 'hidden' }}>
            <View style={{ width: `${progress * 100}%`, height: '100%', backgroundColor: c.good }} />
          </View>
        </Card>
      ) : null}

      {countdown ? (
        <Card style={{ backgroundColor: c.accent, alignItems: 'center', gap: 2 }}>
          <Text style={{ color: c.accentInk, fontSize: 15, opacity: 0.9 }}>The finish line is close</Text>
          <Text style={{ color: c.accentInk, fontSize: 56, fontWeight: '800', fontVariant: ['tabular-nums'] }}>{paymentsLeft}</Text>
          <Text style={{ color: c.accentInk, fontSize: 17, fontWeight: '600' }}>
            {paymentsLeft === 1 ? 'payment to go' : 'payments to go'}
          </Text>
          {next && next.month > 0 && a.forecastDebts.length > 1 ? (
            <Text style={{ color: c.accentInk, fontSize: 14, opacity: 0.9, marginTop: space.xs, textAlign: 'center' }}>
              Next to fall: {next.debt.name || 'a debt'}, in {next.month} {next.month === 1 ? 'payment' : 'payments'}
            </Text>
          ) : null}
        </Card>
      ) : null}

      <View style={{ flexDirection: 'row', gap: space.md }}>
        <View style={{ flex: 1 }}>
          <Button testID="track-journey" small variant="secondary" title="Play the journey" onPress={() => router.push('/journey')} />
        </View>
        <View style={{ flex: 1 }}>
          <Button testID="track-share" small variant="secondary" title="Share progress" onPress={() => router.push('/share')} />
        </View>
      </View>

      {toCheck.length > 0 ? (
        <Card>
          <Text style={{ color: c.text, fontSize: 17, fontWeight: '700' }}>Check {monthName(toCheck[0])}</Text>
          <Body muted>A debt in this month has no amount yet. Enter what you actually paid on it.</Body>
          <Button
            title={`Check ${monthName(toCheck[0])}`}
            onPress={() => router.push({ pathname: '/reconcile/[month]', params: { month: toCheck[0] } })}
          />
        </Card>
      ) : null}

      {due.length > 0 ? (
        <Card>
          <Text style={{ color: c.text, fontSize: 17, fontWeight: '700' }}>
            {due.length === 1 ? `${monthName(due[0])} is ready to reconcile` : `${due.length} months to reconcile`}
          </Text>
          <Body muted>Enter the amount that you actually paid on each debt.</Body>
          <Button
            testID="track-reconcile"
            title={`Reconcile ${monthName(due[0])}`}
            onPress={() => router.push({ pathname: '/reconcile/[month]', params: { month: due[0] } })}
          />
        </Card>
      ) : null}

      <StatGrid>
        <Stat value={money(a.totalActualPaid)} label="Paid so far" />
        <Stat
          value={signedMoney(a.totalVariance)}
          label={Math.round(a.totalVariance) === 0 ? 'Versus the plan' : a.totalVariance < 0 ? 'Under the plan' : 'Over the plan'}
          tone={Math.round(a.totalVariance) === 0 ? 'neutral' : a.totalVariance < 0 ? 'bad' : 'good'}
        />
        <Stat value={money(balanceNow)} label="Balance now" />
        <Stat value={a.plannedPayoff ? monthShort(a.plannedPayoff) : '—'} label="Plan payoff date" tone="info" />
      </StatGrid>

      <SectionHeader title={a.lastReconciled ? `Debts after ${monthShort(a.lastReconciled)}` : 'Debts'} />
      <Card style={{ gap: space.sm }}>
        {a.current.debts.map((d, i) => {
          const actual = a.balances[d.id] ?? 0
          const planned = plannedNow?.[d.id]?.balance
          const diff = planned === undefined ? null : actual - planned
          return (
            <Fragment key={d.id}>
              {i > 0 ? <Divider /> : null}
              <Pressable
                testID={`debt-row-${d.id}`}
                onPress={() => router.push({ pathname: '/history/[id]', params: { id: d.id } })}
                style={({ pressed }) => [{ gap: 2 }, pressed && { opacity: 0.6 }]}
                accessibilityRole="button">
                <View style={styles.between}>
                  <Text style={{ color: c.text, fontSize: 16, fontWeight: '600', flex: 1 }} numberOfLines={1}>
                    {d.name || 'Unnamed debt'}
                  </Text>
                  <Text style={{ color: actual <= 0 ? c.good : c.text, fontSize: 16, fontWeight: '600' }}>
                    {actual <= 0 ? 'Paid off' : money(actual)}
                  </Text>
                  <SymbolView
                    name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                    tintColor={c.muted}
                    size={14}
                  />
                </View>
                {diff !== null && planned !== undefined ? (
                  <Text style={{ color: Math.round(diff) > 0 ? c.bad : Math.round(diff) < 0 ? c.good : c.muted, fontSize: 13 }}>
                    Plan: {money(planned)}
                    {Math.round(diff) === 0 ? ' · on plan' : ` · ${signedMoney(diff)} ${diff > 0 ? 'behind' : 'ahead'}`}
                  </Text>
                ) : null}
              </Pressable>
            </Fragment>
          )
        })}
      </Card>

      {closed.length > 0 ? (
        <>
          <SectionHeader title="Closed and consolidated debts" />
          <Card style={{ paddingVertical: space.xs, gap: 0 }}>
            {closed.map((d, i) => (
              <Fragment key={d.id}>
                {i > 0 ? <Divider /> : null}
                <Pressable
                  testID={`closed-row-${d.id}`}
                  onPress={() => router.push({ pathname: '/history/[id]', params: { id: d.id } })}
                  style={({ pressed }) => [styles.monthRow, pressed && { opacity: 0.6 }]}
                  accessibilityRole="button">
                  <Text style={{ color: c.text, fontSize: 16, flex: 1 }} numberOfLines={1}>
                    {d.name || 'Unnamed debt'}
                  </Text>
                  <Text style={{ color: c.muted, fontSize: 13 }}>View history</Text>
                  <SymbolView
                    name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                    tintColor={c.muted}
                    size={14}
                  />
                </Pressable>
              </Fragment>
            ))}
          </Card>
        </>
      ) : null}

      <SectionHeader title="Months" />
      <Card style={{ paddingVertical: space.xs, gap: 0 }}>
        {months.map((r, i) => {
          const upcoming = !r.reconciled && r.month > today
          const isDue = !r.reconciled && !upcoming && r.version === a.current
          return (
            <Fragment key={r.month}>
              {i > 0 ? <Divider /> : null}
              <Pressable
                onPress={() => router.push({ pathname: '/reconcile/[month]', params: { month: r.month } })}
                style={({ pressed }) => [styles.monthRow, pressed && { opacity: 0.6 }]}
                accessibilityRole="button">
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ color: c.text, fontSize: 16, fontWeight: '600' }}>{monthName(r.month)}</Text>
                  <Text style={{ color: isDue || r.missing.length > 0 ? c.warn : c.muted, fontSize: 13 }}>
                    {r.reconciled && r.missing.length > 0
                      ? 'A debt has no amount: tap to add it'
                      : r.reconciled
                      ? `Paid ${money(r.actualPaid ?? 0)} of ${money(r.plannedPaid)} planned`
                      : upcoming
                        ? 'Upcoming'
                        : isDue
                          ? 'Not reconciled'
                          : 'Not reconciled (earlier plan version)'}
                  </Text>
                </View>
                {r.variance !== null ? (
                  <Text
                    style={{
                      color: Math.round(r.variance) < 0 ? c.bad : Math.round(r.variance) > 0 ? c.good : c.muted,
                      fontSize: 15,
                      fontWeight: '600',
                    }}>
                    {Math.round(r.variance) === 0 ? 'On plan' : signedMoney(r.variance)}
                  </Text>
                ) : null}
                <SymbolView
                  name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                  tintColor={c.muted}
                  size={14}
                />
              </Pressable>
            </Fragment>
          )
        })}
      </Card>

      {revised ? (
        <>
          <SectionHeader title="Plan history" />
          <Card style={{ gap: space.sm }}>
            {tracking!.versions.map((v, i) => (
              <Row
                key={v.id}
                label={i === 0 ? `Original, from ${monthShort(v.startMonth)}` : `Revision ${i}, from ${monthShort(v.startMonth)}`}
                value={`${money(v.debts.reduce((x, d) => x + (Number(d.amount) || 0), 0))}`}
              />
            ))}
            {a.originalPayoff ? <Body muted>The original plan ended in {monthShort(a.originalPayoff)}.</Body> : null}
          </Card>
        </>
      ) : null}

      {slipping ? (
        <Callout tone="warn" title="Behind the plan">
          Pay more next month to catch up, or revise the plan to match what you can pay.
        </Callout>
      ) : null}

      <Button testID="track-revise" title="Revise plan" variant="secondary" onPress={revise} />
      <Button title="End plan" variant="plain" onPress={confirmEnd} />
    </Screen>
  )
}

const styles = StyleSheet.create({
  heroLabel: { color: '#ffffff', fontSize: 15, opacity: 0.92 },
  heroValue: { color: '#ffffff', fontSize: 34, fontWeight: '800' },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space.md },
  heroButton: {
    marginTop: space.sm,
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: space.lg,
  },
  heroButtonText: { color: '#15803d', fontSize: 15, fontWeight: '700' },
  monthRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md },
})
