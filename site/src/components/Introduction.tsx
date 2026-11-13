import { CheckIcon } from '@/components/CheckIcon'
import { Container } from '@/components/Container'
import { APP_URL } from '@/lib/site'

export function Introduction() {
  return (
    <section
      id="introduction"
      aria-label="Introduction"
      className="pt-20 pb-16 sm:pb-20 md:pt-36 lg:py-32"
    >
      <Container className="text-lg tracking-tight text-slate-700">
        <p className="font-display text-4xl font-bold tracking-tight text-slate-900">
          A plan is easy to make. It is hard to keep.
        </p>
        <p className="mt-4">
          Many people cannot see a light at the end of their debt. A payoff
          date makes the end real. But a real month brings a car repair or a
          birthday, and you pay less than the plan. Most calculators then
          leave you with a date that is no longer true.
        </p>
        <p className="mt-4">
          Debt Destroyer starts with your plan. At the end of each month, you
          enter what you paid. The app shows the difference from the plan,
          and the payoff date that your real payments give. When your life
          changes, revise the plan from your real balances.
        </p>
        <ul role="list" className="mt-8 space-y-3">
          {[
            'The snowball method or the avalanche method, side by side',
            'Your debt-free month, and the interest that you pay until then',
            'A monthly check-in that takes one tap when you pay as planned',
            'The cost of your debt in lost investment, and the cost of a habit',
            'No account, no advertisements. Your numbers never leave your device',
          ].map((feature) => (
            <li key={feature} className="flex">
              <CheckIcon className="h-8 w-8 flex-none fill-brand-500" />
              <span className="ml-4">{feature}</span>
            </li>
          ))}
        </ul>
        <p className="mt-10">
          <a
            href={APP_URL}
            className="text-base font-medium text-brand-600 hover:text-brand-800"
            data-event="Open app"
            data-event-label="introduction"
          >
            Make your plan now <span aria-hidden="true">&rarr;</span>
          </a>
        </p>
      </Container>
    </section>
  )
}
