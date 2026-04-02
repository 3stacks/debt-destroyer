import { useState, useMemo } from 'react'
import { nanoid } from 'nanoid'
import { format, addMonths } from 'date-fns'
import { Plus, Trash2, Cigarette, Coffee, TrendingDown, Calendar, DollarSign, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  calculateDebts,
  DEBT_PAYOFF_METHODS,
  IRepaymentSchedule,
  IDebt
} from '../utils'

interface ViceSimulatorProps {
  debtData: IRepaymentSchedule
  debts: IDebt[]
  extraContributions: string
  debtPayoffMethod: DEBT_PAYOFF_METHODS
}

type Frequency = 'daily' | 'weekly' | 'monthly'

interface Vice {
  id: string
  name: string
  cost: string
  frequency: Frequency
}

const FREQUENCY_OPTIONS: { value: Frequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

const PRESET_VICES: { name: string; cost: string; frequency: Frequency; icon: typeof Cigarette }[] = [
  { name: 'Smoking', cost: '15', frequency: 'daily', icon: Cigarette },
  { name: 'Coffee', cost: '6', frequency: 'daily', icon: Coffee },
]

function toMonthly(cost: number, frequency: Frequency): number {
  switch (frequency) {
    case 'daily':
      return cost * 30
    case 'weekly':
      return cost * (52 / 12)
    case 'monthly':
      return cost
  }
}

function toYearly(cost: number, frequency: Frequency): number {
  switch (frequency) {
    case 'daily':
      return cost * 365
    case 'weekly':
      return cost * 52
    case 'monthly':
      return cost * 12
  }
}

function getTotalInterestPaid(debtData: IRepaymentSchedule): number {
  return debtData.months.reduce((acc, month) => {
    return (
      acc +
      Object.values(month.values).reduce((acc, value) => {
        return acc + (value.interestPaid || 0)
      }, 0)
    )
  }, 0)
}

function getPayoffMonths(debtData: IRepaymentSchedule): number {
  return debtData.months[debtData.months.length - 1]?.month || 0
}

function formatMonthsAsTime(months: number): string {
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  if (years === 0) return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`
  if (remainingMonths === 0) return `${years} year${years !== 1 ? 's' : ''}`
  return `${years}y ${remainingMonths}m`
}

function formatDate(date: Date): string {
  return format(date, 'MMM yyyy')
}

function createVice(): Vice {
  return { id: nanoid(), name: '', cost: '', frequency: 'weekly' }
}

export default function ViceSimulator({
  debtData,
  debts,
  extraContributions,
  debtPayoffMethod
}: ViceSimulatorProps) {
  const [vices, setVices] = useState<Vice[]>([])

  const currentExtra = parseInt(extraContributions, 10) || 0
  const currentMonths = getPayoffMonths(debtData)
  const currentInterest = getTotalInterestPaid(debtData)

  const totalMonthlySavings = useMemo(() => {
    return vices.reduce((sum, vice) => {
      const cost = parseFloat(vice.cost)
      if (isNaN(cost) || cost <= 0) return sum
      return sum + toMonthly(cost, vice.frequency)
    }, 0)
  }, [vices])

  const totalYearlySavings = useMemo(() => {
    return vices.reduce((sum, vice) => {
      const cost = parseFloat(vice.cost)
      if (isNaN(cost) || cost <= 0) return sum
      return sum + toYearly(cost, vice.frequency)
    }, 0)
  }, [vices])

  const viceScenario = useMemo(() => {
    if (totalMonthlySavings <= 0) return null
    return calculateDebts({
      debtMethod: debtPayoffMethod,
      extraContributions: currentExtra + Math.round(totalMonthlySavings),
      debts
    })
  }, [totalMonthlySavings, debtPayoffMethod, currentExtra, debts])

  const viceMonths = viceScenario ? getPayoffMonths(viceScenario) : currentMonths
  const viceInterest = viceScenario ? getTotalInterestPaid(viceScenario) : currentInterest
  const monthsSaved = currentMonths - viceMonths
  const interestSaved = currentInterest - viceInterest

  const addVice = () => setVices(v => [...v, createVice()])
  const removeVice = (id: string) => setVices(v => v.filter(vice => vice.id !== id))

  const updateVice = (id: string, field: keyof Vice, value: string) => {
    setVices(v => v.map(vice => vice.id === id ? { ...vice, [field]: value } : vice))
  }

  const addPreset = (preset: typeof PRESET_VICES[number]) => {
    setVices(v => [...v, { id: nanoid(), name: preset.name, cost: preset.cost, frequency: preset.frequency }])
  }

  if (debts.length === 0 || currentMonths === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Add some debts to simulate vice impact
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div>
        <h3 className="text-lg font-semibold">What if you quit a vice?</h3>
        <p className="text-sm text-muted-foreground">
          Add your vices below to see how redirecting that money toward debt could accelerate your payoff.
        </p>
      </div>

      {/* Quick presets */}
      <div className="flex flex-wrap gap-2">
        {PRESET_VICES.map(preset => (
          <Button
            key={preset.name}
            variant="outline"
            size="sm"
            onClick={() => addPreset(preset)}
          >
            <preset.icon className="h-4 w-4 mr-1" />
            {preset.name} (${preset.cost}/{preset.frequency})
          </Button>
        ))}
      </div>

      {/* Vice list */}
      <div className="space-y-3">
        {vices.map(vice => (
          <div key={vice.id} className="flex items-end gap-2 flex-wrap">
            <div className="flex-1 min-w-[120px]">
              <Label className="text-xs">Vice</Label>
              <Input
                placeholder="e.g. Smoking"
                value={vice.name}
                onChange={e => updateVice(vice.id, 'name', e.target.value)}
              />
            </div>
            <div className="w-28">
              <Label className="text-xs">Cost</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                startAdornment="$"
                placeholder="0"
                value={vice.cost}
                onChange={e => updateVice(vice.id, 'cost', e.target.value)}
              />
            </div>
            <div className="w-32">
              <Label className="text-xs">Frequency</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={vice.frequency}
                onChange={e => updateVice(vice.id, 'frequency', e.target.value as Frequency)}
              >
                {FREQUENCY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={() => removeVice(vice.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <Button variant="outline" size="sm" onClick={addVice}>
          <Plus className="h-4 w-4 mr-1" />
          Add vice
        </Button>
      </div>

      {/* Results */}
      {totalMonthlySavings > 0 && (
        <>
          {/* Savings summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">
                ${Math.round(totalMonthlySavings).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Saved per month</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">
                ${Math.round(totalYearlySavings).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Saved per year</div>
            </div>
          </div>

          {/* Before / After comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Current plan */}
            <div className="rounded-lg p-4 bg-muted/50 border border-border">
              <h3 className="font-semibold mb-3">Current plan</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Debt free by</div>
                    <div className="font-medium">{formatDate(addMonths(new Date(), currentMonths))}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Total interest</div>
                    <div className="font-medium">${currentInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Time to freedom</div>
                    <div className="font-medium">{formatMonthsAsTime(currentMonths)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vice-free plan */}
            <div className="rounded-lg p-4 bg-green-500/10 border-2 border-green-500/30">
              <h3 className="font-semibold mb-3 text-green-600 dark:text-green-400">
                Without your vices
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Debt free by</div>
                    <div className="font-medium">{formatDate(addMonths(new Date(), viceMonths))}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Total interest</div>
                    <div className="font-medium">${viceInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Time to freedom</div>
                    <div className="font-medium">{formatMonthsAsTime(viceMonths)}</div>
                  </div>
                </div>
                {monthsSaved > 0 && (
                  <div className="pt-2 border-t border-border/50">
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <TrendingDown className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Save {formatMonthsAsTime(monthsSaved)} & ${interestSaved.toLocaleString(undefined, { maximumFractionDigits: 0 })} interest
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Per-vice breakdown */}
          {vices.filter(v => parseFloat(v.cost) > 0).length > 1 && (
            <div className="bg-muted/30 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Vice breakdown</h3>
              <div className="space-y-2">
                {vices
                  .filter(v => parseFloat(v.cost) > 0)
                  .map(vice => {
                    const cost = parseFloat(vice.cost)
                    const monthly = Math.round(toMonthly(cost, vice.frequency))
                    const yearly = Math.round(toYearly(cost, vice.frequency))
                    return (
                      <div key={vice.id} className="flex items-center justify-between text-sm">
                        <span className="font-medium">{vice.name || 'Unnamed vice'}</span>
                        <span className="text-muted-foreground">
                          ${monthly}/mo &middot; ${yearly.toLocaleString()}/yr
                        </span>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}

          {/* Motivational nudge */}
          {monthsSaved > 0 && (
            <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4 text-center">
              <p className="text-lg font-medium text-green-600 dark:text-green-400">
                Quitting your vices and putting ${Math.round(totalMonthlySavings).toLocaleString()}/month toward debt
                gets you debt-free {formatMonthsAsTime(monthsSaved)} sooner
                {interestSaved > 0 && ` and saves $${interestSaved.toLocaleString(undefined, { maximumFractionDigits: 0 })} in interest`}!
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                That's ${Math.round(totalYearlySavings).toLocaleString()} per year you're literally burning.
              </p>
            </div>
          )}

          {/* 10-year opportunity cost (from vices app logic) */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
            <h4 className="font-medium mb-2 text-amber-600 dark:text-amber-400">10-year opportunity cost</h4>
            <p className="text-sm text-muted-foreground">
              If you invested ${Math.round(totalMonthlySavings).toLocaleString()}/month at 7% annual return instead of spending it on
              vices, in 10 years you'd have approximately{' '}
              <span className="text-amber-500 font-medium">
                ${Math.round(
                  Array.from({ length: 120 }).reduce<number>((total, _, i) => {
                    return total + totalMonthlySavings * Math.pow(1 + 0.07 / 12, 120 - i)
                  }, 0)
                ).toLocaleString()}
              </span>.
            </p>
          </div>
        </>
      )}

      {vices.length > 0 && totalMonthlySavings <= 0 && (
        <div className="text-center py-4 text-muted-foreground text-sm">
          Enter a cost for your vices to see the impact on your debt payoff.
        </div>
      )}

      {vices.length === 0 && (
        <div className="text-center py-4 text-muted-foreground text-sm">
          Add a vice above or use a quick preset to get started.
        </div>
      )}
    </div>
  )
}
