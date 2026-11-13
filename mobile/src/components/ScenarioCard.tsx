import { Text, View } from 'react-native'
import { formatMonthsAsTime, money, payoffDate } from '../lib/metrics'
import { space, useColors } from '../lib/theme'
import { Card, Divider, Row } from './ui'

export function ScenarioCard({
  title,
  months,
  interest,
  highlight,
  monthsSaved,
  interestSaved,
}: {
  title: string
  months: number
  interest: number
  highlight?: boolean
  monthsSaved?: number
  interestSaved?: number
}) {
  const c = useColors()
  return (
    <Card style={highlight ? { borderWidth: 2, borderColor: c.good } : undefined}>
      <Text style={{ color: highlight ? c.good : c.text, fontSize: 17, fontWeight: '700' }}>{title}</Text>
      <View style={{ gap: space.xs }}>
        <Row label="Debt free by" value={payoffDate(months)} />
        <Row label="Total interest" value={money(interest)} />
        <Row label="Time to freedom" value={formatMonthsAsTime(months)} />
      </View>
      {monthsSaved !== undefined && monthsSaved > 0 ? (
        <>
          <Divider />
          <Text style={{ color: c.good, fontSize: 15, fontWeight: '600' }}>
            Save {formatMonthsAsTime(monthsSaved)} and {money(interestSaved ?? 0)}
          </Text>
        </>
      ) : null}
    </Card>
  )
}
