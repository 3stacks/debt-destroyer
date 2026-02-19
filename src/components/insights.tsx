import { useMemo } from 'react'
import { format, addMonths } from 'date-fns'
import { TrendingDown, Calendar, DollarSign, Zap } from 'lucide-react'
import {
  calculateDebts,
  DEBT_PAYOFF_METHODS,
  IRepaymentSchedule,
  IDebt
} from '../utils'

interface InsightsProps {
  debtData: IRepaymentSchedule
  debts: IDebt[]
  extraContributions: string
  debtPayoffMethod: DEBT_PAYOFF_METHODS
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

function getPayoffMonths(debtData: IRepaymentSchedule): number {
  return debtData.months[debtData.months.length - 1]?.month || 0
}

function getDebtPayoffDate(debtData: IRepaymentSchedule): Date {
  return addMonths(new Date(), getPayoffMonths(debtData))
}

function formatDate(date: Date): string {
  return format(date, 'MMM yyyy')
}

function formatMonthsAsTime(months: number): string {
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  if (years === 0) {
    return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`
  }
  if (remainingMonths === 0) {
    return `${years} year${years !== 1 ? 's' : ''}`
  }
  return `${years}y ${remainingMonths}m`
}

function getDebtPayoffOrder(debtData: IRepaymentSchedule, debts: IDebt[]): { debt: IDebt; month: number }[] {
  const payoffOrder: { debt: IDebt; month: number }[] = []

  for (const debt of debts) {
    for (let i = 1; i < debtData.months.length; i++) {
      const prevBalance = debtData.months[i - 1]?.values[debt.id]?.remainingBalance ?? 0
      const currBalance = debtData.months[i]?.values[debt.id]?.remainingBalance ?? 0

      if (prevBalance > 0 && currBalance === 0) {
        payoffOrder.push({ debt, month: debtData.months[i].month })
        break
      }
    }
  }

  return payoffOrder.sort((a, b) => a.month - b.month)
}

interface ScenarioCardProps {
  title: string
  highlight?: boolean
  payoffDate: Date
  totalInterest: number
  months: number
  monthsSaved?: number
  interestSaved?: number
}

function ScenarioCard({
  title,
  highlight,
  payoffDate,
  totalInterest,
  months,
  monthsSaved,
  interestSaved
}: ScenarioCardProps) {
  return (
    <div
      className={`rounded-lg p-4 ${
        highlight
          ? 'bg-green-500/10 border-2 border-green-500/30'
          : 'bg-muted/50 border border-border'
      }`}
    >
      <h3 className={`font-semibold mb-3 ${highlight ? 'text-green-600 dark:text-green-400' : ''}`}>
        {title}
      </h3>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="text-sm text-muted-foreground">Debt free by</div>
            <div className="font-medium">{formatDate(payoffDate)}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="text-sm text-muted-foreground">Total interest</div>
            <div className="font-medium">${totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="text-sm text-muted-foreground">Time to freedom</div>
            <div className="font-medium">{formatMonthsAsTime(months)}</div>
          </div>
        </div>

        {(monthsSaved !== undefined && monthsSaved > 0) && (
          <div className="pt-2 border-t border-border/50">
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <TrendingDown className="h-4 w-4" />
              <span className="text-sm font-medium">
                Save {formatMonthsAsTime(monthsSaved)} & ${interestSaved?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Insights({
  debtData,
  debts,
  extraContributions,
  debtPayoffMethod
}: InsightsProps) {
  const currentExtra = parseInt(extraContributions, 10) || 0

  // Calculate total monthly payment (sum of all minimum repayments + extra)
  const totalMonthlyPayment = useMemo(() => {
    const minPayments = debts.reduce((sum, debt) => sum + (parseFloat(debt.repayment) || 0), 0)
    return minPayments + currentExtra
  }, [debts, currentExtra])

  // Percentage-based scenarios
  const percentages = [10, 25, 50]
  const extraAmounts = percentages.map(pct => Math.round(totalMonthlyPayment * (pct / 100)))

  const scenario10 = useMemo(
    () =>
      calculateDebts({
        debtMethod: debtPayoffMethod,
        extraContributions: currentExtra + extraAmounts[0],
        debts
      }),
    [debtPayoffMethod, currentExtra, extraAmounts[0], debts]
  )

  const scenario25 = useMemo(
    () =>
      calculateDebts({
        debtMethod: debtPayoffMethod,
        extraContributions: currentExtra + extraAmounts[1],
        debts
      }),
    [debtPayoffMethod, currentExtra, extraAmounts[1], debts]
  )

  const scenario50 = useMemo(
    () =>
      calculateDebts({
        debtMethod: debtPayoffMethod,
        extraContributions: currentExtra + extraAmounts[2],
        debts
      }),
    [debtPayoffMethod, currentExtra, extraAmounts[2], debts]
  )

  const currentMonths = getPayoffMonths(debtData)
  const currentInterest = getTotalInterestPaid(debtData)
  const payoffOrder = getDebtPayoffOrder(debtData, debts)

  const scenario10Months = getPayoffMonths(scenario10)
  const scenario10Interest = getTotalInterestPaid(scenario10)

  const scenario25Months = getPayoffMonths(scenario25)
  const scenario25Interest = getTotalInterestPaid(scenario25)

  const scenario50Months = getPayoffMonths(scenario50)
  const scenario50Interest = getTotalInterestPaid(scenario50)

  if (debts.length === 0 || currentMonths === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Add some debts to see insights
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">{debts.length}</div>
          <div className="text-sm text-muted-foreground">Debts to crush</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">{formatMonthsAsTime(currentMonths)}</div>
          <div className="text-sm text-muted-foreground">Until freedom</div>
        </div>
        <div className="bg-red-500/10 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-500">
            ${currentInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="text-sm text-muted-foreground">Interest to pay</div>
        </div>
        <div className="bg-green-500/10 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-500">{formatDate(getDebtPayoffDate(debtData))}</div>
          <div className="text-sm text-muted-foreground">Freedom date</div>
        </div>
      </div>

      {/* Payoff order */}
      {payoffOrder.length > 1 && (
        <div className="bg-muted/30 rounded-lg p-4">
          <h3 className="font-semibold mb-3">Payoff order</h3>
          <div className="flex flex-wrap gap-2">
            {payoffOrder.map(({ debt, month }, index) => (
              <div
                key={debt.id}
                className="flex items-center gap-2 bg-background rounded-full px-3 py-1 text-sm border"
              >
                <span className="font-medium text-muted-foreground">{index + 1}.</span>
                <span>{debt.name}</span>
                <span className="text-muted-foreground">({formatMonthsAsTime(month)})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scenario comparison */}
      <div>
        <h3 className="font-semibold mb-3">What if you paid more?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Currently paying ${totalMonthlyPayment.toLocaleString()}/month toward debt
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ScenarioCard
            title="Current plan"
            payoffDate={getDebtPayoffDate(debtData)}
            totalInterest={currentInterest}
            months={currentMonths}
          />
          <ScenarioCard
            title={`+10% (+$${extraAmounts[0]})`}
            payoffDate={getDebtPayoffDate(scenario10)}
            totalInterest={scenario10Interest}
            months={scenario10Months}
            monthsSaved={currentMonths - scenario10Months}
            interestSaved={currentInterest - scenario10Interest}
          />
          <ScenarioCard
            title={`+25% (+$${extraAmounts[1]})`}
            payoffDate={getDebtPayoffDate(scenario25)}
            totalInterest={scenario25Interest}
            months={scenario25Months}
            monthsSaved={currentMonths - scenario25Months}
            interestSaved={currentInterest - scenario25Interest}
          />
          <ScenarioCard
            title={`+50% (+$${extraAmounts[2]})`}
            highlight
            payoffDate={getDebtPayoffDate(scenario50)}
            totalInterest={scenario50Interest}
            months={scenario50Months}
            monthsSaved={currentMonths - scenario50Months}
            interestSaved={currentInterest - scenario50Interest}
          />
        </div>
      </div>

      {/* Motivational nudge */}
      {currentMonths - scenario50Months > 6 && (
        <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4 text-center">
          <p className="text-lg font-medium text-green-600 dark:text-green-400">
            Paying 50% more (${extraAmounts[2]}/month extra) gets you debt-free {formatMonthsAsTime(currentMonths - scenario50Months)} sooner
            and saves ${(currentInterest - scenario50Interest).toLocaleString(undefined, { maximumFractionDigits: 0 })} in interest!
          </p>
        </div>
      )}
    </div>
  )
}
