import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, TooltipProps } from 'recharts'
import { format, addMonths } from 'date-fns'
import { IStackData, IDebt } from '../utils'

// Direct HSL values (CSS variables don't work in SVG fill attributes)
const CHART_COLORS = [
  'hsl(0, 72%, 51%)',     // red
  'hsl(217, 91%, 60%)',   // blue
  'hsl(142, 71%, 45%)',   // green
  'hsl(330, 81%, 60%)',   // pink
  'hsl(25, 95%, 53%)',    // orange
]

interface StackedBarChartProps {
  months: IStackData[]
  width: number
  debts: IDebt[]
}

interface ChartDataPoint extends IStackData {
  dateLabel: string
  totalPaid: number
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  const totalPaid = payload.reduce((sum, entry) => sum + (entry.value || 0), 0)

  return (
    <div className="bg-background border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium mb-2">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} style={{ color: entry.color }}>
          {entry.name}: ${entry.value?.toFixed(2)}
        </p>
      ))}
      <p className="font-medium mt-2 pt-2 border-t">
        Total: ${totalPaid.toFixed(2)}
      </p>
    </div>
  )
}

export default function StackedBarChart({ months, width, debts }: StackedBarChartProps) {
  const chartData = useMemo<ChartDataPoint[]>(() => {
    const startDate = new Date()
    return months.map(month => {
      const monthNumber = parseInt(month.month, 10)
      const date = addMonths(startDate, monthNumber)
      const totalPaid = Object.values(month.values).reduce(
        (sum, v) => sum + (v.amountPaid || 0),
        0
      )
      return {
        ...month,
        dateLabel: format(date, 'MMM, yy'),
        totalPaid
      }
    })
  }, [months])

  if (chartData.length === 0) {
    return null
  }

  return (
    <div style={{ paddingTop: 24 }}>
      <ResponsiveContainer width="100%" height={Math.max(300, width * 0.5)}>
        <BarChart data={chartData}>
          <XAxis dataKey="dateLabel" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {Object.keys(chartData[0].values).map((debtId, index) => {
            const debt = debts.find(d => d.id === debtId)
            if (!debt) return null

            return (
              <Bar
                key={debtId}
                dataKey={`values.${debtId}.amountPaid`}
                name={debt.name}
                stackId="a"
                fill={CHART_COLORS[index % CHART_COLORS.length]}
              />
            )
          })}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
