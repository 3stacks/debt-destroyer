import { useMemo } from 'react'
import { format, addMonths } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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

function getDebtPayoffDate(debtData: IRepaymentSchedule): string {
  return format(
    addMonths(new Date(), debtData.months[debtData.months.length - 1].month),
    'MMM, yyyy'
  )
}

export default function Insights({
  debtData,
  debts,
  extraContributions,
  debtPayoffMethod
}: InsightsProps) {
  const fiftyExtraScenario = useMemo(
    () =>
      calculateDebts({
        debtMethod: debtPayoffMethod,
        extraContributions: parseInt(extraContributions, 10) + 50,
        debts
      }),
    [debtPayoffMethod, extraContributions, debts]
  )

  const oneHundredFiftyExtraScenario = useMemo(
    () =>
      calculateDebts({
        debtMethod: debtPayoffMethod,
        extraContributions: parseInt(extraContributions, 10) + 150,
        debts
      }),
    [debtPayoffMethod, extraContributions, debts]
  )

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead />
          <TableHead>Current scenario</TableHead>
          <TableHead>Extra $50 a month</TableHead>
          <TableHead>Extra $150 a month</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">Pay off date</TableCell>
          <TableCell>{getDebtPayoffDate(debtData)}</TableCell>
          <TableCell>{getDebtPayoffDate(fiftyExtraScenario)}</TableCell>
          <TableCell>{getDebtPayoffDate(oneHundredFiftyExtraScenario)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Total interest paid</TableCell>
          <TableCell>${getTotalInterestPaid(debtData).toFixed(2)}</TableCell>
          <TableCell>${getTotalInterestPaid(fiftyExtraScenario).toFixed(2)}</TableCell>
          <TableCell>${getTotalInterestPaid(oneHundredFiftyExtraScenario).toFixed(2)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}
