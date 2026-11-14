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

The Pages project is also connected to the repository in Cloudflare. That build runs
`npm run build` and publishes `dist/`. In that build, `scripts/cf-pages.mjs` puts the full site in
`dist/`, so the two deploys publish the same files.

Analytics goes through a proxy in `functions/`. Set `ANALYTICS_FORWARDING_URL` and
`ANALYTICS_WEBSITE_ID` in the Pages project to turn it on. The proxy counts `debtdestroyer.app`
and `debt-destroyer.pages.dev`. Add another domain to `ANALYTICS_HOSTS`. The phone app sends its
usage counts to the same proxy (see `mobile/README.md`).

## Licence

Copyright © 2017–2026 Luke Boyle.

Debt Destroyer is under the **GNU Affero General Public License v3.0** (AGPLv3). See
[LICENSE](LICENSE). You can use, host, study, change and share Debt Destroyer. If you run a changed
version as a network service, you must give its users the matching source. See section 13 of the
AGPL.

The homepage design in `site/` comes from the Primer template of Tailwind Plus. The AGPL does not
apply to the parts of that template. [site/LICENSE.md](site/LICENSE.md) holds their licence.
