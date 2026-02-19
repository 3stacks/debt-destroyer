import { useMemo, useState } from 'react'
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
import { AlertTriangle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { IRepaymentSchedule, IDebt } from '../utils'

interface OpportunityCostProps {
  debtData: IRepaymentSchedule
  debts: IDebt[]
  width: number
}

const DEFAULT_ANNUAL_RETURN = 7

interface OpportunityCostDataPoint {
  year: number
  label: string
  debtPayments: number
  investedValue: number
}

interface FutureWealthDataPoint {
  year: number
  label: string
  investedValue: number
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

function getAverageMonthlyPayment(debtData: IRepaymentSchedule): number {
  const payments = getMonthlyPayments(debtData)
  if (payments.length === 0) return 0
  return payments.reduce((a, b) => a + b, 0) / payments.length
}

function getWeightedAverageInterestRate(debts: IDebt[]): number {
  const totalBalance = debts.reduce((acc, d) => acc + parseFloat(d.amount || '0'), 0)
  if (totalBalance === 0) return 0

  const weightedRate = debts.reduce((acc, d) => {
    const amount = parseFloat(d.amount || '0')
    const rate = parseFloat(d.rate || '0')
    return acc + (amount * rate)
  }, 0)

  return weightedRate / totalBalance
}

// Calculate future value of a series of monthly payments invested at a given rate
function calculateInvestmentGrowth(
  monthlyPayments: number[],
  totalMonthsToProject: number,
  annualReturn: number
): number {
  const monthlyReturn = annualReturn / 100 / 12
  let totalValue = 0
  const paymentMonths = monthlyPayments.length

  for (let i = 0; i < paymentMonths; i++) {
    const payment = monthlyPayments[i]
    const monthsOfGrowth = totalMonthsToProject - i
    if (monthsOfGrowth > 0) {
      totalValue += payment * Math.pow(1 + monthlyReturn, monthsOfGrowth)
    } else {
      totalValue += payment
    }
  }

  return totalValue
}

// Calculate future value of investing a fixed amount monthly AFTER debt is paid off
function calculatePostDebtInvesting(
  monthlyAmount: number,
  investingMonths: number,
  annualReturn: number
): number {
  const monthlyReturn = annualReturn / 100 / 12
  let totalValue = 0

  for (let i = 0; i < investingMonths; i++) {
    const monthsOfGrowth = investingMonths - i
    totalValue += monthlyAmount * Math.pow(1 + monthlyReturn, monthsOfGrowth)
  }

  return totalValue
}

function OpportunityCostTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  const investedValue = payload.find(p => p.dataKey === 'investedValue')?.value || 0
  const debtPayments = payload.find(p => p.dataKey === 'debtPayments')?.value || 0
  const lostWealth = (investedValue as number) - (debtPayments as number)

  return (
    <div className="bg-background border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium mb-2">{label}</p>
      <p className="text-muted-foreground">
        Paid to debt: ${(debtPayments as number).toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </p>
      <p className="text-amber-500">
        If invested: ${(investedValue as number).toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </p>
      <p className="font-medium mt-2 pt-2 border-t text-red-500">
        Lost wealth: ${lostWealth.toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </p>
    </div>
  )
}

function FutureWealthTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  const investedValue = payload.find(p => p.dataKey === 'investedValue')?.value || 0

  return (
    <div className="bg-background border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium mb-2">{label}</p>
      <p className="text-green-500">
        Portfolio value: ${(investedValue as number).toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </p>
    </div>
  )
}

export default function OpportunityCost({ debtData, debts, width }: OpportunityCostProps) {
  const [annualReturn, setAnnualReturn] = useState(DEFAULT_ANNUAL_RETURN)

  const monthlyPayments = useMemo(() => getMonthlyPayments(debtData), [debtData])
  const totalAmountPaid = useMemo(() => getTotalAmountPaid(debtData), [debtData])
  const totalInterestPaid = useMemo(() => getTotalInterestPaid(debtData), [debtData])
  const averageMonthlyPayment = useMemo(() => getAverageMonthlyPayment(debtData), [debtData])
  const weightedAvgRate = useMemo(() => getWeightedAverageInterestRate(debts), [debts])
  const debtPayoffMonths = debtData.months.length - 1

  // Chart 1: The cost of debt (opportunity cost)
  const opportunityCostData = useMemo<OpportunityCostDataPoint[]>(() => {
    const data: OpportunityCostDataPoint[] = []
    const yearsToProject = [0, 5, 10, 15, 20, 25, 30]

    for (const year of yearsToProject) {
      const totalMonths = debtPayoffMonths + year * 12
      const investedValue = calculateInvestmentGrowth(monthlyPayments, totalMonths, annualReturn)

      data.push({
        year,
        label: year === 0 ? 'Debt paid off' : `+${year} years`,
        debtPayments: totalAmountPaid,
        investedValue: Math.round(investedValue),
      })
    }

    return data
  }, [monthlyPayments, totalAmountPaid, debtPayoffMonths, annualReturn])

  // Chart 2: Future wealth (post-debt investing)
  const futureWealthData = useMemo<FutureWealthDataPoint[]>(() => {
    const data: FutureWealthDataPoint[] = []
    const yearsToProject = [0, 5, 10, 15, 20, 25, 30]

    for (const year of yearsToProject) {
      const investingMonths = year * 12
      const investedValue = calculatePostDebtInvesting(averageMonthlyPayment, investingMonths, annualReturn)

      data.push({
        year,
        label: year === 0 ? 'Debt free!' : `+${year} years`,
        investedValue: Math.round(investedValue),
      })
    }

    return data
  }, [averageMonthlyPayment, annualReturn])

  if (debtPayoffMonths === 0 || debts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Add some debts to see opportunity cost analysis
      </div>
    )
  }

  const finalFutureWealth = futureWealthData[futureWealthData.length - 1]?.investedValue || 0

  // "If you never had debt" = investing the same monthly amount from day one for the full period
  // That's debt payoff months + 30 years of continuous investing
  const noDebtScenario = calculatePostDebtInvesting(
    averageMonthlyPayment,
    debtPayoffMonths + 30 * 12,
    annualReturn
  )
  const debtGap = noDebtScenario - finalFutureWealth // What debt costs you over your lifetime
  const breakEvenRate = weightedAvgRate

  return (
    <div className="space-y-8">
      {/* Disclaimer */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-amber-600 dark:text-amber-400 mb-1">
            This analysis may not apply to all debt
          </p>
          <p className="text-muted-foreground">
            Mortgages build equity in an appreciating asset. Low-interest student loans or business
            loans that increase earning potential can be "good debt." This visualisation is most
            relevant for high-interest consumer debt like credit cards and personal loans.
          </p>
        </div>
      </div>

      {/* Settings */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-2">
          <Label htmlFor="return-rate">Expected annual return</Label>
          <Input
            id="return-rate"
            type="number"
            min="0"
            max="30"
            step="0.5"
            value={annualReturn}
            onChange={(e) => setAnnualReturn(parseFloat(e.target.value) || 0)}
            endAdornment="%"
            className="w-32"
          />
        </div>
        <p className="text-xs text-muted-foreground pb-2">
          S&P 500 historical average: ~7% (inflation-adjusted) or ~10% (nominal)
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <div className="bg-amber-500/10 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-amber-500">
            ${debtGap.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="text-sm text-muted-foreground">Lost to opportunity cost</div>
        </div>
      </div>

      {/* Break-even rate */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <h4 className="font-medium mb-2 text-blue-600 dark:text-blue-400">Break-even analysis</h4>
        <p className="text-sm text-muted-foreground">
          Your weighted average debt interest rate is <span className="font-medium text-foreground">{breakEvenRate.toFixed(1)}%</span>.
          {annualReturn > breakEvenRate ? (
            <span>
              {' '}Since your expected return ({annualReturn}%) exceeds this, investing <em>could</em> make
              mathematical sense—but paying off debt is a <span className="text-green-500 font-medium">guaranteed, risk-free return</span> of {breakEvenRate.toFixed(1)}%.
            </span>
          ) : (
            <span>
              {' '}Since this exceeds your expected return ({annualReturn}%),
              <span className="text-green-500 font-medium"> paying off debt first is the smarter choice</span>—it's
              a guaranteed return that beats the market.
            </span>
          )}
        </p>
      </div>

      {/* ============ SECTION 1: The Cost of Debt ============ */}
      <div className="space-y-4 pt-4 border-t">
        <div>
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">The Cost of Debt</h3>
          <p className="text-sm text-muted-foreground">
            What your debt payments would be worth if you could have invested them instead.
          </p>
        </div>

        <ResponsiveContainer width="100%" height={Math.max(250, width * 0.35)}>
          <AreaChart data={opportunityCostData}>
            <XAxis dataKey="label" />
            <YAxis
              tickFormatter={(value) => value >= 1000000
                ? `$${(value / 1000000).toFixed(1)}M`
                : `$${(value / 1000).toFixed(0)}k`
              }
            />
            <Tooltip content={<OpportunityCostTooltip />} />
            <ReferenceLine
              y={totalAmountPaid}
              stroke="hsl(0, 72%, 51%)"
              strokeDasharray="5 5"
              label={{ value: 'What you paid', position: 'insideTopRight', fill: 'hsl(0, 72%, 51%)', fontSize: 12 }}
            />
            <Area
              type="monotone"
              dataKey="investedValue"
              name="If invested instead"
              stroke="hsl(35, 92%, 50%)"
              fill="hsl(35, 92%, 50%)"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* The real cost of interest */}
        {totalInterestPaid > 100 && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              The <span className="text-red-500 font-medium">${totalInterestPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span> you're
              paying in interest alone, if invested at {annualReturn}% for 30 years, would grow to{' '}
              <span className="text-amber-500 font-medium">
                ${Math.round(totalInterestPaid * Math.pow(1 + annualReturn / 100, 30)).toLocaleString()}
              </span>. That's money going straight into your lender's pocket instead of your future.
            </p>
          </div>
        )}
      </div>

      {/* ============ SECTION 2: What's Next ============ */}
      <div className="space-y-4 pt-4 border-t">
        <div>
          <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">What's Next: Your Future Wealth</h3>
          <p className="text-sm text-muted-foreground">
            Once you're debt-free, redirect that ${Math.round(averageMonthlyPayment).toLocaleString()}/month to investments.
          </p>
        </div>

        {/* Future wealth stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-500/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-500">
              ${finalFutureWealth.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="text-sm text-muted-foreground">Your future wealth (30y)</div>
            <div className="text-xs text-muted-foreground mt-1">Pay off debt, then invest</div>
          </div>
          <div className="bg-purple-500/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-500">
              ${noDebtScenario.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="text-sm text-muted-foreground">If you never had debt</div>
            <div className="text-xs text-muted-foreground mt-1">Investing from day one</div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={Math.max(250, width * 0.35)}>
          <AreaChart data={futureWealthData}>
            <XAxis dataKey="label" />
            <YAxis
              tickFormatter={(value) => value >= 1000000
                ? `$${(value / 1000000).toFixed(1)}M`
                : `$${(value / 1000).toFixed(0)}k`
              }
            />
            <Tooltip content={<FutureWealthTooltip />} />
            <Area
              type="monotone"
              dataKey="investedValue"
              name="Your investment portfolio"
              stroke="hsl(142, 71%, 45%)"
              fill="hsl(142, 71%, 45%)"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Motivational message */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
          <p className="text-lg font-medium text-green-600 dark:text-green-400">
            Invest ${Math.round(averageMonthlyPayment).toLocaleString()}/month after debt payoff to build ${finalFutureWealth.toLocaleString(undefined, { maximumFractionDigits: 0 })} in 30 years.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            The faster you're debt-free, the sooner your money starts working for you.
          </p>
        </div>

        {/* The debt gap */}
        <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4">
          <h4 className="font-medium mb-2 text-purple-600 dark:text-purple-400">The debt gap</h4>
          <p className="text-sm text-muted-foreground">
            If you never had this debt and invested ${Math.round(averageMonthlyPayment).toLocaleString()}/month from day one,
            you'd have <span className="text-purple-500 font-medium">${debtGap.toLocaleString(undefined, { maximumFractionDigits: 0 })} more</span> than
            you'll actually end up with. That's the lifetime cost of carrying this debt.
          </p>
        </div>
      </div>
    </div>
  )
}
