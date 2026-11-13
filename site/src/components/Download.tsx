import clsx from 'clsx'

import { CheckIcon } from '@/components/CheckIcon'
import { Container } from '@/components/Container'
import { GridPattern } from '@/components/GridPattern'
import { SectionHeading } from '@/components/SectionHeading'
import { StoreButtons } from '@/components/StoreButtons'

function Way({
  name,
  description,
  features,
  featured = false,
}: {
  name: string
  description: string
  features: string[]
  featured?: boolean
}) {
  return (
    <div
      className={clsx(
        'relative px-4 py-16 sm:rounded-5xl sm:px-10 md:py-12 lg:px-12',
        featured && 'bg-brand-600 sm:shadow-lg',
      )}
    >
      {featured && (
        <div className="absolute inset-0 mask-[linear-gradient(white,transparent)] text-white/10">
          <GridPattern x="50%" y="50%" />
        </div>
      )}
      <div className="relative flex flex-col">
        <h3 className={clsx('text-lg font-semibold tracking-tight', featured ? 'text-white' : 'text-slate-900')}>
          {name}
        </h3>
        <p className={clsx('mt-2 text-lg tracking-tight', featured ? 'text-white' : 'text-slate-600')}>
          {description}
        </p>
        <ul
          role="list"
          className={clsx(
            'mt-8 -my-2 divide-y text-base tracking-tight',
            featured ? 'divide-white/10 text-white' : 'divide-slate-200 text-slate-900',
          )}
        >
          {features.map((feature) => (
            <li key={feature} className="flex py-2">
              <CheckIcon className={clsx('h-8 w-8 flex-none', featured ? 'fill-white' : 'fill-slate-600')} />
              <span className="ml-4">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function Download() {
  return (
    <section
      id="download"
      aria-labelledby="download-title"
      className="scroll-mt-14 pt-16 pb-8 sm:scroll-mt-32 sm:pt-20 sm:pb-10 lg:pt-32 lg:pb-16"
    >
      <Container>
        <SectionHeading number="3" id="download-title">
          Get it
        </SectionHeading>
        <p className="mt-8 font-display text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
          Free, on your phone or on the web
        </p>
        <p className="mt-4 max-w-xl text-lg tracking-tight text-slate-600">
          The web app makes a plan in a minute. The phone app also keeps the
          plan, so that you can check in each month.
        </p>
        <StoreButtons label="download" className="mt-8" />
      </Container>
      <div className="mx-auto mt-16 max-w-5xl lg:px-6">
        <div className="grid bg-slate-50 sm:px-6 sm:pb-16 md:grid-cols-2 md:rounded-6xl md:px-8 md:pt-16 lg:p-20">
          <Way
            featured
            name="iPhone and Android"
            description="Make the plan, then track it month by month."
            features={[
              'Start a plan and reconcile each month',
              'See how far you are from the plan',
              'Revise the plan from your real balances',
              'Your plan stays on your phone',
            ]}
          />
          <Way
            name="Web"
            description="Open it in any browser. Nothing to install."
            features={[
              'The snowball and avalanche methods',
              'Your debt-free date and the interest',
              'Insights, opportunity cost and vices',
              'Share a plan with a link',
            ]}
          />
        </div>
      </div>
    </section>
  )
}
