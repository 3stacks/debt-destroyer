import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface AboutDialogProps {
  isOpen: boolean
  onCloseRequested: () => void
}

export default function AboutDialog({
  isOpen,
  onCloseRequested
}: AboutDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCloseRequested()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>About Debt Destroyer</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            Debt Destroyer was created by{' '}
            <a
              href="https://lukeboyle.com"
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Luke Boyle
            </a>
            . Many people have a hard time seeing a light at the end of their
            debt tunnel. This app gives accurate visualisations to show people
            that they can be debt free with their current budget. To report an
            issue, visit the Github repo at{' '}
            <a
              href="https://github.com/3stacks/debt-destroyer"
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/3stacks/debt-destroyer
            </a>
            .
          </p>
          <p>
            If you are not sure where or how to get started,{' '}
            <a
              href="https://www.amazon.com/Dave-Ramsey/e/B000APQ02W"
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Dave Ramsey
            </a>{' '}
            has an extremely comprehensive library of books to help beginners
            get started (consider the Total Money Makeover as a starting point).
          </p>
          <p>
            If you are having trouble finding extra room in your budget to
            contribute more to crushing your debts, think about any unnecessary
            vices you might be able to cut out. Keep in mind, it's probably not
            your 1-a-day latte habit keeping you in debt. The bigger culprits
            are larger, hidden expenses like unused gym memberships, smoking
            habits, a plethora of streaming service subscriptions.
          </p>
        </div>
        <DialogFooter>
          <Button onClick={onCloseRequested}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
