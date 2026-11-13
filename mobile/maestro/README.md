# End-to-end tests

The flows in `flows/` test the app as a user does: they tap, type and read the screen. Maestro runs
them on an iOS simulator and on an Android emulator, so you can watch each scenario. CI runs the
same flows on both platforms.

| Flow | Scenario |
|---|---|
| `01-create-plan` | Add two debts, choose the avalanche method, and start the plan |
| `02-reconcile` | Reconcile a month, and pay less than the plan on one debt |
| `03-refinance` | Refinance a debt after three months, and keep its history |
| `04-consolidate` | Consolidate two debts into one loan |
| `05-add-debt-to-reconciled-month` | Add a debt to a month that is already reconciled |
| `06-countdown` | Show the countdown near the end of the plan |
| `07-payoff-journey` | Finish the plan, play the journey and share it |
| `08-creator-share` | Make a share card, and a clean replay for a screen recording |

## Scenarios

Each flow starts with a scenario from `src/e2e/scenarios.ts`. The seed link loads it:

```text
debtdestroyer://e2e/seed?scenario=three-months
```

A scenario also fixes the clock to November 2026, so the month names in the flows never change.
The seed link works only in a test build, which has `EXPO_PUBLIC_E2E=1`. In a store build, the link
shows a message and changes nothing.

`src/e2e/scenarios.test.ts` checks the facts that the flows need, for example "November is due".

## Watch the flows on your devices

1. Install Maestro: `curl -fsSL "https://get.maestro.mobile.dev" | bash`.
2. Open an iOS simulator, an Android emulator, or both.
3. Install a test build on each device:

   ```bash
   npm run ios:e2e
   npm run android:e2e
   ```

4. Run the flows:

   ```bash
   npm run e2e:ios
   npm run e2e:android
   npm run e2e:both     # both devices at the same time
   ```

To run one flow, give its file: `scripts/e2e.sh ios maestro/flows/03-refinance.yaml`.

To use Expo Go on iOS in place of a test build, run `npm run start:e2e`, open the app in Expo Go,
and then run `scripts/e2e.sh expo-go-ios`.

Screenshots go to `maestro-output/`.

## Run the flows in a browser

`e2e-web/run.mjs` runs the same flows in Chromium, against the web build. It needs no simulator.
It knows the Maestro commands that the flows use. A flow with a new command fails there, so add the
command to the runner too.

```bash
npm run e2e:web
```

## CI

`.github/workflows/e2e.yml` runs three jobs for each change to the mobile app:

1. **web**: the type check, the unit tests and the flows in Chromium.
2. **android**: a release build on an Android emulator.
3. **ios**: a release build on an iOS simulator.

The Android and iOS jobs start after the web job passes. Each job uploads its screenshots and a
JUnit report.

## Write a flow

- Find an input or a button by its `testID`, for example `tapOn: { id: debt-rate }`. Maestro reads
  `testID` on iOS and Android, and the web build turns it into `data-testid`.
- Match text with a regular expression. The expression must match the whole text.
- A section header shows in capital letters. Find the row below it by its `testID`.
- Start with `runFlow: ../common/seed.yaml` and a scenario. Add a scenario to
  `src/e2e/scenarios.ts` if no scenario fits.
