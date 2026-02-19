import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
  ReferenceLine,
} from 'recharts'
import { IRepaymentSchedule, IDebt } from '../utils'

interface OpportunityCostProps {
  debtData: IRepaymentSchedule
  debts: IDebt[]
  width: number
}

const ASSUMED_ANNUAL_RETURN = 0.07 // 7% annual return (S&P 500 historical average)
const MONTHLY_RETURN = ASSUMED_ANNUAL_RETURN / 12

interface InvestmentDataPoint {
  year: number
  label: string
  debtPayments: number
  investedValue: number
  interestWasted: number
}

function getTotalInterestPaid(debtData: IRepaymentSchedule): number {
  return debtData.months.reduce((acc, month) => {
    return (
      acc +
      Object.values(month.values).reduce((acc, value) => {
        if (!value.interestPaid) {
          return acc
        }
        return acc + value.interestPaid
      }, 0)
    )
  }, 0)
}

function getTotalAmountPaid(debtData: IRepaymentSchedule): number {
  return debtData.months.reduce((acc, month) => {
    return (
      acc +
      Object.values(month.values).reduce((acc, value) => {
        return acc + (value.amountPaid || 0)
      }, 0)
    )
  }, 0)
}

function getMonthlyPayments(debtData: IRepaymentSchedule): number[] {
  return debtData.months.slice(1).map(month => {
    return Object.values(month.values).reduce((acc, value) => {
      return acc + (value.amountPaid || 0)
    }, 0)
  })
}

// Calculate future value of a series of monthly payments invested at a given rate
function calculateInvestmentGrowth(
  monthlyPayments: number[],
  totalMonthsToProject: number
): number {
  let totalValue = 0
  const paymentMonths = monthlyPayments.length

  // For each payment, calculate how much it grows
  for (let i = 0; i < paymentMonths; i++) {
    const payment = monthlyPayments[i]
    const monthsOfGrowth = totalMonthsToProject - i
    if (monthsOfGrowth > 0) {
      // Future value = payment * (1 + r)^n
      totalValue += payment * Math.pow(1 + MONTHLY_RETURN, monthsOfGrowth)
    } else {
      totalValue += payment
    }
  }

  return totalValue
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  const investedValue = payload.find(p => p.dataKey === 'investedValue')?.value || 0
  const debtPayments = payload.find(p => p.dataKey === 'debtPayments')?.value || 0
  const opportunityCost = (investedValue as number) - (debtPayments as number)

  return (
    <div className="bg-background border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium mb-2">{label}</p>
      <p className="text-red-500">
        What you paid: ${(debtPayments as number).toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </p>
      <p className="text-green-500">
        If invested: ${(investedValue as number).toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </p>
      <p className="font-medium mt-2 pt-2 border-t text-amber-500">
        Lost wealth: ${opportunityCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </p>
    </div>
  )
}

export default function OpportunityCost({ debtData, debts, width }: OpportunityCostProps) {
  const monthlyPayments = useMemo(() => getMonthlyPayments(debtData), [debtData])
  const totalAmountPaid = useMemo(() => getTotalAmountPaid(debtData), [debtData])
  const totalInterestPaid = useMemo(() => getTotalInterestPaid(debtData), [debtData])
  const debtPayoffMonths = debtData.months.length - 1

  const chartData = useMemo<InvestmentDataPoint[]>(() => {
    const data: InvestmentDataPoint[] = []
    const yearsToProject = [0, 5, 10, 15, 20, 25, 30]

    for (const year of yearsToProject) {
      const totalMonths = debtPayoffMonths + year * 12
      const investedValue = calculateInvestmentGrowth(monthlyPayments, totalMonths)

      data.push({
        year,
        label: year === 0 ? 'Debt paid off' : `+${year} years`,
        debtPayments: totalAmountPaid,
        investedValue: Math.round(investedValue),
        interestWasted: totalInterestPaid,
      })
    }

    return data
  }, [monthlyPayments, totalAmountPaid, totalInterestPaid, debtPayoffMonths])

  if (debtPayoffMonths === 0 || debts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Add some debts to see opportunity cost analysis
      </div>
    )
  }

  const finalInvestedValue = chartData[chartData.length - 1]?.investedValue || 0
  const lostWealth = finalInvestedValue - totalAmountPaid

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-foreground">
            ${totalAmountPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="text-sm text-muted-foreground">Total paid to debts</div>
        </div>
        <div className="bg-red-500/10 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-500">
            ${totalInterestPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="text-sm text-muted-foreground">Wasted on interest</div>
        </div>
        <div className="bg-green-500/10 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-500">
            ${finalInvestedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="text-sm text-muted-foreground">If invested 30 years</div>
        </div>
        <div className="bg-amber-500/10 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-amber-500">
            ${lostWealth.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="text-sm text-muted-foreground">Lost wealth potential</div>
        </div>
      </div>

      {/* Shame message */}
      <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 text-center">
        <p className="text-lg font-medium text-red-600 dark:text-red-400">
          Every ${Math.round(totalAmountPaid / debtPayoffMonths).toLocaleString()} monthly payment could become ${Math.round(finalInvestedValue / debtPayoffMonths).toLocaleString()} if invested instead.
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Based on 7% annual return (S&P 500 historical average)
        </p>
      </div>

      {/* Chart */}
      <div>
        <h3 className="font-medium mb-4">Investment growth projection</h3>
        <ResponsiveContainer width="100%" height={Math.max(300, width * 0.4)}>
          <AreaChart data={chartData}>
            <XAxis dataKey="label" />
            <YAxis
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={totalAmountPaid}
              stroke="hsl(0, 72%, 51%)"
              strokeDasharray="5 5"
              label={{ value: 'What you paid', position: 'right', fill: 'hsl(0, 72%, 51%)' }}
            />
            <Area
              type="monotone"
              dataKey="investedValue"
              name="Invested value"
              stroke="hsl(142, 71%, 45%)"
              fill="hsl(142, 71%, 45%)"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Extra shame: what the interest alone could have been */}
      {totalInterestPaid > 100 && (
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-2">The real cost of interest</h4>
          <p className="text-sm text-muted-foreground">
            The <span className="text-red-500 font-medium">${totalInterestPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span> you're paying in interest alone, if invested at 7% for 30 years, would grow to{' '}
            <span className="text-green-500 font-medium">
              ${Math.round(totalInterestPaid * Math.pow(1 + ASSUMED_ANNUAL_RETURN, 30)).toLocaleString()}
            </span>. That's money going straight into your lender's pocket instead of your retirement.
          </p>
        </div>
      )}
    </div>
  )
}
