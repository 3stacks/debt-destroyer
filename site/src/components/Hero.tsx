import Image from 'next/image'

import { GridPattern } from '@/components/GridPattern'
import { StoreButtons } from '@/components/StoreButtons'
import heroImage from '@/images/screens/track.png'

function Quote() {
  return (
    <figure className="relative mx-auto max-w-md text-center lg:mx-0 lg:text-left">
      <blockquote>
        <p className="font-display text-xl font-medium text-slate-900">
          Pay the minimum on each debt. Put every extra dollar on one debt.
          When you pay off that debt, add its payment to the next.
        </p>
      </blockquote>
      <figcaption className="mt-2 text-sm text-slate-500">
        <strong className="font-semibold text-brand-600">
          The snowball and avalanche methods
        </strong>{' '}
        in three steps
      </figcaption>
    </figure>
  )
}

export function Hero() {
  return (
    <header className="overflow-hidden bg-slate-100 lg:bg-transparent lg:px-5">
      <div className="mx-auto grid max-w-6xl grid-cols-1 grid-rows-[auto_1fr] gap-y-16 pt-16 md:pt-20 lg:grid-cols-12 lg:gap-y-20 lg:px-3 lg:pt-20 lg:pb-36 xl:py-32">
        <div className="relative flex items-end lg:col-span-5 lg:row-span-2">
          <div className="absolute -top-20 right-1/2 -bottom-12 left-0 z-10 rounded-br-6xl bg-brand-600 text-white/10 md:bottom-8 lg:-inset-y-32 lg:right-full lg:left-[-100vw] lg:-mr-40">
            <GridPattern x="100%" y="100%" patternTransform="translate(112 64)" />
          </div>
          <div className="relative z-10 mx-auto flex w-64 overflow-hidden rounded-3xl bg-slate-600 shadow-xl ring-8 ring-slate-900 md:w-72 lg:w-auto lg:max-w-xs">
            <Image
              className="w-full"
              src={heroImage}
              alt="Debt Destroyer on a phone: a plan two months in, ahead of schedule, with November ready to reconcile"
              priority
            />
          </div>
        </div>
        <div className="relative px-4 sm:px-6 lg:col-span-7 lg:pr-0 lg:pb-14 lg:pl-16 xl:pl-20">
          <div className="hidden lg:absolute lg:-top-32 lg:right-[-100vw] lg:bottom-0 lg:left-[-100vw] lg:block lg:bg-slate-100" />
          <Quote />
        </div>
        <div className="bg-white pt-16 lg:col-span-7 lg:bg-transparent lg:pt-0 lg:pl-16 xl:pl-20">
          <div className="mx-auto px-4 sm:px-6 md:max-w-2xl md:px-4 lg:px-0">
            <h1 className="font-display text-5xl font-extrabold text-slate-900 sm:text-6xl">
              See the end of your debt.
            </h1>
            <p className="mt-4 text-3xl text-slate-600">
              Debt Destroyer shows the month you become debt free. Then it
              keeps you on course: record what you pay each month, and see how
              far you are from the plan.
            </p>
            <StoreButtons label="hero" className="mt-8" />
            <p className="mt-4 text-base tracking-tight text-slate-500">
              Free. No account. Your numbers stay on your device.
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
