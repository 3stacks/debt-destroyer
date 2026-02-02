import { nanoid } from 'nanoid'
import { MONTHS_PER_YEAR, MINIMUM_PRINCIPAL_RATE, errorTemplate } from '../constants'

export interface IDebt {
  name: string
  id: string
  amount: string
  rate: string
  repayment: string
}

export enum DEBT_PAYOFF_METHODS {
  SNOWBALL = 'snowball',
  AVALANCHE = 'avalanche'
}

export interface IStackData {
  month: string
  remainingBalance: number
  values: {
    [debtName: string]: {
      amountPaid: number
      remainingBalance: number
    }
  }
}

interface ICalculateDebtArguments {
  debtMethod: string
  debts: IDebt[]
  extraContributions: number
}

interface IParsedDebt {
  id: string
  name: string
  amount: number
  rate: number
  repayment: number
}

interface IValue {
  remainingBalance: number
  amountPaid: number
  interestPaid: number
}

interface IValueMap {
  [debtId: string]: IValue
}

export interface IRepaymentSchedule {
  extraContributions: number
  guid: string
  months: {
    month: number
    values: IValueMap
  }[]
}

interface IError {
  id: string
  fields: IErrorFields
}

type IErrorFields = Map<
  keyof IDebt,
  {
    error: boolean
    message: string
  }
>

// Utility function to round currency to 2 decimal places
export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100
}

export function sortArray(
  array: IParsedDebt[],
  sortFunction: (firstDebt: IParsedDebt, secondDebt: IParsedDebt) => number
) {
  return [...array].sort(sortFunction)
}

export function sortByRate(firstDebt: IParsedDebt, secondDebt: IParsedDebt) {
  return firstDebt.rate - secondDebt.rate
}

export function sortByAmount(firstDebt: IParsedDebt, secondDebt: IParsedDebt) {
  return firstDebt.amount - secondDebt.amount
}

function calculateMonthlyInterestRate(interest: number) {
  return interest / MONTHS_PER_YEAR / 100
}

export function calculateMinimumMonthlyRepayment(
  interest: number,
  debtAmount: number
): number {
  const monthlyInterest = calculateMonthlyInterestRate(interest)
  return roundCurrency(monthlyInterest * debtAmount + debtAmount * MINIMUM_PRINCIPAL_RATE)
}

function calculateMonthlyInterest(
  interest: number,
  debtAmount: number
): number {
  return roundCurrency(calculateMonthlyInterestRate(interest) * debtAmount)
}

function isDebtValid(debt: IParsedDebt) {
  if (debt.amount <= 0) {
    return false
  }
  return debt.rate >= 0
}

function parseDebt(debt: IDebt): IParsedDebt {
  return {
    ...debt,
    amount: parseFloat(debt.amount),
    rate: parseFloat(debt.rate),
    repayment: parseFloat(debt.repayment)
  }
}

export function parseChartData(rawChartData: IRepaymentSchedule): IStackData[] {
  return rawChartData.months.slice(1).map(month => {
    const values = Object.keys(month.values).reduce(
      (acc, debtId: string) => {
        return {
          ...acc,
          [debtId]: {
            amountPaid: month.values[debtId].amountPaid,
            remainingBalance: month.values[debtId].remainingBalance
          }
        }
      },
      {}
    )

    return {
      ...month,
      month: `${month.month}`,
      remainingBalance: Object.keys(values).reduce(
        (acc, curr) => acc + (values as Record<string, { remainingBalance: number }>)[curr].remainingBalance,
        0
      ),
      values
    }
  })
}

function getTotalBalanceFromValues(values: IValueMap): number {
  return Object.values(values).reduce((acc, value) => {
    return acc + (value.remainingBalance || 0)
  }, 0)
}

function calculateRepayments(
  debts: IParsedDebt[],
  repaymentSchedule: IRepaymentSchedule
): IRepaymentSchedule {
  const lastMonth =
    repaymentSchedule.months[repaymentSchedule.months.length - 1]
  const totalDebtRemaining = lastMonth
    ? getTotalBalanceFromValues(lastMonth.values)
    : 1

  if (totalDebtRemaining <= 0) {
    return repaymentSchedule
  }

  let extraContributions = repaymentSchedule.extraContributions

  const firstDebtNotPaidOff: number = debts.findIndex(debt => {
    return lastMonth.values[debt.id].remainingBalance > 0
  })

  let otherDebtRemainder = debts.slice(firstDebtNotPaidOff).reduce((acc, debt) => {
    const thisDebtLastMonth = lastMonth.values[debt.id]
    return thisDebtLastMonth.remainingBalance > 0 && thisDebtLastMonth.remainingBalance <= debt.repayment
      ? debt.repayment - thisDebtLastMonth.remainingBalance
      : 0
  }, 0)

  const paidOffDebts: IParsedDebt[] = Object.entries(lastMonth.values).reduce<IParsedDebt[]>(
    (acc, [key, value]) => {
      const debt = debts.find(debt => debt.id === key)
      if (value.remainingBalance <= 0 && debt) {
        acc.push(debt)
      }
      return acc
    },
    []
  )

  let extraFunds = paidOffDebts.reduce((acc, paidOffDebt) => {
    return acc + paidOffDebt.repayment
  }, 0)

  const newRepaymentSchedule: IRepaymentSchedule = {
    ...repaymentSchedule,
    months: [
      ...repaymentSchedule.months,
      {
        month: lastMonth.month + 1,
        values: debts.reduce<IValueMap>((acc, debt) => {
          const interestOnBalance = calculateMonthlyInterest(
            debt.rate,
            lastMonth.values[debt.id].remainingBalance
          )
          const balanceAsAtLastMonth = roundCurrency(
            interestOnBalance + lastMonth.values[debt.id].remainingBalance
          )

          let amountPaid: number = 0

          if (balanceAsAtLastMonth <= 0) {
            return {
              ...acc,
              [debt.id]: {
                amountPaid: 0,
                interestPaid: 0,
                remainingBalance: 0
              }
            }
          }

          extraFunds = extraFunds + extraContributions + otherDebtRemainder
          extraContributions = 0
          otherDebtRemainder = 0

          if (balanceAsAtLastMonth < debt.repayment + extraFunds) {
            const standardPaymentRemainder = roundCurrency(
              debt.repayment - balanceAsAtLastMonth
            )

            amountPaid = roundCurrency(balanceAsAtLastMonth)
            extraFunds = roundCurrency(extraFunds + standardPaymentRemainder)

            return {
              ...acc,
              [debt.id]: {
                amountPaid,
                interestPaid: interestOnBalance,
                remainingBalance: 0
              }
            }
          }

          amountPaid = roundCurrency(debt.repayment + extraFunds)
          extraFunds = 0

          const newRemainingBalance = roundCurrency(balanceAsAtLastMonth - amountPaid)
          const newRemainingPlusInterest = roundCurrency(
            calculateMonthlyInterest(debt.rate, newRemainingBalance) + newRemainingBalance
          )

          if (newRemainingPlusInterest - amountPaid > balanceAsAtLastMonth) {
            return {
              ...acc,
              [debt.id]: {
                amountPaid,
                interestPaid: interestOnBalance,
                remainingBalance: 0
              }
            }
          }

          return {
            ...acc,
            [debt.id]: {
              amountPaid,
              interestPaid: interestOnBalance,
              remainingBalance: newRemainingBalance
            }
          }
        }, {})
      }
    ]
  }

  return calculateRepayments(debts, newRepaymentSchedule)
}

export function calculateDebts({
  debtMethod,
  debts,
  extraContributions
}: ICalculateDebtArguments): IRepaymentSchedule {
  const parsedDebts = debts.map(parseDebt)
  const validDebts = parsedDebts.filter(isDebtValid)

  const sortedDebts =
    debtMethod === DEBT_PAYOFF_METHODS.SNOWBALL
      ? sortArray(validDebts, sortByAmount)
      : sortArray(validDebts, sortByRate).reverse()

  return calculateRepayments(sortedDebts, {
    extraContributions,
    guid: nanoid(),
    months: [
      {
        month: 0,
        values: sortedDebts.reduce<IValueMap>((acc, debt) => {
          return {
            ...acc,
            [debt.id]: {
              remainingBalance: debt.amount,
              amountPaid: 0,
              interestPaid: 0
            }
          }
        }, {})
      }
    ]
  })
}

export function editDebt(debt: IDebt, key: keyof IDebt, value: string): IDebt {
  return {
    ...debt,
    [key]: value
  }
}

export function editRow(
  rows: IDebt[],
  rowIndex: number,
  key: keyof IDebt,
  value: string
) {
  const newValue = [...rows]
  newValue[rowIndex] = editDebt(newValue[rowIndex], key, value)
  return newValue
}

function validateFields(
  error: IError,
  debt: IDebt,
  debtProperty: keyof IDebt,
  newValue: string
): IErrorFields {
  const newDebt = {
    ...debt,
    [debtProperty]: newValue
  }

  // BUG FIX: Use parseFloat instead of parseInt for currency values
  if (debtProperty === 'amount' && parseFloat(newDebt.amount) <= 0) {
    return error.fields.set('amount', {
      error: true,
      message: 'Amount should be more than 0'
    })
  }

  if (
    debtProperty === 'amount' ||
    debtProperty === 'repayment' ||
    debtProperty === 'rate'
  ) {
    // BUG FIX: Use parseFloat instead of parseInt
    const valueAsNumber = parseFloat(newDebt[debtProperty])
    const isItNaN = Number.isNaN(valueAsNumber)

    if (isItNaN) {
      return error.fields.set(debtProperty, {
        error: true,
        message: 'Value must be a number'
      })
    }

    error.fields.set('repayment', errorTemplate)
  }

  return error.fields.set(debtProperty, {
    error: false,
    message: ''
  })
}

export function validateRow(
  errors: IError[],
  debtIndex: number,
  debt: IDebt,
  debtProperty: keyof IDebt,
  newValue: string
): IError[] {
  errors[debtIndex] = {
    ...errors[debtIndex],
    fields: validateFields(errors[debtIndex], debt, debtProperty, newValue)
  }

  return errors
}
