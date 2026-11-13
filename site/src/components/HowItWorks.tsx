import Image, { type StaticImageData } from 'next/image'

import { Container } from '@/components/Container'
import { SectionHeading } from '@/components/SectionHeading'
import chartImage from '@/images/screens/chart.png'
import planImage from '@/images/screens/plan.png'
import reconcileImage from '@/images/screens/reconcile.png'
import reviseImage from '@/images/screens/revise.png'

const steps: { title: string; description: string; image: StaticImageData; alt: string }[] = [
  {
    title: 'Plan',
    description:
      'Add each debt with its balance, rate and minimum repayment. Choose a method and an extra monthly amount.',
    image: planImage,
    alt: 'The plan screen with three debts and a debt-free date of April 2029',
  },
  {
    title: 'See',
    description:
      'See each payment, month by month. When one debt closes, its payment rolls on to the next debt.',
    image: chartImage,
    alt: 'A stacked bar chart of the monthly payments for each debt',
  },
  {
    title: 'Reconcile',
    description:
      'At the end of the month, enter what you paid. Each field starts at the planned amount.',
    image: reconcileImage,
    alt: 'The reconcile screen for November, with one payment under the plan',
  },
  {
    title: 'Revise',
    description:
      'Off course? Revise the plan from your real balances. The app keeps your history and your original date.',
    image: reviseImage,
    alt: 'The revise screen, which compares the revised plan with the original plan',
  },
]

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-title"
      className="scroll-mt-14 py-16 sm:scroll-mt-32 sm:py-20 lg:py-32"
    >
      <Container>
        <SectionHeading number="1" id="how-it-works-title">
          How it works
        </SectionHeading>
        <p className="mt-8 font-display text-4xl font-bold tracking-tight text-slate-900">
          Make a plan once. Check it each month.
        </p>
        <p className="mt-4 text-lg tracking-tight text-slate-700">
          The check takes a minute. It tells you if you are ahead of the plan
          or behind it, in months and in dollars.
        </p>
      </Container>
      <Container size="lg" className="mt-16">
        <ol
          role="list"
          className="grid grid-cols-1 gap-x-8 gap-y-10 [counter-reset:stage] sm:grid-cols-2 lg:grid-cols-4"
        >
          {steps.map((step) => (
            <li key={step.title} className="[counter-increment:stage]">
              <div className="relative flex h-72 items-start justify-center overflow-hidden rounded-2xl bg-brand-600 px-6 pt-6 shadow-lg">
                <Image
                  src={step.image}
                  alt={step.alt}
                  className="w-full rounded-t-lg shadow-md"
                  sizes="(min-width: 1024px) 18rem, (min-width: 640px) 50vw, 100vw"
                />
              </div>
              <h3 className="mt-8 text-base font-medium tracking-tight text-slate-900 before:mb-2 before:block before:font-mono before:text-sm before:text-slate-500 before:content-[counter(stage,decimal-leading-zero)]">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600">{step.description}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
