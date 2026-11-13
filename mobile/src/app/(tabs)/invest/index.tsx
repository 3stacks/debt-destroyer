import { useMemo, useState } from 'react'
import { AreaChart } from '../../../components/charts'
import { PlanGate } from '../../../components/PlanGate'
import { Body, Callout, Card, Em, Field, Heading, Screen, Stat, StatGrid } from '../../../components/ui'
import {
  calculateInvestmentGrowth,
  calculatePostDebtInvesting,
  Debt,
  getAverageMonthlyPayment,
  getMonthlyPayments,
  getTotalAmountPaid,
  getTotalInterestPaid,
  getWeightedAverageInterestRate,
  money,
  Schedule,
} from '../../../lib/metrics'
import { useColors } from '../../../lib/theme'

const YEARS = [0, 5, 10, 15, 20, 25, 30]
const DEFAULT_RETURN = '7'

function OpportunityCost({ schedule, debts }: { schedule: Schedule; debts: Debt[] }) {
  const c = useColors()
  const [returnText, setReturnText] = useState(DEFAULT_RETURN)
  const annualReturn = parseFloat(returnText) || 0

  const payments = useMemo(() => getMonthlyPayments(schedule), [schedule])
  const totalPaid = getTotalAmountPaid(schedule)
  const totalInterest = getTotalInterestPaid(schedule)
  const avgPayment = getAverageMonthlyPayment(schedule)
  const avgRate = getWeightedAverageInterestRate(debts)
  const payoffMonths = schedule.months.length - 1

  const costData = useMemo(
    () =>
      YEARS.map(year => ({
        label: year === 0 ? 'Paid off' : `+${year} years`,
        value: Math.round(calculateInvestmentGrowth(payments, payoffMonths + year * 12, annualReturn)),
      })),
    [payments, payoffMonths, annualReturn],
  )
  const futureData = useMemo(
    () =>
      YEARS.map(year => ({
        label: year === 0 ? 'Debt free' : `+${year} years`,
        value: Math.round(calculatePostDebtInvesting(avgPayment, year * 12, annualReturn)),
      })),
    [avgPayment, annualReturn],
  )

  const futureWealth = futureData[futureData.length - 1]?.value ?? 0
  const noDebt = calculatePostDebtInvesting(avgPayment, payoffMonths + 30 * 12, annualReturn)
  const gap = noDebt - futureWealth

  return (
    <Screen>
      <Callout tone="warn" title="This analysis may not apply to all debt">
        A mortgage builds equity in an asset that can grow in value. A low-interest student loan or business loan that
        increases your income can be good debt. This analysis is most relevant for high-interest consumer debt, such as
        credit cards and personal loans.
      </Callout>

      <Card>
        <Field
          label="Expected annual return"
          suffix="%"
          value={returnText}
          onChangeText={v => setReturnText(v.replace(/[^0-9.]/g, ''))}
          keyboardType="decimal-pad"
          hint="S&P 500 historical average: about 7% after inflation, or about 10% before inflation."
        />
      </Card>

      <StatGrid>
        <Stat value={money(totalPaid)} label="Total paid to debts" />
        <Stat value={money(totalInterest)} label="Lost to interest" tone="bad" />
        <Stat value={money(gap)} label="Opportunity cost" tone="warn" />
      </StatGrid>

      <Callout tone="info" title="Break-even analysis">
        Your weighted average debt interest rate is <Em color={c.text}>{avgRate.toFixed(1)}%</Em>.{' '}
        {annualReturn > avgRate ? (
          <>
            Your expected return ({annualReturn}%) is higher, so investing can make mathematical sense. But a debt payment
            is a <Em color={c.good}>guaranteed return of {avgRate.toFixed(1)}% with no risk</Em>.
          </>
        ) : (
          <>
            This is more than your expected return ({annualReturn}%), so <Em color={c.good}>pay off your debt first</Em>.
            It is a guaranteed return that beats the market.
          </>
        )}
      </Callout>

      <Card>
        <Heading color={c.bad}>The cost of debt</Heading>
        <Body muted>What your debt payments can become if you invest them instead.</Body>
        <AreaChart data={costData} color={c.warn} reference={{ value: totalPaid, label: 'What you paid', color: c.bad }} />
      </Card>

      {totalInterest > 100 ? (
        <Callout tone="bad">
          You pay <Em color={c.bad}>{money(totalInterest)}</Em> in interest. Invested at {annualReturn}% for 30 years, that
          money grows to <Em color={c.warn}>{money(totalInterest * Math.pow(1 + annualReturn / 100, 30))}</Em>. That money
          goes to your lender instead of your future.
        </Callout>
      ) : null}

      <Card>
        <Heading color={c.good}>Your future wealth</Heading>
        <Body muted>When you are debt free, invest that {money(avgPayment)} each month.</Body>
        <StatGrid>
          <Stat value={money(futureWealth)} label="Wealth in 30 years" note="Pay off debt, then invest" tone="good" />
          <Stat value={money(noDebt)} label="With no debt" note="Invest from day one" tone="violet" />
        </StatGrid>
        <AreaChart data={futureData} color={c.good} />
      </Card>

      <Callout tone="good">
        Invest {money(avgPayment)} a month after your debt is gone, and you build {money(futureWealth)} in 30 years. The
        sooner you are debt free, the sooner your money works for you.
      </Callout>

      <Callout tone="violet" title="The debt gap">
        With no debt, you can invest {money(avgPayment)} a month from day one. Then you have{' '}
        <Em color={c.violet}>{money(gap)} more</Em> than this plan gives you. That is the lifetime cost of this debt.
      </Callout>
    </Screen>
  )
}

export default function InvestScreen() {
  return (
    <PlanGate empty="Add your debts on the Plan tab to see what they cost you over time.">
      {(schedule, debts) => <OpportunityCost schedule={schedule} debts={debts} />}
    </PlanGate>
  )
}
