import Image, { type StaticImageData } from 'next/image'

import { Container } from '@/components/Container'
import { SectionHeading } from '@/components/SectionHeading'
import insightsImage from '@/images/screens/insights.png'
import investImage from '@/images/screens/invest.png'
import vicesImage from '@/images/screens/vices.png'

const features: { title: string; description: string; image: StaticImageData; alt: string }[] = [
  {
    title: 'What if you paid more?',
    description:
      'See your payoff order, and what 10%, 25% or 50% more each month does to your date and your interest.',
    image: insightsImage,
    alt: 'The insights screen with the payoff order and three scenarios',
  },
  {
    title: 'The real cost of debt',
    description:
      'See what your payments can become if you invest them instead. Then see the wealth that you build after the last payment.',
    image: investImage,
    alt: 'A chart of future wealth when you invest after you are debt free',
  },
  {
    title: 'Quit a vice',
    description:
      'Add a habit such as coffee or takeaway. See how much sooner you are debt free when that money goes to your debt.',
    image: vicesImage,
    alt: 'The vices screen with coffee and takeaway, which save $353 a month',
  },
]

export function Features() {
  return (
    <section
      id="features"
      aria-labelledby="features-title"
      className="scroll-mt-14 overflow-x-clip py-16 sm:scroll-mt-32 sm:py-20 lg:py-32"
    >
      <Container>
        <SectionHeading number="2" id="features-title">
          Features
        </SectionHeading>
        <p className="mt-8 font-display text-4xl font-bold tracking-tight text-slate-900">
          Find the money that gets you there sooner.
        </p>
        <p className="mt-4 text-lg tracking-tight text-slate-700">
          A small change each month can take years off your debt. These tools
          show you where the change is.
        </p>
      </Container>
      <Container size="lg" className="mt-16">
        <ol
          role="list"
          className="-mx-3 grid grid-cols-1 gap-y-10 lg:grid-cols-3 lg:text-center xl:-mx-12 xl:divide-x xl:divide-slate-400/20"
        >
          {features.map((feature) => (
            <li
              key={feature.title}
              className="grid auto-rows-min grid-cols-1 items-center gap-8 px-3 sm:grid-cols-2 sm:gap-y-10 lg:grid-cols-1 xl:px-12"
            >
              <div className="relative h-72 overflow-hidden rounded-2xl bg-slate-100 shadow-lg sm:h-80">
                <Image
                  src={feature.image}
                  alt={feature.alt}
                  className="absolute inset-0 h-full w-full object-cover object-top"
                  sizes="(min-width: 1280px) 21rem, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
              </div>
              <div>
                <h3 className="text-base font-medium tracking-tight text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
