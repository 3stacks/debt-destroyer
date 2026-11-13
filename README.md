# Debt Destroyer

Debt Destroyer shows the month that you become debt free. It compares the snowball method and the
avalanche method. The phone app also tracks a plan month by month.

If Debt Destroyer helps you, you can support it on [Ko-fi](https://ko-fi.com/lukeboyle).

## Parts

| Folder | Content | Address |
|---|---|---|
| `site/` | The homepage, made with Next.js | `/` |
| `src/` | The web app, made with Vite and React | `/app/` |
| `mobile/` | The iOS and Android app, made with Expo | App Store and Google Play |

The web app and the mobile app use the same payoff engine in `src/utils`.

## Run

Use Node 24 or later.

```bash
npm install
npm run dev        # the web app on http://localhost:5173/app/
npm test
npm run site       # the homepage and the web app in site/out/
```

Read [site/README.md](site/README.md) for the homepage. Read [mobile/README.md](mobile/README.md)
for the mobile app.

## Old links

The web app was at the root before the homepage. A shared link in the old form `/?debts=...` still
works. The homepage sends it to `/app/` with the plan.

## Publish the site

The site is on Cloudflare Pages, in the project `debt-destroyer`. The workflows are the same as
the workflows of Hearers:

1. The Website workflow tests and builds `site/out/` for each push and each `pull request`.
2. A `pull request` gets a preview address.
3. After the Website workflow passes on `master`, the Deploy workflow deploys the same build.

Add the secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` to the repository. The token
needs the permission Account > Cloudflare Pages > Edit.

Analytics goes through a proxy in `functions/`. Set `ANALYTICS_FORWARDING_URL` and
`ANALYTICS_WEBSITE_ID` in the Pages project to turn it on. Add a custom domain to
`ANALYTICS_HOSTS`.
