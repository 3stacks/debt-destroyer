import Link from 'next/link'

import { GridPattern } from '@/components/GridPattern'
import { APP_STORE_URL, APP_URL, AUTHOR_URL, KOFI_URL, PLAY_STORE_URL, REPO_URL } from '@/lib/site'

export function Footer() {
  return (
    <footer className="relative pt-5 pb-20 sm:pt-14 sm:pb-32">
      <div className="absolute inset-x-0 top-0 h-32 mask-[linear-gradient(white,transparent)] text-slate-900/10">
        <GridPattern x="50%" />
      </div>
      <div className="relative flex flex-col items-center gap-4 text-center text-sm text-slate-600">
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 font-medium text-slate-900">
          <Link href="/?home">Home</Link>
          <a href={APP_URL}>Open the web app</a>
          {APP_STORE_URL ? <a href={APP_STORE_URL}>App Store</a> : null}
          {PLAY_STORE_URL ? <a href={PLAY_STORE_URL}>Google Play</a> : null}
          <Link href={REPO_URL}>GitHub</Link>
          <Link href={KOFI_URL}>Ko-fi</Link>
        </nav>
        <p>
          Made by{' '}
          <a href={AUTHOR_URL} className="underline hover:text-slate-900">
            Luke Boyle
          </a>
          . Free to use. This app is not financial advice.</p>
      </div>
    </footer>
  )
}
