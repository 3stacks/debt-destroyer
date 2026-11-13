import { router, Stack } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { Fragment, useMemo } from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { money } from '../lib/metrics'
import { usePlan } from '../lib/plan'
import { space, useColors } from '../lib/theme'
import { Analysis, monthName, monthShort, planFor, plannedMonth } from '../lib/tracking'
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
  const revised = (tracking?.versions.length ?? 0) > 1

  const revise = () => {
    beginRevision()
    router.push('/revise')
  }
  const confirmEnd = () =>
    Alert.alert(
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
              <HeaderIcon onPress={() => router.push('/about')} ios="info.circle" android="info" label="About" />
            </HeaderActions>
          ),
        }}
      />

      <Card style={{ backgroundColor: heroBg, gap: space.xs }}>
        {debtFree ? (
          <>
            <Text style={styles.heroValue}>Debt free!</Text>
            <Text style={styles.heroLabel}>You paid off every debt in this plan.</Text>
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

      {due.length > 0 ? (
        <Card>
          <Text style={{ color: c.text, fontSize: 17, fontWeight: '700' }}>
            {due.length === 1 ? `${monthName(due[0])} is ready to reconcile` : `${due.length} months to reconcile`}
          </Text>
          <Body muted>Enter what you paid on each debt. The fields start at the planned amounts.</Body>
          <Button
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
              <View style={{ gap: 2 }}>
                <View style={styles.between}>
                  <Text style={{ color: c.text, fontSize: 16, fontWeight: '600', flex: 1 }} numberOfLines={1}>
                    {d.name || 'Unnamed debt'}
                  </Text>
                  <Text style={{ color: actual <= 0 ? c.good : c.text, fontSize: 16, fontWeight: '600' }}>
                    {actual <= 0 ? 'Paid off' : money(actual)}
                  </Text>
                </View>
                {diff !== null && planned !== undefined ? (
                  <Text style={{ color: Math.round(diff) > 0 ? c.bad : Math.round(diff) < 0 ? c.good : c.muted, fontSize: 13 }}>
                    Plan: {money(planned)}
                    {Math.round(diff) === 0 ? ' · on plan' : ` · ${signedMoney(diff)} ${diff > 0 ? 'behind' : 'ahead'}`}
                  </Text>
                ) : null}
              </View>
            </Fragment>
          )
        })}
      </Card>

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
                  <Text style={{ color: isDue ? c.warn : c.muted, fontSize: 13 }}>
                    {r.reconciled
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

      <Button title="Revise plan" variant="secondary" onPress={revise} />
      <Button title="End plan" variant="plain" onPress={confirmEnd} />
    </Screen>
  )
}

const styles = StyleSheet.create({
  heroLabel: { color: '#ffffff', fontSize: 15, opacity: 0.92 },
  heroValue: { color: '#ffffff', fontSize: 34, fontWeight: '800' },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space.md },
  monthRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md },
})
