import { router, Stack, useLocalSearchParams } from 'expo-router'
import { useMemo, useState } from 'react'
import { Alert, ScrollView, Text, View } from 'react-native'
import { HeaderText } from '../../components/HeaderButton'
import { Body, Button, Card, Divider, Field, Row } from '../../components/ui'
import { money } from '../../lib/metrics'
import { usePlan } from '../../lib/plan'
import { space, useColors } from '../../lib/theme'
import { DebtEntry, monthName, planFor, plannedMonth, versionFor } from '../../lib/tracking'

const clean = (v: string) => v.replace(/[^0-9.]/g, '')

export default function ReconcileSheet() {
  const c = useColors()
  const { month } = useLocalSearchParams<{ month: string }>()
  const { tracking, saveReconciliation, deleteReconciliation } = usePlan()

  const version = tracking ? versionFor(tracking, month) : undefined
  const planned = useMemo(() => {
    if (!version) return {}
    const p = planFor(version)
    return p.ok ? plannedMonth(version, p.schedule, month) : {}
  }, [version, month])
  const existing = tracking?.recs[month]

  const [entries, setEntries] = useState<Record<string, DebtEntry>>(() => {
    if (existing) return existing.entries
    return Object.fromEntries(
      (version?.debts ?? []).map(d => [d.id, { paid: (planned[d.id]?.paid ?? 0).toFixed(2) }]),
    )
  })

  if (!tracking || !version) {
    return (
      <View style={{ padding: space.lg }}>
        <Body muted>There is no plan for this month.</Body>
      </View>
    )
  }

  const set = (id: string, patch: Partial<DebtEntry>) =>
    setEntries(e => ({ ...e, [id]: { ...(e[id] ?? { paid: '' }), ...patch } }))

  const plannedTotal = version.debts.reduce((a, d) => a + (planned[d.id]?.paid ?? 0), 0)
  const paidTotal = version.debts.reduce((a, d) => a + (Number(entries[d.id]?.paid) || 0), 0)
  const variance = paidTotal - plannedTotal

  const save = () => {
    saveReconciliation(month, entries)
    router.back()
  }
  const remove = () =>
    Alert.alert('Delete this reconciliation?', monthName(month), [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteReconciliation(month)
          router.back()
        },
      },
    ])

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{ padding: space.lg, gap: space.lg }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive">
      <Stack.Screen
        options={{
          title: monthName(month),
          headerLeft: () => <HeaderText title="Cancel" onPress={() => router.back()} />,
          headerRight: () => <HeaderText title="Save" bold onPress={save} />,
        }}
      />
      <Body muted>
        Enter what you paid on each debt in {monthName(month)}. Each field starts at the planned amount.
      </Body>

      {version.debts.map(d => {
        const p = planned[d.id]
        const entry = entries[d.id] ?? { paid: '' }
        return (
          <Card key={d.id}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: c.text, fontSize: 17, fontWeight: '600', flex: 1 }} numberOfLines={1}>
                {d.name || 'Unnamed debt'}
              </Text>
              <Text style={{ color: c.muted, fontSize: 15 }}>Plan: ${(p?.paid ?? 0).toFixed(2)}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: space.md }}>
              <View style={{ flex: 1 }}>
                <Field
                  label="Paid"
                  prefix="$"
                  value={entry.paid}
                  placeholder="0"
                  keyboardType="decimal-pad"
                  selectTextOnFocus
                  onChangeText={v => set(d.id, { paid: clean(v) })}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Field
                  label="Statement balance"
                  prefix="$"
                  value={entry.balance ?? ''}
                  placeholder="Optional"
                  keyboardType="decimal-pad"
                  onChangeText={v => set(d.id, { balance: clean(v) || undefined })}
                />
              </View>
            </View>
          </Card>
        )
      })}

      <Card style={{ gap: space.sm }}>
        <Row label="Planned" value={money(plannedTotal)} />
        <Row label="Paid" value={money(paidTotal)} />
        <Divider />
        <Row
          label={variance < 0 ? 'Under the plan' : 'Over the plan'}
          value={`${variance < 0 ? '−' : '+'}${money(Math.abs(variance))}`}
          color={Math.round(variance) < 0 ? c.bad : Math.round(variance) > 0 ? c.good : c.muted}
        />
      </Card>
      <Body muted>
        Leave the statement balance blank to calculate it from the payment and the interest rate. Enter it when your
        statement shows a different balance, for example after fees or new purchases.
      </Body>

      <Button title="Save" onPress={save} />
      {existing ? <Button title="Delete reconciliation" variant="destructive" onPress={remove} /> : null}
    </ScrollView>
  )
}
