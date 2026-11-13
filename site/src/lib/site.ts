export const APP_URL = '/app/'
export const REPO_URL = 'https://github.com/3stacks/debt-destroyer'
export const KOFI_URL = 'https://ko-fi.com/lukeboyle'

/**
 * The store pages. An empty value shows "Coming soon" in place of the link.
 * Set NEXT_PUBLIC_APP_STORE_URL and NEXT_PUBLIC_PLAY_STORE_URL at build time
 * when the apps are live.
 */
export const APP_STORE_URL = process.env.NEXT_PUBLIC_APP_STORE_URL?.trim() ?? ''
export const PLAY_STORE_URL = process.env.NEXT_PUBLIC_PLAY_STORE_URL?.trim() ?? ''

/** The public address of the site, for canonical URLs and the sitemap. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://debtdestroyer.app').replace(/\/+$/, '')
