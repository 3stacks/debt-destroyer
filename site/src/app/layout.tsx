import { type Metadata } from 'next'
import { Inter } from 'next/font/google'
import clsx from 'clsx'

import { ANALYTICS_LOADER } from '@/lib/analytics'
import { SITE_URL } from '@/lib/site'
import '@/styles/tailwind.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Debt Destroyer: see the end of your debt',
    template: '%s | Debt Destroyer',
  },
  description:
    'Plan your debt payoff with the snowball or avalanche method, see your debt-free date, and track each month against the plan. Free on the web, iPhone and Android.',
  icons: { icon: '/icon.png', apple: '/icon.png' },
}

// The web app was at the root before the homepage. An old shared link such as
// "/?debts=..." goes to the app with its plan. A visitor who uses the app also
// goes straight to it. "/?home" and a link from inside the app show the homepage.
const openApp = `try{var q=location.search,r=document.referrer?new URL(document.referrer):null;if(location.pathname==='/'&&/[?&]debts=/.test(q))location.replace('/app/'+q);else if(location.pathname==='/'&&localStorage.getItem('debt-destroyer.uses-app')==='1'&&!/[?&]home\\b/.test(q)&&!location.hash&&!(r&&r.origin===location.origin&&r.pathname.indexOf('/app')===0))location.replace('/app/')}catch(e){}`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={clsx(
        'h-full scroll-smooth bg-white antialiased',
        inter.variable,
      )}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: openApp }} />
        <script dangerouslySetInnerHTML={{ __html: ANALYTICS_LOADER }} />
        <link
          rel="preconnect"
          href="https://cdn.fontshare.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@800,500,700&display=swap"
        />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  )
}
