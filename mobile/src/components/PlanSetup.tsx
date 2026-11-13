import { router } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { Fragment } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { DEBT_PAYOFF_METHODS, isDebtComplete, money, parseMoney } from '../lib/metrics'
import { usePlan } from '../lib/plan'
import { space, useColors } from '../lib/theme'
import { Body, Button, Card, Divider, Field, SectionHeader, Segmented } from './ui'

const METHODS = [
  { value: DEBT_PAYOFF_METHODS.SNOWBALL, label: 'Snowball' },
  { value: DEBT_PAYOFF_METHODS.AVALANCHE, label: 'Avalanche' },
]

export function useAddDebt() {
  const { addDebt } = usePlan()
  return () => {
    const id = addDebt()
    router.push({ pathname: '/debt/[id]', params: { id, isNew: '1' } })
  }
}

// The editor for the draft plan: the debts, the method and the extra amount.
// The Plan tab uses it before a plan starts, and the revise screen uses it.
export function PlanSetup() {
  const c = useColors()
  const plan = usePlan()
  const addDebt = useAddDebt()
  const { debts, method, extra } = plan

  return (
    <>
      <SectionHeader title="Debts" />
      <Card style={{ paddingVertical: space.xs, gap: 0 }}>
        {debts.length === 0 ? (
          <View style={{ paddingVertical: space.lg, gap: space.sm }}>
            <Text style={[styles.rowTitle, { color: c.text, textAlign: 'center' }]}>No debts yet</Text>
            <Body muted style={{ textAlign: 'center' }}>
              Add each debt with its balance, interest rate and minimum monthly repayment.
            </Body>
          </View>
        ) : (
          debts.map((d, i) => {
            const complete = isDebtComplete(d)
            return (
              <Fragment key={d.id}>
                {i > 0 ? <Divider /> : null}
                <Pressable
                  testID={`setup-debt-${d.id}`}
                  onPress={() => router.push({ pathname: '/debt/[id]', params: { id: d.id } })}
                  style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
                  accessibilityRole="button">
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[styles.rowTitle, { color: c.text }]} numberOfLines={1}>
                      {d.name || 'Unnamed debt'}
                    </Text>
                    <Text style={{ color: complete ? c.muted : c.warn, fontSize: 13 }}>
                      {complete
                        ? `${d.rate}% · ${money(parseMoney(d.repayment))}/mo minimum`
                        : 'Incomplete: add the missing details'}
                    </Text>
                  </View>
                  <Text style={[styles.rowAmount, { color: c.text }]}>{money(parseMoney(d.amount))}</Text>
                  <SymbolView
                    name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                    tintColor={c.muted}
                    size={14}
                  />
                </Pressable>
              </Fragment>
            )
          })
        )}
      </Card>
      <Button testID="plan-add-debt" title="Add debt" variant="secondary" onPress={addDebt} />

      <SectionHeader title="Payoff method" />
      <Card>
        <Segmented value={method} options={METHODS} onChange={plan.setMethod} />
        <Body muted>
          {method === DEBT_PAYOFF_METHODS.SNOWBALL
            ? 'Pay the smallest balance first. Each closed account builds momentum.'
            : 'Pay the highest interest rate first. This costs the least interest.'}
        </Body>
        <Pressable onPress={() => router.push('/methods')} hitSlop={8}>
          <Text style={{ color: c.accent, fontSize: 15, fontWeight: '600' }}>Which method is right for me?</Text>
        </Pressable>
      </Card>

      <SectionHeader title="Extra each month" />
      <Card>
        <Field
          label="Extra contribution"
          testID="plan-extra"
          prefix="$"
          value={extra === '0' ? '' : extra}
          placeholder="0"
          onChangeText={v => plan.setExtra(v.replace(/[^0-9.]/g, ''))}
          keyboardType="decimal-pad"
          hint="How much more than the minimums can you pay each month?"
        />
      </Card>
    </>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md },
  rowTitle: { fontSize: 17, fontWeight: '600' },
  rowAmount: { fontSize: 17, fontWeight: '600', fontVariant: ['tabular-nums'] },
})
