# Debt Destroyer website

The homepage. Next.js builds a static export to `out/`. Run `npm run site` at the repository root
to build the web app and the homepage together. That command puts the web app in `out/app/`.

```bash
npm install
npm run dev      # the homepage on http://localhost:3000, without the web app
```

## Store links

The App Store and Google Play buttons show "Coming soon" until you give the store addresses. Set
these variables at build time, for example in the Website workflow:

- `NEXT_PUBLIC_APP_STORE_URL`
- `NEXT_PUBLIC_PLAY_STORE_URL`

## Screenshots

The screenshots in `src/images/screens/` come from the mobile app. Each one is 780 × 1688 px.

## Licence

The design comes from the Primer template of Tailwind Plus. `LICENSE.md` holds the licence of the
template.
