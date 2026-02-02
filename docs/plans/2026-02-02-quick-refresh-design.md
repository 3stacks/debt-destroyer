# Debt Destroyer Quick Refresh Design

## Goal

Modernize debt-destroyer after 6 years dormant: update dependencies, swap UI to shadcn/ui + Tailwind, convert to functional components, fix known bugs, add algorithm tests.

## Scope Boundaries

**In scope:**
- Dependency upgrades (React 18, TypeScript 5, Vite, date-fns 3)
- UI swap from Material-UI v4 to shadcn/ui + Tailwind
- Convert class components to functional + hooks
- Fix algorithm bugs (parseInt validation, floating-point precision)
- Add basic algorithm tests

**Out of scope (YAGNI):**
- State management library
- New features
- SSR/Next.js migration
- Backend changes

## Dependency Changes

| Category | Remove | Add |
|----------|--------|-----|
| Framework | react 16.8, react-dom 16.8 | react 18, react-dom 18 |
| Types | typescript 3.5, @types/react 16 | typescript 5.3+, @types/react 18 |
| UI | @material-ui/core, @material-ui/icons | tailwindcss, shadcn/ui components |
| Build | react-scripts 3.0.1 | vite |
| Utils | date-fns 1.30 | date-fns 3.x |
| Test | (none) | vitest |

**Keeping:** lodash, recharts, nanoid, query-string

## Component Migration

| Current File | Changes |
|--------------|---------|
| `src/components/app/app.tsx` | Class → functional with hooks. MUI → shadcn (Radio, TextField, Tabs). Remove withStyles. |
| `src/components/app/index.ts` | Delete |
| `src/components/debt-table/debt-table.tsx` | Class → functional. MUI → shadcn (Table, Input, Button). |
| `src/components/debt-table/index.ts` | Delete |
| `src/components/insights.tsx` | Class → functional. MUI → shadcn table. |
| `src/components/snowball-dialog.tsx` | MUI Dialog → shadcn Dialog. |
| `src/components/about-dialog.tsx` | MUI Dialog → shadcn Dialog. |
| `src/components/stacked-bar-chart.tsx` | Keep recharts. Update colors to Tailwind CSS variables. |
| `src/components/burndown-chart.tsx` | Keep as-is. |

**shadcn components needed:** button, input, table, dialog, tabs, radio-group, label

## Algorithm Fixes

### 1. parseInt → parseFloat
- **Location:** `app.tsx:352-375`
- **Fix:** Change `parseInt(newDebt.amount, 10)` to `parseFloat(newDebt.amount)` for amount, rate, repayment
- **Why:** Allows decimal currency values

### 2. Floating-point precision
- **Location:** Interest calculations in `utils/index.ts`
- **Fix:** Round currency to 2 decimal places during calculations
- **Approach:** Add `roundCurrency(n: number) => Math.round(n * 100) / 100`

### 3. Magic numbers → constants
- `12` → `MONTHS_PER_YEAR`
- `0.01` → `MINIMUM_PRINCIPAL_RATE`
- `300` → `DEBOUNCE_MS`

## Testing

**File:** `src/utils/index.test.ts`

**Coverage:**
- `sortByAmount()` - snowball ordering
- `sortByRate()` - avalanche ordering
- `calculateMonthlyInterest()` - basic math
- `calculateDebts()` snowball - full schedule
- `calculateDebts()` avalanche - full schedule
- Edge cases: single debt, zero interest, already paid

Target: 10-15 focused algorithm tests.

## Implementation Phases

### Phase 1: Build system migration
1. Initialize Vite + React 18 + TypeScript 5
2. Set up Tailwind CSS
3. Initialize shadcn/ui
4. Migrate existing source files
5. Update date-fns imports to v3 API

### Phase 2: Component conversion
1. Convert `app.tsx` to functional + hooks
2. Convert `debt-table.tsx` to functional
3. Convert `insights.tsx` to functional
4. Convert dialog components to functional
5. Remove all `withStyles` wrappers and `@ts-ignore`

### Phase 3: UI swap
1. Replace MUI with shadcn (one component at a time)
2. Apply Tailwind styling
3. Update chart colors to CSS variables

### Phase 4: Bug fixes & tests
1. Fix parseInt → parseFloat validation
2. Add roundCurrency helper
3. Extract magic numbers to constants
4. Write algorithm tests
5. Verify tests pass

### Phase 5: Cleanup
1. Remove MUI dependencies from package.json
2. Delete empty wrapper files
3. Manual smoke test
