import { useMemo, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native'
import Svg, { Line, Path, Rect, Text as SvgText } from 'react-native-svg'
import { Debt, monthLabel, moneyShort, Schedule } from '../lib/metrics'
import { CHART_COLORS, radius, space, useColors } from '../lib/theme'

const Y_AXIS = 44
const X_AXIS = 22

function niceMax(v: number): number {
  if (v <= 0) return 1
  const p = Math.pow(10, Math.floor(Math.log10(v)))
  const n = v / p
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10
  return step * p
}

export interface MonthDetail {
  month: number
  total: number
  parts: { id: string; name: string; color: string; paid: number; remaining: number }[]
}

// Payments per month, stacked by debt. The chart scrolls sideways when the plan
// is long. Tap a bar to see that month.
export function PaymentsChart({
  schedule,
  debts,
  onSelect,
  selected,
}: {
  schedule: Schedule
  debts: Debt[]
  selected: number | null
  onSelect: (m: MonthDetail) => void
}) {
  const c = useColors()
  const { width: screen } = useWindowDimensions()
  const height = 260
  const plotH = height - X_AXIS - 8

  const ids = useMemo(() => Object.keys(schedule.months[0]?.values ?? {}), [schedule])
  const colorOf = (id: string) => CHART_COLORS[ids.indexOf(id) % CHART_COLORS.length]
  const nameOf = (id: string) => debts.find(d => d.id === id)?.name || 'Unnamed debt'

  const months = schedule.months.slice(1)
  const totals = months.map(m => Object.values(m.values).reduce((a, v) => a + (v.amountPaid || 0), 0))
  const max = niceMax(Math.max(0, ...totals))

  const available = screen - space.lg * 4 - Y_AXIS
  const barW = Math.max(6, Math.min(28, available / Math.max(1, months.length) - 2))
  const gap = Math.max(2, barW * 0.25)
  const plotW = Math.max(available, months.length * (barW + gap))
  const labelEvery = Math.max(1, Math.ceil(56 / (barW + gap)))

  const detail = (i: number): MonthDetail => {
    const m = months[i]
    return {
      month: m.month,
      total: totals[i],
      parts: ids.map(id => ({
        id,
        name: nameOf(id),
        color: colorOf(id),
        paid: m.values[id]?.amountPaid ?? 0,
        remaining: m.values[id]?.remainingBalance ?? 0,
      })),
    }
  }

  const ticks = [0, 0.5, 1].map(f => f * max)

  return (
    <View>
      <View style={{ flexDirection: 'row' }}>
        <Svg width={Y_AXIS} height={height}>
          {ticks.map(t => (
            <SvgText
              key={t}
              x={Y_AXIS - 6}
              y={8 + plotH - (t / max) * plotH + 4}
              fontSize={11}
              fill={c.muted}
              textAnchor="end">
              {moneyShort(t)}
            </SvgText>
          ))}
        </Svg>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Svg width={plotW} height={height}>
            {ticks.map(t => (
              <Line
                key={t}
                x1={0}
                x2={plotW}
                y1={8 + plotH - (t / max) * plotH}
                y2={8 + plotH - (t / max) * plotH}
                stroke={c.line}
                strokeWidth={1}
              />
            ))}
            {months.map((m, i) => {
              const x = i * (barW + gap) + gap / 2
              let y = 8 + plotH
              const dim = selected !== null && selected !== m.month
              return ids.map(id => {
                const paid = m.values[id]?.amountPaid ?? 0
                if (paid <= 0) return null
                const h = (paid / max) * plotH
                y -= h
                return (
                  <Rect
                    key={`${m.month}-${id}`}
                    x={x}
                    y={y}
                    width={barW}
                    height={h}
                    fill={colorOf(id)}
                    opacity={dim ? 0.35 : 1}
                    onPress={() => onSelect(detail(i))}
                  />
                )
              })
            })}
            {months.map((m, i) =>
              i % labelEvery === 0 ? (
                <SvgText
                  key={`l-${m.month}`}
                  x={i * (barW + gap) + gap / 2}
                  y={height - 6}
                  fontSize={11}
                  fill={c.muted}>
                  {monthLabel(m.month)}
                </SvgText>
              ) : null,
            )}
          </Svg>
        </ScrollView>
      </View>
      <View style={styles.legend}>
        {ids.map(id => (
          <View key={id} style={styles.legendItem}>
            <View style={[styles.swatch, { backgroundColor: colorOf(id) }]} />
            <Text style={{ color: c.text, fontSize: 13 }}>{nameOf(id)}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

export interface AreaPoint {
  label: string
  value: number
}

// A small area chart for the investment projections. Tap a point to read it.
export function AreaChart({
  data,
  color,
  reference,
}: {
  data: AreaPoint[]
  color: string
  reference?: { value: number; label: string; color: string }
}) {
  const c = useColors()
  const { width: screen } = useWindowDimensions()
  const [active, setActive] = useState<number | null>(null)
  const width = screen - space.lg * 4
  const height = 200
  const plotW = width - Y_AXIS
  const plotH = height - X_AXIS - 12
  const max = niceMax(Math.max(reference?.value ?? 0, ...data.map(d => d.value)))
  const x = (i: number) => Y_AXIS + (i / Math.max(1, data.length - 1)) * (plotW - 8)
  const y = (v: number) => 12 + plotH - (v / max) * plotH

  const line = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(d.value)}`).join(' ')
  const area = `${line} L${x(data.length - 1)},${y(0)} L${x(0)},${y(0)} Z`
  const point = active !== null ? data[active] : null

  return (
    <View>
      <Svg width={width} height={height}>
        {[0, 0.5, 1].map(f => (
          <SvgText key={f} x={Y_AXIS - 6} y={y(f * max) + 4} fontSize={11} fill={c.muted} textAnchor="end">
            {moneyShort(f * max)}
          </SvgText>
        ))}
        <Line x1={Y_AXIS} x2={width} y1={y(0)} y2={y(0)} stroke={c.line} />
        <Path d={area} fill={color} fillOpacity={0.25} />
        <Path d={line} stroke={color} strokeWidth={2} fill="none" />
        {reference ? (
          <>
            <Line
              x1={Y_AXIS}
              x2={width}
              y1={y(reference.value)}
              y2={y(reference.value)}
              stroke={reference.color}
              strokeDasharray="5 5"
            />
            <SvgText x={width - 4} y={y(reference.value) - 6} fontSize={11} fill={reference.color} textAnchor="end">
              {reference.label}
            </SvgText>
          </>
        ) : null}
        {data.map((d, i) => (
          <SvgText
            key={d.label}
            x={x(i)}
            y={height - 4}
            fontSize={10}
            fill={c.muted}
            textAnchor={i === 0 ? 'start' : i === data.length - 1 ? 'end' : 'middle'}>
            {i === 0 ? '0y' : d.label.replace(' years', 'y')}
          </SvgText>
        ))}
      </Svg>
      <View style={[StyleSheet.absoluteFill, { flexDirection: 'row', left: Y_AXIS }]}>
        {data.map((d, i) => (
          <Pressable
            key={d.label}
            style={{ flex: 1 }}
            onPress={() => setActive(active === i ? null : i)}
            accessibilityLabel={`${d.label}: ${moneyShort(d.value)}`}
          />
        ))}
      </View>
      {point ? (
        <View style={[styles.readout, { backgroundColor: c.surface2 }]}>
          <Text style={{ color: c.muted, fontSize: 13 }}>{point.label}</Text>
          <Text style={{ color, fontSize: 15, fontWeight: '700' }}>${point.value.toLocaleString()}</Text>
          {reference ? (
            <Text style={{ color: c.bad, fontSize: 13 }}>
              Lost wealth: ${(point.value - reference.value).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </Text>
          ) : null}
        </View>
      ) : (
        <Text style={{ color: c.muted, fontSize: 12, textAlign: 'center' }}>Tap the chart to read a value</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md, marginTop: space.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 10, height: 10, borderRadius: 3 },
  readout: {
    borderRadius: radius.sm,
    padding: space.sm,
    alignItems: 'center',
    marginTop: space.xs,
  },
})
