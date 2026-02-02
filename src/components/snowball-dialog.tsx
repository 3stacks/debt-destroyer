import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface SnowballDialogProps {
  isOpen: boolean
  onCloseRequested: () => void
}

export default function SnowballDialog({
  isOpen,
  onCloseRequested
}: SnowballDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCloseRequested()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Debt payoff methods</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            Snowball method sorts debts by{' '}
            <em className="text-foreground">lowest to highest balance</em>
          </p>
          <p>
            Avalanche (or Stack) method sorts debts by{' '}
            <em className="text-foreground">highest to lowest interest rate</em>
          </p>
          <p>
            Avalanche is technically the most cost-effective method because you
            end up paying less interest overall. This isn't as much of an issue
            if all of your debts have low interest rates or if you're going to
            be paying them off quickly.
          </p>
          <p>
            While Snowball isn't the most cost-effective method, the
            psychological benefits of closing off accounts are well-documented
            and for most people, this is the best way to keep motivated and
            focused on your goals (hence, the snowball effect).
          </p>
          <p>
            Snowball was popularised by Dave Ramsey and the Harvard Business
            Review has recently noted that the Snowball method is the best
            strategy for paying off card debt. You can read that article here:{' '}
            <a
              href="https://hbr.org/2016/12/research-the-best-strategy-for-paying-off-credit-card-debt"
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              HBR Article
            </a>
          </p>
          <p>
            For more information about these methods, read:{' '}
            <a
              href="https://www.investopedia.com/articles/personal-finance/080716/debt-avalanche-vs-debt-snowball-which-best-you.asp"
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Investopedia Article
            </a>
          </p>
        </div>
        <DialogFooter>
          <Button onClick={onCloseRequested}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
