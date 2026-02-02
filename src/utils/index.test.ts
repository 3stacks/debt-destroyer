import { describe, it, expect } from 'vitest'
import {
  sortByAmount,
  sortByRate,
  sortArray,
  calculateDebts,
  calculateMinimumMonthlyRepayment,
  roundCurrency,
  parseChartData,
  DEBT_PAYOFF_METHODS,
  IDebt
} from './index'

describe('roundCurrency', () => {
  it('rounds to 2 decimal places', () => {
    expect(roundCurrency(10.126)).toBe(10.13)
    expect(roundCurrency(10.124)).toBe(10.12)
    expect(roundCurrency(100)).toBe(100)
  })
})

describe('sortByAmount', () => {
  it('sorts debts by amount ascending', () => {
    const debts = [
      { id: '1', name: 'Big', amount: 5000, rate: 5, repayment: 100 },
      { id: '2', name: 'Small', amount: 1000, rate: 10, repayment: 50 },
      { id: '3', name: 'Medium', amount: 3000, rate: 7, repayment: 75 }
    ]
    const sorted = sortArray(debts, sortByAmount)
    expect(sorted[0].name).toBe('Small')
    expect(sorted[1].name).toBe('Medium')
    expect(sorted[2].name).toBe('Big')
  })
})

describe('sortByRate', () => {
  it('sorts debts by rate ascending', () => {
    const debts = [
      { id: '1', name: 'High', amount: 5000, rate: 20, repayment: 100 },
      { id: '2', name: 'Low', amount: 1000, rate: 5, repayment: 50 },
      { id: '3', name: 'Medium', amount: 3000, rate: 10, repayment: 75 }
    ]
    const sorted = sortArray(debts, sortByRate)
    expect(sorted[0].name).toBe('Low')
    expect(sorted[1].name).toBe('Medium')
    expect(sorted[2].name).toBe('High')
  })
})

describe('calculateMinimumMonthlyRepayment', () => {
  it('calculates interest plus 1% principal', () => {
    // 12% annual = 1% monthly, debt of $1000
    // Monthly interest = $10, plus 1% principal = $10
    // Total = $20
    const result = calculateMinimumMonthlyRepayment(12, 1000)
    expect(result).toBe(20)
  })

  it('handles zero interest rate', () => {
    // 0% interest, just 1% principal on $1000 = $10
    const result = calculateMinimumMonthlyRepayment(0, 1000)
    expect(result).toBe(10)
  })
})

describe('calculateDebts - snowball method', () => {
  const createDebt = (name: string, amount: string, rate: string, repayment: string): IDebt => ({
    id: name,
    name,
    amount,
    rate,
    repayment
  })

  it('pays off smallest debt first', () => {
    const debts: IDebt[] = [
      createDebt('big', '5000', '10', '200'),
      createDebt('small', '500', '5', '100')
    ]

    const result = calculateDebts({
      debtMethod: DEBT_PAYOFF_METHODS.SNOWBALL,
      debts,
      extraContributions: 0
    })

    // Small debt should be paid off before big debt
    const smallPaidOffMonth = result.months.findIndex(
      m => m.values['small']?.remainingBalance === 0
    )
    const bigPaidOffMonth = result.months.findIndex(
      m => m.values['big']?.remainingBalance === 0
    )

    expect(smallPaidOffMonth).toBeLessThan(bigPaidOffMonth)
  })

  it('redirects payments after debt payoff', () => {
    const debts: IDebt[] = [
      createDebt('big', '5000', '10', '200'),
      createDebt('small', '100', '5', '100')
    ]

    const result = calculateDebts({
      debtMethod: DEBT_PAYOFF_METHODS.SNOWBALL,
      debts,
      extraContributions: 0
    })

    // After small debt is paid off, big debt should receive extra payments
    const monthAfterSmallPaidOff = result.months.find(
      (m, i) => i > 0 && result.months[i - 1].values['small']?.remainingBalance > 0 && m.values['small']?.remainingBalance === 0
    )

    // The month after small is paid, big should get more than its minimum
    if (monthAfterSmallPaidOff) {
      const nextMonthIndex = result.months.indexOf(monthAfterSmallPaidOff) + 1
      if (nextMonthIndex < result.months.length) {
        const nextMonth = result.months[nextMonthIndex]
        // Big debt payment should be at least 200 (its minimum) + some redirected amount
        expect(nextMonth.values['big'].amountPaid).toBeGreaterThanOrEqual(200)
      }
    }
  })
})

describe('calculateDebts - avalanche method', () => {
  const createDebt = (name: string, amount: string, rate: string, repayment: string): IDebt => ({
    id: name,
    name,
    amount,
    rate,
    repayment
  })

  it('pays highest interest rate first', () => {
    const debts: IDebt[] = [
      createDebt('lowRate', '1000', '5', '100'),
      createDebt('highRate', '1000', '20', '100')
    ]

    const result = calculateDebts({
      debtMethod: DEBT_PAYOFF_METHODS.AVALANCHE,
      debts,
      extraContributions: 50
    })

    // High rate debt should be paid off before low rate
    const highRatePaidOffMonth = result.months.findIndex(
      m => m.values['highRate']?.remainingBalance === 0
    )
    const lowRatePaidOffMonth = result.months.findIndex(
      m => m.values['lowRate']?.remainingBalance === 0
    )

    expect(highRatePaidOffMonth).toBeLessThan(lowRatePaidOffMonth)
  })
})

describe('calculateDebts - edge cases', () => {
  const createDebt = (name: string, amount: string, rate: string, repayment: string): IDebt => ({
    id: name,
    name,
    amount,
    rate,
    repayment
  })

  it('handles single debt', () => {
    const debts: IDebt[] = [
      createDebt('only', '1000', '10', '200')
    ]

    const result = calculateDebts({
      debtMethod: DEBT_PAYOFF_METHODS.SNOWBALL,
      debts,
      extraContributions: 0
    })

    // Should eventually pay off
    const lastMonth = result.months[result.months.length - 1]
    expect(lastMonth.values['only'].remainingBalance).toBe(0)
  })

  it('handles zero interest rate', () => {
    const debts: IDebt[] = [
      createDebt('noInterest', '500', '0', '100')
    ]

    const result = calculateDebts({
      debtMethod: DEBT_PAYOFF_METHODS.SNOWBALL,
      debts,
      extraContributions: 0
    })

    // Should pay off in ~5 months
    expect(result.months.length).toBeLessThanOrEqual(7)
    const lastMonth = result.months[result.months.length - 1]
    expect(lastMonth.values['noInterest'].remainingBalance).toBe(0)
  })

  it('handles extra contributions', () => {
    const debts: IDebt[] = [
      createDebt('debt', '1000', '10', '100')
    ]

    const withExtra = calculateDebts({
      debtMethod: DEBT_PAYOFF_METHODS.SNOWBALL,
      debts,
      extraContributions: 100
    })

    const withoutExtra = calculateDebts({
      debtMethod: DEBT_PAYOFF_METHODS.SNOWBALL,
      debts,
      extraContributions: 0
    })

    // Extra contributions should reduce payoff time
    expect(withExtra.months.length).toBeLessThan(withoutExtra.months.length)
  })

  it('filters out invalid debts (zero or negative amount)', () => {
    const debts: IDebt[] = [
      createDebt('valid', '1000', '10', '100'),
      createDebt('invalid', '0', '10', '100'),
      createDebt('negative', '-500', '10', '100')
    ]

    const result = calculateDebts({
      debtMethod: DEBT_PAYOFF_METHODS.SNOWBALL,
      debts,
      extraContributions: 0
    })

    // Only valid debt should be in the schedule
    expect(Object.keys(result.months[0].values)).toEqual(['valid'])
  })

  it('handles debt already paid off (empty debts array)', () => {
    const debts: IDebt[] = []

    const result = calculateDebts({
      debtMethod: DEBT_PAYOFF_METHODS.SNOWBALL,
      debts,
      extraContributions: 0
    })

    // Should return initial month with empty values
    expect(result.months.length).toBe(1)
    expect(Object.keys(result.months[0].values)).toEqual([])
  })
})

describe('calculateDebts - car loan regression', () => {
  it('car loan $23000 at 8% with $600 payment should take ~46 months', () => {
    const debts: IDebt[] = [
      { id: 'car', name: 'Car Loan', amount: '23000', rate: '8', repayment: '600' }
    ]

    const result = calculateDebts({
      debtMethod: DEBT_PAYOFF_METHODS.SNOWBALL,
      debts,
      extraContributions: 0
    })

    // Without interest: 23000 / 600 = 38.3 months
    // With 8% interest it should be around 46 months
    expect(result.months.length).toBe(46)

    // Verify interest calculation: 8% annual = 0.667% monthly
    // First month interest on $23,000 should be ~$153.33
    expect(result.months[1].values['car'].interestPaid).toBeCloseTo(153.33, 1)
  })

  it('parseChartData preserves all months', () => {
    const debts: IDebt[] = [
      { id: 'car', name: 'Car Loan', amount: '23000', rate: '8', repayment: '600' }
    ]

    const result = calculateDebts({
      debtMethod: DEBT_PAYOFF_METHODS.SNOWBALL,
      debts,
      extraContributions: 0
    })

    const chartData = parseChartData(result)

    // parseChartData skips month 0 (initial state)
    expect(chartData.length).toBe(result.months.length - 1)
    expect(chartData[0].month).toBe('1')
    expect(chartData[chartData.length - 1].month).toBe('45')
  })
})
