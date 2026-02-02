import { useState, useEffect, useRef, useCallback } from 'react'
import throttle from 'lodash/throttle'
import debounce from 'lodash/debounce'
import { HelpCircle } from 'lucide-react'
import queryString from 'query-string'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import AboutDialog from '../about-dialog'
import SnowballDialog from '../snowball-dialog'
import DebtTable from '../debt-table/debt-table'
import StackedBarChart from '../stacked-bar-chart'
import Insights from '../insights'
import {
  calculateDebts,
  IRepaymentSchedule,
  parseChartData,
  DEBT_PAYOFF_METHODS,
  IDebt
} from '../../utils'
import { DEBOUNCE_MS } from '../../constants'

function parseQueryStringParameter(
  parameter: string | (string | null)[] | null | undefined,
  defaultValue?: string
): string {
  if (!parameter && defaultValue) {
    return defaultValue
  }
  if (Array.isArray(parameter)) {
    return parameter[0] ?? ''
  }
  if (typeof parameter === 'string') {
    return parameter
  }
  return ''
}

export default function App() {
  const wrapperRef = useRef<HTMLDivElement>(null)

  const [isViewReady, setIsViewReady] = useState(false)
  const [isAboutDialogOpen, setIsAboutDialogOpen] = useState(false)
  const [isSnowballDialogOpen, setIsSnowballDialogOpen] = useState(false)
  const [debts, setDebts] = useState<IDebt[]>([])
  const [extraContributions, setExtraContributions] = useState('0')
  const [debtData, setDebtData] = useState<IRepaymentSchedule | null>(null)
  const [debtPayoffMethod, setDebtPayoffMethod] = useState<DEBT_PAYOFF_METHODS>(
    DEBT_PAYOFF_METHODS.SNOWBALL
  )
  const [wrapperWidth, setWrapperWidth] = useState(0)

  const backupState = useCallback(() => {
    const query = queryString.stringify({
      extraContributions,
      debts: JSON.stringify(debts),
      debtPayoffMethod
    })
    window.history.pushState({}, '', `/?${query}`)
  }, [extraContributions, debts, debtPayoffMethod])

  const calculate = useCallback(
    debounce((currentDebts: IDebt[], method: DEBT_PAYOFF_METHODS, extra: string) => {
      const extraValue = parseInt(extra, 10)
      if (Number.isNaN(extraValue) || extraValue < 0) {
        return
      }
      setDebtData(
        calculateDebts({
          debts: currentDebts,
          debtMethod: method,
          extraContributions: extraValue
        })
      )
    }, DEBOUNCE_MS),
    []
  )

  const handleResize = useCallback(() => {
    if (wrapperRef.current) {
      setWrapperWidth(wrapperRef.current.getBoundingClientRect().width)
    }
  }, [])

  // Restore state from URL on mount
  useEffect(() => {
    const queryParams = queryString.parse(window.location.search)
    const debtsParam = parseQueryStringParameter(queryParams.debts)
    const payoffMethod = parseQueryStringParameter(
      queryParams.debtPayoffMethod as string,
      DEBT_PAYOFF_METHODS.SNOWBALL
    )
    const extraParam = parseQueryStringParameter(queryParams.extraContributions, '0')

    const parsedDebts = debtsParam === '' ? [] : JSON.parse(debtsParam)
    const validMethod =
      payoffMethod !== DEBT_PAYOFF_METHODS.SNOWBALL &&
      payoffMethod !== DEBT_PAYOFF_METHODS.AVALANCHE
        ? DEBT_PAYOFF_METHODS.SNOWBALL
        : (payoffMethod as DEBT_PAYOFF_METHODS)

    setDebts(parsedDebts)
    setExtraContributions(extraParam)
    setDebtPayoffMethod(validMethod)
    setIsViewReady(true)

    // Initial calculation
    calculate(parsedDebts, validMethod, extraParam)
  }, [calculate])

  // Handle resize
  useEffect(() => {
    handleResize()
    const throttledResize = throttle(handleResize, DEBOUNCE_MS)
    window.addEventListener('resize', throttledResize)
    return () => window.removeEventListener('resize', throttledResize)
  }, [handleResize])

  // Backup state when relevant values change
  useEffect(() => {
    if (isViewReady) {
      backupState()
    }
  }, [debts, extraContributions, debtPayoffMethod, isViewReady, backupState])

  const handleMethodChange = (value: string) => {
    setDebtPayoffMethod(value as DEBT_PAYOFF_METHODS)
    calculate(debts, value as DEBT_PAYOFF_METHODS, extraContributions)
  }

  const handleExtraContributionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setExtraContributions(value)
    calculate(debts, debtPayoffMethod, value)
  }

  const handleDebtChanged = (newDebts: IDebt[]) => {
    setDebts(newDebts)
    calculate(newDebts, debtPayoffMethod, extraContributions)
  }

  if (!isViewReady) {
    return null
  }

  return (
    <div className="min-h-screen">
      <header className="bg-primary text-primary-foreground py-4 px-6 flex items-center justify-between">
        <div className="w-10" />
        <h1 className="text-xl font-semibold">Debt Destroyer</h1>
        <Button
          variant="ghost"
          size="icon"
          className="text-primary-foreground hover:bg-primary/90"
          onClick={() => setIsAboutDialogOpen(true)}
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6" ref={wrapperRef}>
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="space-y-3">
            <Label className="text-base font-medium">Debt payoff method</Label>
            <RadioGroup
              value={debtPayoffMethod}
              onValueChange={handleMethodChange}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="snowball" id="snowball" />
                <Label htmlFor="snowball" className="font-normal cursor-pointer">
                  Snowball
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="avalanche" id="avalanche" />
                <Label htmlFor="avalanche" className="font-normal cursor-pointer">
                  Avalanche
                </Label>
              </div>
            </RadioGroup>
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsSnowballDialogOpen(true)}
            >
              What is this?
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="extra">Extra contributions</Label>
            <Input
              id="extra"
              type="number"
              min="0"
              startAdornment="$"
              value={extraContributions}
              onChange={handleExtraContributionsChange}
              helperText="How much extra can you afford per month?"
            />
          </div>
        </div>

        <DebtTable
          initialDebtState={debts}
          onDebtChanged={handleDebtChanged}
        />

        {debtData && (
          <Card>
            <Tabs defaultValue="chart">
              <CardContent className="pt-6">
                <TabsList className="mb-4">
                  <TabsTrigger value="chart">Chart</TabsTrigger>
                  <TabsTrigger value="insights">Insights</TabsTrigger>
                </TabsList>
                <TabsContent value="chart">
                  <StackedBarChart
                    width={wrapperWidth}
                    months={parseChartData(debtData)}
                    debts={debts}
                  />
                </TabsContent>
                <TabsContent value="insights">
                  <Insights
                    extraContributions={extraContributions}
                    debtPayoffMethod={debtPayoffMethod}
                    debtData={debtData}
                    debts={debts}
                  />
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        )}
      </main>

      <AboutDialog
        isOpen={isAboutDialogOpen}
        onCloseRequested={() => setIsAboutDialogOpen(false)}
      />
      <SnowballDialog
        isOpen={isSnowballDialogOpen}
        onCloseRequested={() => setIsSnowballDialogOpen(false)}
      />
    </div>
  )
}
