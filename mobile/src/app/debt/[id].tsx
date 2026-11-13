import { router, Stack, useLocalSearchParams } from 'expo-router'
import { useEffect, useRef } from 'react'
import { Alert, Pressable, ScrollView, Text, View } from 'react-native'
import { Body, Button, Field } from '../../components/ui'
import { calculateMinimumMonthlyRepayment } from '../../../../src/utils'
import { money } from '../../lib/metrics'
import { Debt } from '../../lib/metrics'
import { usePlan } from '../../lib/plan'
import { space, useColors } from '../../lib/theme'

function numberError(value: string, { positive }: { positive?: boolean } = {}): string | undefined {
  if (value.trim() === '') return undefined
  const n = Number(value)
  if (Number.isNaN(n)) return 'Enter a number'
  if (positive && n <= 0) return 'Enter an amount more than 0'
  if (n < 0) return 'Enter 0 or more'
  return undefined
}

const clean = (v: string) => v.replace(/[^0-9.]/g, '')

export default function DebtSheet() {
  const c = useColors()
  const { id, isNew } = useLocalSearchParams<{ id: string; isNew?: string }>()
  const { debts, updateDebt, removeDebt } = usePlan()
  const debt = debts.find(d => d.id === id)

  // Remove a new debt that the user closes with no details.
  const latest = useRef<Debt | undefined>(debt)
  latest.current = debt
  useEffect(
    () => () => {
      const d = latest.current
      if (isNew && d && !d.name && !d.amount && !d.rate && !d.repayment) removeDebt(d.id)
    },
    [isNew, removeDebt],
  )

  if (!debt) {
    return (
      <View style={{ padding: space.lg }}>
        <Body muted>This debt no longer exists.</Body>
      </View>
    )
  }

  const set = (patch: Partial<Debt>) => updateDebt(debt.id, patch)
  const amount = Number(debt.amount)
  const rate = Number(debt.rate)
  const suggested =
    amount > 0 && rate >= 0 && debt.rate.trim() !== '' ? calculateMinimumMonthlyRepayment(rate, amount) : null
  const interest = amount > 0 && rate >= 0 ? (amount * rate) / 1200 : 0
  const repayment = Number(debt.repayment)
  const tooLow = debt.repayment.trim() !== '' && interest > 0 && repayment <= interest

  const confirmDelete = () => {
    Alert.alert('Delete this debt?', debt.name || undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          removeDebt(debt.id)
          router.back()
        },
      },
    ])
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{ padding: space.lg, gap: space.lg }}
      keyboardShouldPersistTaps="handled">
      <Stack.Screen
        options={{
          title: isNew ? 'New debt' : debt.name || 'Debt',
          headerRight: () => (
            <Pressable onPress={() => router.back()} hitSlop={10} accessibilityRole="button">
              <Text style={{ color: c.accent, fontSize: 17, fontWeight: '600' }}>Done</Text>
            </Pressable>
          ),
        }}
      />
      <Field
        label="Name"
        value={debt.name}
        placeholder="e.g. Credit card"
        onChangeText={name => set({ name })}
        autoFocus={!!isNew}
        returnKeyType="next"
      />
      <Field
        label="Balance"
        prefix="$"
        value={debt.amount}
        placeholder="0"
        keyboardType="decimal-pad"
        onChangeText={v => set({ amount: clean(v) })}
        error={numberError(debt.amount, { positive: true })}
      />
      <Field
        label="Interest rate"
        suffix="% p.a."
        value={debt.rate}
        placeholder="0"
        keyboardType="decimal-pad"
        onChangeText={v => set({ rate: clean(v) })}
        error={numberError(debt.rate)}
      />
      <Field
        label="Minimum monthly repayment"
        prefix="$"
        value={debt.repayment}
        placeholder="0"
        keyboardType="decimal-pad"
        onChangeText={v => set({ repayment: clean(v) })}
        error={
          numberError(debt.repayment) ??
          (tooLow ? `This does not cover the ${money(interest)} monthly interest` : undefined)
        }
        hint={suggested !== null ? `A typical minimum is about $${suggested.toFixed(2)}` : undefined}
      />
      {suggested !== null && debt.repayment.trim() === '' ? (
        <Button small variant="secondary" title={`Use $${suggested.toFixed(2)}`} onPress={() => set({ repayment: suggested.toFixed(2) })} />
      ) : null}
      <View style={{ height: space.md }} />
      <Button title="Delete debt" variant="destructive" onPress={confirmDelete} />
    </ScrollView>
  )
}
