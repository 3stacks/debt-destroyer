import { useState, useEffect } from 'react'
import { nanoid } from 'nanoid'
import { Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { editRow, validateRow, IDebt } from '../../utils'
import { errorTemplate } from '../../constants'

interface IError {
  id: string
  fields: Map<keyof IDebt, { error: boolean; message: string }>
}

function debtFactory(): IDebt {
  return {
    name: '',
    id: nanoid(),
    amount: '',
    repayment: '',
    rate: ''
  }
}

function errorFactory(debtId: string): IError {
  return {
    id: debtId,
    fields: new Map([
      ['name', errorTemplate],
      ['amount', errorTemplate],
      ['repayment', errorTemplate],
      ['rate', errorTemplate]
    ])
  }
}

interface DebtTableProps {
  onDebtChanged: (rows: IDebt[]) => void
  initialDebtState: IDebt[]
}

export default function DebtTable({ onDebtChanged, initialDebtState }: DebtTableProps) {
  const [rows, setRows] = useState<IDebt[]>(initialDebtState)
  const [errors, setErrors] = useState<IError[]>(
    initialDebtState.map(debt => errorFactory(debt.id))
  )

  // Sync with parent when initialDebtState changes (e.g., from URL restore)
  useEffect(() => {
    setRows(initialDebtState)
    setErrors(initialDebtState.map(debt => errorFactory(debt.id)))
  }, [initialDebtState])

  // Notify parent of changes
  useEffect(() => {
    onDebtChanged(rows)
  }, [rows, onDebtChanged])

  const handleNewRow = () => {
    const newDebt = debtFactory()
    setRows(prev => [...prev, newDebt])
    setErrors(prev => [...prev, errorFactory(newDebt.id)])
  }

  const handleChange = (debtProperty: keyof IDebt, debtIndex: number) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = e.target.value
    setRows(prev => editRow(prev, debtIndex, debtProperty, newValue))
    setErrors(prev => {
      const newErrors = [...prev]
      return validateRow(newErrors, debtIndex, rows[debtIndex], debtProperty, newValue)
    })
  }

  const handleRemoveRow = (rowId: string) => () => {
    setRows(prev => prev.filter(row => row.id !== rowId))
    setErrors(prev => prev.filter(err => err.id !== rowId))
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Interest rate (%)</TableHead>
              <TableHead>Min. monthly repayment</TableHead>
              <TableHead className="w-16">Remove</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ id, name, amount, repayment, rate }, index) => {
              const fieldErrors = errors[index]?.fields
              const changeHandler = (debtProperty: keyof IDebt) =>
                handleChange(debtProperty, index)

              return (
                <TableRow key={id}>
                  <TableCell>
                    <Input
                      placeholder="Name"
                      value={name}
                      onChange={changeHandler('name')}
                      error={fieldErrors?.get('name')?.error}
                      helperText={fieldErrors?.get('name')?.message}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="Amount"
                      type="number"
                      startAdornment="$"
                      value={amount}
                      onChange={changeHandler('amount')}
                      error={fieldErrors?.get('amount')?.error}
                      helperText={fieldErrors?.get('amount')?.message}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="Rate"
                      type="number"
                      endAdornment="%"
                      value={rate}
                      onChange={changeHandler('rate')}
                      error={fieldErrors?.get('rate')?.error}
                      helperText={fieldErrors?.get('rate')?.message}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="Monthly repayment"
                      type="number"
                      startAdornment="$"
                      value={repayment}
                      onChange={changeHandler('repayment')}
                      error={fieldErrors?.get('repayment')?.error}
                      helperText={fieldErrors?.get('repayment')?.message}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveRow(id)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
            <TableRow>
              <TableCell colSpan={5}>
                <Button variant="outline" onClick={handleNewRow}>
                  <Plus className="h-4 w-4 mr-2" /> Add Row
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
