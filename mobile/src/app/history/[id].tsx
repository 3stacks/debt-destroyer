import { router, Stack, useLocalSearchParams } from 'expo-router'
import { Fragment, useMemo } from 'react'
import { Pressable, Text, View } from 'react-native'
import { Body, Button, Card, Divider, Row, Screen, SectionHeader } from '../../components/ui'
import { money } from '../../lib/metrics'
import { usePlan } from '../../lib/plan'
import { space, useColors } from '../../lib/theme'
import { debtHistory, monthShort } from '../../lib/tracking'

function ProgressBar({ value, color, track }: { value: number; color: string; track: string }) {
  return (
    <View style={{ height: 10, borderRadius: 5, backgroundColor: track, overflow: 'hidden' }}>
      <View style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, height: '100%', backgroundColor: color }} />
    </View>
  )
}

// One debt in a started plan: its terms, its timeline and each month.
export default function DebtHistoryScreen() {
  const c = useColors()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { tracking, analysis, beginRevision } = usePlan()
  const h = useMemo(() => (tracking && analysis ? debtHistory(tracking, analysis, id) : null), [tracking, analysis, id])

  if (!h) {
    return (
      <Screen>
        <Body muted>This debt is not in the plan.</Body>
      </Screen>
    )
  }

  const paidOff = h.balance <= 0
  const progress = h.opening > 0 ? 1 - h.balance / h.opening : 1
  const months = [...h.months].reverse()

  const revise = () => {
    beginRevision()
    router.replace('/revise')
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: h.debt.name || 'Debt' }} />

      <Card>
        <Text style={{ color: c.muted, fontSize: 15 }}>
          {h.mergedInto ? 'Consolidated' : paidOff ? 'Paid off' : 'Balance now'}
        </Text>
        <Text style={{ color: paidOff || h.mergedInto ? c.good : c.text, fontSize: 34, fontWeight: '800' }}>
          {h.mergedInto ? h.mergedInto.name || 'New loan' : paidOff ? 'Done!' : money(h.balance)}
        </Text>
        {!h.mergedInto ? (
          <>
            <ProgressBar value={progress} color={c.good} track={c.surface2} />
            <Text style={{ color: c.muted, fontSize: 13 }}>
              {Math.round(progress * 100)}% of {money(h.opening)} paid off
            </Text>
          </>
        ) : null}
      </Card>

      <Card style={{ gap: space.sm }}>
        <Row label="Interest rate" value={`${h.debt.rate}%`} />
        <Row label="Minimum repayment" value={`${money(Number(h.debt.repayment) || 0)}/mo`} />
        <Row label="Paid so far" value={money(h.paidTotal)} />
        <Row label="Starting balance" value={money(h.opening)} />
      </Card>

      {h.mergedInto ? (
        <Button
          title={`Open ${h.mergedInto.name || 'the new loan'}`}
          variant="secondary"
          onPress={() => router.setParams({ id: h.mergedInto!.id })}
        />
      ) : null}

      {h.mergedFrom.length > 0 ? (
        <>
          <SectionHeader title="This loan combines" />
          <Card style={{ paddingVertical: space.xs, gap: 0 }}>
            {h.mergedFrom.map((d, i) => (
              <Fragment key={d.id}>
                {i > 0 ? <Divider /> : null}
                <Pressable onPress={() => router.setParams({ id: d.id })} style={{ paddingVertical: space.md }}>
                  <Text style={{ color: c.accent, fontSize: 16, fontWeight: '600' }}>{d.name || 'Unnamed debt'}</Text>
                </Pressable>
              </Fragment>
            ))}
          </Card>
        </>
      ) : null}

      <SectionHeader title="Timeline" />
      <Card style={{ gap: space.md }}>
        {h.events.map((e, i) => (
          <View key={`${e.kind}-${e.month}-${i}`} style={{ flexDirection: 'row', gap: space.md }}>
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                marginTop: 6,
                backgroundColor: e.kind === 'paid-off' ? c.good : e.kind === 'rate' || e.kind === 'consolidated' ? c.warn : c.accent,
              }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.muted, fontSize: 13 }}>{monthShort(e.month)}</Text>
              <Text style={{ color: c.text, fontSize: 15 }}>{e.text}</Text>
            </View>
          </View>
        ))}
      </Card>

      {months.length > 0 ? (
        <>
          <SectionHeader title="Months" />
          <Card style={{ paddingVertical: space.xs, gap: 0 }}>
            {months.map((m, i) => (
              <Fragment key={m.month}>
                {i > 0 ? <Divider /> : null}
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: space.md, gap: space.md }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: c.text, fontSize: 15, fontWeight: '600' }}>{monthShort(m.month)}</Text>
                    <Text style={{ color: c.muted, fontSize: 13 }}>
                      {m.paid === null ? `Planned ${money(m.planned)}` : `Paid ${money(m.paid)} of ${money(m.planned)} planned`}
                    </Text>
                  </View>
                  <Text style={{ color: m.balance === 0 ? c.good : c.text, fontSize: 15, fontVariant: ['tabular-nums'] }}>
                    {m.balance === null ? '—' : m.balance === 0 ? 'Paid off' : money(m.balance)}
                  </Text>
                </View>
              </Fragment>
            ))}
          </Card>
        </>
      ) : null}

      {h.inCurrentPlan ? (
        <>
          <Body muted>Refinanced, or consolidated with another debt? Revise the plan. Your history stays.</Body>
          <Button title="Refinance or consolidate" variant="secondary" onPress={revise} />
        </>
      ) : null}
    </Screen>
  )
}
