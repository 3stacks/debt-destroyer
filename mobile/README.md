# Debt Destroyer for iOS and Android

This folder contains the Expo app (SDK 58) for Debt Destroyer. The app uses the payoff engine of the
web app in `../src/utils`, so the payoff dates in the two apps agree.

## Screens

| Tab | Content |
|---|---|
| Plan | The debts, the payoff method and the extra monthly amount. After you start the plan, this tab tracks it. |
| Chart | The payments for each month, stacked by debt. Tap a bar to see that month. |
| Insights | The payoff date, the payoff order and the effect of larger payments. |
| Invest | The opportunity cost of the debt and the future wealth after payoff. |
| Vices | The effect of a vice on the payoff date. |

The web app keeps its state in the URL. This app keeps its state on the device in AsyncStorage. The
app does not send data to a server.

## Track a plan

1. Make the plan on the Plan tab.
2. Choose the first payment month: this month or next month. Then tap **Start**. The app saves the
   plan as version 1.
3. At the end of each month, tap **Reconcile**. Enter the amount that you actually paid on each
   debt. If you paid the planned amounts, tap **I paid the planned amounts**. If the statement shows
   a different balance, enter that statement balance.
4. The Plan tab then shows the difference from the plan for each month and in total. It also shows
   the payoff date for your actual payments.
5. Tap **Revise plan** to change the plan. The revision starts in the last reconciled month or in
   the next month, from your actual balances. To add a debt to a month that you reconciled, start
   the revision in that month. The app keeps the earlier versions and compares the forecast with
   the original plan.

While a plan is active, the other tabs show the forecast from your actual balances.

### More for a started plan

- Tap a debt to see its details: the balance, the rate, each month and a timeline.
- Refinanced a debt? Revise the plan and change the rate of the debt. The months before the revision
  keep the old rate.
- Rolled debts into one loan? Revise the plan and tap **Consolidate debts**. The old debts keep
  their history, and the new loan links to them.
- In the last 12 payments, a countdown shows the payments to go.
- **Play the journey** replays each month of the plan. When the plan is finished, the replay ends
  with confetti.
- **Share progress** makes an image to share. It shows percentages, unless you choose dollar
  amounts. For TikTok, Reels or Shorts, play the journey for a recording. The controls stay hidden
  until the end.

The logic is in `src/lib/tracking.ts`. Its tests are in `src/lib/tracking.test.ts`.

## Requirements

- Node 24 or later.
- Expo Go on a phone, or an iOS simulator or Android emulator.

## Run the app

```bash
cd mobile
npm install
npm start          # scan the QR code with Expo Go
```

Run the web target on port 8082 for a quick check in a browser:

```bash
npm run web
```

## Checks

```bash
npm run typecheck
npm test
```

## Shared code

`metro.config.js` adds `../src` to the folders that Metro watches. The resolver changes `nanoid` to
`nanoid/non-secure`, because Hermes has no `crypto.getRandomValues`. Add each package that the
shared code imports to `package.json` in this folder, because an EAS build installs only this folder.

The engine in `../src/utils` recurses once for each month. A plan with payments that do not cover
the interest never ends. `runPlan` in `src/lib/metrics.ts` finds this case before it calls the
engine. Do not call `calculateDebts` directly.

## Build for the stores

```bash
npx eas-cli build --profile production --platform all
npx eas-cli submit --platform ios
```

Before the first build, run `npx eas-cli init` to link the project.

## Icon

The source files for the icon are in `assets/icon-src/`. The icon shows three bars that fall to a
check mark: the debt goes down to zero. To change the icon, edit the SVG files and render each one
at 1024 px. Android uses three layers: a foreground, a background and a monochrome version.
