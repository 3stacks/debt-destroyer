import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
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

export default function StackedBarChart({ months, width, debts }: StackedBarChartProps) {
  if (months.length === 0) {
    return null
  }

  return (
    <div style={{ paddingTop: 24 }}>
      <ResponsiveContainer width="100%" height={Math.max(300, width * 0.5)}>
        <BarChart data={months}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value) => `$${value}`} />
          <Legend />
          {Object.keys(months[0].values).map((debtId, index) => {
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
