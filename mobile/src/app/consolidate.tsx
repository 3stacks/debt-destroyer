import { router, Stack } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { Fragment, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { HeaderText } from '../components/HeaderButton'
import { Body, Button, Card, Divider, Field, Screen, SectionHeader } from '../components/ui'
import { money, parseMoney } from '../lib/metrics'
import { usePlan } from '../lib/plan'
import { space, useColors } from '../lib/theme'

const clean = (v: string) => v.replace(/[^0-9.]/g, '')

// Roll several debts of the draft into one new loan. The revise screen saves it.
export default function Consolidate() {
  const c = useColors()
  const { debts, consolidate } = usePlan()
  const [picked, setPicked] = useState<string[]>([])
  const [name, setName] = useState('Consolidation loan')
  const [rate, setRate] = useState('')
  const [repayment, setRepayment] = useState('')
  const [amount, setAmount] = useState<string | null>(null)

  const sum = debts.filter(d => picked.includes(d.id)).reduce((a, d) => a + parseMoney(d.amount), 0)
  const balance = amount ?? (sum > 0 ? sum.toFixed(2) : '')
  const ready = picked.length >= 2 && parseMoney(balance) > 0 && rate.trim() !== '' && repayment.trim() !== ''

  const toggle = (id: string) => {
    setPicked(p => (p.includes(id) ? p.filter(x => x !== id) : [...p, id]))
    setAmount(null)
  }
  const save = () => {
    if (!ready) return
    consolidate(picked, { name: name.trim() || 'Consolidation loan', amount: balance, rate, repayment })
    router.back()
  }

  return (
    <Screen>
      <Stack.Screen
        options={{
          headerLeft: process.env.EXPO_OS === 'ios' ? () => <HeaderText title="Cancel" onPress={() => router.back()} /> : undefined,
          headerRight: ready ? () => <HeaderText title="Done" bold onPress={save} /> : undefined,
        }}
      />
      <Body muted>
        Choose the debts that the new loan pays off. Then enter the terms of the new loan. The old debts keep their
        history.
      </Body>

      <SectionHeader title="Debts to combine" />
      <Card style={{ paddingVertical: space.xs, gap: 0 }}>
        {debts.map((d, i) => {
          const on = picked.includes(d.id)
          return (
            <Fragment key={d.id}>
              {i > 0 ? <Divider /> : null}
              <Pressable
                onPress={() => toggle(d.id)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md }}>
                <SymbolView
                  name={on ? { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' } : { ios: 'circle', android: 'radio_button_unchecked', web: 'radio_button_unchecked' }}
                  tintColor={on ? c.accent : c.muted}
                  size={24}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.text, fontSize: 16, fontWeight: '600' }}>{d.name || 'Unnamed debt'}</Text>
                  <Text style={{ color: c.muted, fontSize: 13 }}>{d.rate}%</Text>
                </View>
                <Text style={{ color: c.text, fontSize: 16 }}>{money(parseMoney(d.amount))}</Text>
              </Pressable>
            </Fragment>
          )
        })}
      </Card>

      <SectionHeader title="New loan" />
      <Card>
        <Field label="Name" value={name} onChangeText={setName} />
        <Field
          label="Balance"
          prefix="$"
          value={balance}
          keyboardType="decimal-pad"
          onChangeText={v => setAmount(clean(v))}
          hint="The total of the debts. Add any fees for the new loan."
        />
        <Field label="Interest rate" suffix="% p.a." value={rate} placeholder="0" keyboardType="decimal-pad" onChangeText={v => setRate(clean(v))} />
        <Field
          label="Minimum monthly repayment"
          prefix="$"
          value={repayment}
          placeholder="0"
          keyboardType="decimal-pad"
          onChangeText={v => setRepayment(clean(v))}
        />
      </Card>
      {picked.length < 2 ? <Body muted>Choose two or more debts.</Body> : null}
      {ready ? <Button title={`Combine ${picked.length} debts`} onPress={save} /> : null}
    </Screen>
  )
}
