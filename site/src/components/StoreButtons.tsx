import clsx from 'clsx'

import { APP_STORE_URL, APP_URL, PLAY_STORE_URL } from '@/lib/site'

function AppleIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M16.37 12.6c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.7-3.18-1.73-1.35-.14-2.64.8-3.33.8-.69 0-1.74-.78-2.87-.76-1.47.02-2.83.86-3.59 2.18-1.53 2.66-.39 6.6 1.1 8.75.73 1.05 1.6 2.24 2.73 2.2 1.1-.05 1.51-.71 2.84-.71 1.32 0 1.7.71 2.86.69 1.18-.02 1.93-1.07 2.65-2.13.84-1.22 1.18-2.4 1.2-2.46-.03-.01-2.3-.88-2.32-3.5ZM14.2 6.1c.6-.73 1.01-1.75.9-2.76-.87.04-1.92.58-2.54 1.31-.56.64-1.05 1.67-.92 2.66.97.08 1.96-.49 2.56-1.21Z" />
    </svg>
  )
}

function PlayIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M4.5 2.9c-.3.3-.5.8-.5 1.4v15.4c0 .6.2 1.1.5 1.4l8.6-9.1L4.5 2.9Zm9.6 10.1 2.6 2.7-10.8 6.1c-.5.3-1 .3-1.3.1l9.5-8.9Zm0-2L4.6 2.1c.3-.2.8-.2 1.3.1l10.8 6.1-2.6 2.7Zm3.6-1.8 3 1.7c.9.5.9 1.7 0 2.2l-3 1.7-2.8-2.8 2.8-2.8Z" />
    </svg>
  )
}

function WebIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.7 3.6 5.6 3.6 9s-1.1 6.3-3.6 9c-2.5-2.7-3.6-5.6-3.6-9S9.5 5.7 12 3Z" />
    </svg>
  )
}

function StoreButton({
  href,
  icon: Icon,
  small,
  big,
  event,
  label,
  dark,
}: {
  href: string
  icon: (props: React.ComponentPropsWithoutRef<'svg'>) => React.ReactElement
  small: string
  big: string
  event: string
  label: string
  dark: boolean
}) {
  const soon = href === ''
  const className = clsx(
    'inline-flex min-w-44 items-center gap-3 rounded-xl px-4 py-2 text-left transition',
    dark
      ? 'bg-slate-900 text-white hover:bg-slate-700'
      : 'bg-white text-slate-900 ring-1 ring-slate-200 hover:ring-slate-300',
    soon && 'cursor-default opacity-60 hover:bg-slate-900',
  )
  const content = (
    <>
      <Icon className="h-7 w-7 flex-none" />
      <span className="flex flex-col leading-tight">
        <span className="text-xs">{soon ? 'Coming soon to' : small}</span>
        <span className="text-lg font-semibold tracking-tight">{big}</span>
      </span>
    </>
  )
  if (soon) {
    return (
      <span className={className} aria-label={`${big}: coming soon`}>
        {content}
      </span>
    )
  }
  return (
    <a className={className} href={href} data-event={event} data-event-label={label}>
      {content}
    </a>
  )
}

/** The three ways to get Debt Destroyer: the web app and the two stores. */
export function StoreButtons({ label, className }: { label: string; className?: string }) {
  return (
    <div className={clsx('flex flex-wrap gap-3', className)}>
      <StoreButton href={APP_URL} icon={WebIcon} small="Use it now on the" big="Web" event="Open app" label={label} dark={false} />
      <StoreButton href={APP_STORE_URL} icon={AppleIcon} small="Download on the" big="App Store" event="App Store" label={label} dark />
      <StoreButton href={PLAY_STORE_URL} icon={PlayIcon} small="Get it on" big="Google Play" event="Google Play" label={label} dark />
    </div>
  )
}
