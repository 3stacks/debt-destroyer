# Quick Refresh Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Modernize debt-destroyer with Vite, React 18, shadcn/ui + Tailwind, functional components, bug fixes, and algorithm tests.

**Architecture:** Replace CRA with Vite for build tooling. Swap Material-UI components with shadcn/ui equivalents. Convert class components to functional with hooks. Keep existing algorithm logic but fix bugs and add tests.

**Tech Stack:** Vite, React 18, TypeScript 5, Tailwind CSS, shadcn/ui, Recharts, Vitest

---

## Task 1: Initialize Vite + React 18 + TypeScript

**Files:**
- Delete: `package.json`, `tsconfig.json`, `public/index.html`
- Create: `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `index.html`

**Step 1: Remove old config files and CRA artifacts**

```bash
cd /Users/luke/Sites/debt-destroyer/.worktrees/quick-refresh
rm -rf node_modules package.json yarn.lock tsconfig.json public/index.html src/react-app-env.d.ts src/sw.ts
```

**Step 2: Initialize new package.json**

Create `package.json`:
```json
{
  "name": "debt-destroyer",
  "version": "2.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "recharts": "^2.15.0",
    "date-fns": "^3.6.0",
    "nanoid": "^5.0.9",
    "query-string": "^9.1.1",
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "@types/lodash": "^4.17.13",
    "@types/node": "^22.10.7",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "^5.7.3",
    "vite": "^6.0.7",
    "vitest": "^2.1.8"
  }
}
```

**Step 3: Create tsconfig.json**

Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Step 4: Create tsconfig.node.json**

Create `tsconfig.node.json`:
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

**Step 5: Create vite.config.ts**

Create `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

**Step 6: Create index.html in root**

Create `index.html`:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Having trouble seeing the light at the end of the debt tunnel? Debt Destroyer gives real estimates for when you will be free." />
    <meta name="theme-color" content="#3f51b5" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <title>Debt Destroyer</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 7: Create src/main.tsx entry point**

Create `src/main.tsx`:
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './components/app/app'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**Step 8: Install dependencies**

```bash
npm install
```

Expected: Dependencies install successfully.

**Step 9: Commit**

```bash
git add -A
git commit -m "chore: migrate from CRA to Vite with React 18

- Replace react-scripts with Vite
- Upgrade React 16 to React 18
- Upgrade TypeScript 3.5 to TypeScript 5
- Update entry point to use createRoot API
- Remove service worker registration

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Set Up Tailwind CSS + shadcn/ui

**Files:**
- Create: `tailwind.config.js`, `postcss.config.js`, `src/lib/utils.ts`, `components.json`
- Modify: `src/index.css`

**Step 1: Install Tailwind dependencies**

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Step 2: Configure tailwind.config.js**

Replace `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Chart colors for Recharts
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}
```

**Step 3: Replace src/index.css with Tailwind base + CSS variables**

Replace `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --primary: 231 48% 48%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 231 48% 48%;
    --radius: 0.5rem;
    --chart-1: 0 72% 51%;
    --chart-2: 217 91% 60%;
    --chart-3: 142 71% 45%;
    --chart-4: 330 81% 60%;
    --chart-5: 25 95% 53%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
      'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
      'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}
```

**Step 4: Install shadcn/ui dependencies**

```bash
npm install class-variance-authority clsx tailwind-merge lucide-react
```

**Step 5: Create src/lib/utils.ts**

Create `src/lib/utils.ts`:
```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Step 6: Create components.json for shadcn**

Create `components.json`:
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

**Step 7: Update vite.config.ts with path alias**

Replace `vite.config.ts`:
```typescript
import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

**Step 8: Update tsconfig.json with path alias**

Replace `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Step 9: Commit**

```bash
git add -A
git commit -m "chore: set up Tailwind CSS and shadcn/ui foundation

- Configure Tailwind with CSS variables for theming
- Add shadcn/ui utility function (cn)
- Set up path aliases (@/)
- Define chart color variables for Recharts

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Add shadcn/ui Components

**Files:**
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/input.tsx`
- Create: `src/components/ui/label.tsx`
- Create: `src/components/ui/table.tsx`
- Create: `src/components/ui/dialog.tsx`
- Create: `src/components/ui/tabs.tsx`
- Create: `src/components/ui/radio-group.tsx`
- Create: `src/components/ui/card.tsx`

**Step 1: Install Radix UI primitives**

```bash
npm install @radix-ui/react-dialog @radix-ui/react-label @radix-ui/react-radio-group @radix-ui/react-tabs @radix-ui/react-slot
```

**Step 2: Create src/components/ui/button.tsx**

Create `src/components/ui/button.tsx`:
```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

**Step 3: Create src/components/ui/input.tsx**

Create `src/components/ui/input.tsx`:
```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  startAdornment?: React.ReactNode
  endAdornment?: React.ReactNode
  error?: boolean
  helperText?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, startAdornment, endAdornment, error, helperText, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        <div className="relative flex items-center">
          {startAdornment && (
            <span className="absolute left-3 text-muted-foreground">{startAdornment}</span>
          )}
          <input
            type={type}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              startAdornment && "pl-8",
              endAdornment && "pr-8",
              error && "border-destructive focus-visible:ring-destructive",
              className
            )}
            ref={ref}
            {...props}
          />
          {endAdornment && (
            <span className="absolute right-3 text-muted-foreground">{endAdornment}</span>
          )}
        </div>
        {helperText && (
          <p className={cn("text-xs", error ? "text-destructive" : "text-muted-foreground")}>
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
```

**Step 4: Create src/components/ui/label.tsx**

Create `src/components/ui/label.tsx`:
```tsx
import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
```

**Step 5: Create src/components/ui/table.tsx**

Create `src/components/ui/table.tsx`:
```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
))
TableCell.displayName = "TableCell"

export {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
}
```

**Step 6: Create src/components/ui/dialog.tsx**

Create `src/components/ui/dialog.tsx`:
```tsx
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogClose = DialogPrimitive.Close
const DialogPortal = DialogPrimitive.Portal

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
```

**Step 7: Create src/components/ui/tabs.tsx**

Create `src/components/ui/tabs.tsx`:
```tsx
import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
```

**Step 8: Create src/components/ui/radio-group.tsx**

Create `src/components/ui/radio-group.tsx`:
```tsx
import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"
import { cn } from "@/lib/utils"

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
```

**Step 9: Create src/components/ui/card.tsx**

Create `src/components/ui/card.tsx`:
```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

export { Card, CardHeader, CardTitle, CardContent }
```

**Step 10: Commit**

```bash
git add -A
git commit -m "feat: add shadcn/ui components

Components added:
- Button with variants
- Input with adornments and error state
- Label
- Table (Table, TableHeader, TableBody, TableRow, TableHead, TableCell)
- Dialog
- Tabs
- RadioGroup
- Card

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Fix Algorithm Bugs + Extract Constants

**Files:**
- Modify: `src/utils/index.ts`
- Create: `src/constants/index.ts`

**Step 1: Update src/constants/index.ts with new constants**

Replace `src/constants/index.ts`:
```typescript
export const MONTHS_PER_YEAR = 12
export const MINIMUM_PRINCIPAL_RATE = 0.01
export const DEBOUNCE_MS = 300

export const errorTemplate = {
  error: false,
  message: ''
}
```

**Step 2: Update src/utils/index.ts with bug fixes and constants**

Replace `src/utils/index.ts`:
```typescript
import { nanoid } from 'nanoid'
import { MONTHS_PER_YEAR, MINIMUM_PRINCIPAL_RATE, errorTemplate } from '../constants'

export interface IDebt {
  name: string
  id: string
  amount: string
  rate: string
  repayment: string
}

export enum DEBT_PAYOFF_METHODS {
  SNOWBALL = 'snowball',
  AVALANCHE = 'avalanche'
}

export interface IStackData {
  month: string
  remainingBalance: number
  values: {
    [debtName: string]: {
      amountPaid: number
      remainingBalance: number
    }
  }
}

interface ICalculateDebtArguments {
  debtMethod: string
  debts: IDebt[]
  extraContributions: number
}

interface IParsedDebt {
  id: string
  name: string
  amount: number
  rate: number
  repayment: number
}

interface IValue {
  remainingBalance: number
  amountPaid: number
  interestPaid: number
}

interface IValueMap {
  [debtId: string]: IValue
}

export interface IRepaymentSchedule {
  extraContributions: number
  guid: string
  months: {
    month: number
    values: IValueMap
  }[]
}

interface IError {
  id: string
  fields: IErrorFields
}

type IErrorFields = Map<
  keyof IDebt,
  {
    error: boolean
    message: string
  }
>

// Utility function to round currency to 2 decimal places
export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100
}

export function sortArray(
  array: IParsedDebt[],
  sortFunction: (firstDebt: IParsedDebt, secondDebt: IParsedDebt) => number
) {
  return [...array].sort(sortFunction)
}

export function sortByRate(firstDebt: IParsedDebt, secondDebt: IParsedDebt) {
  return firstDebt.rate - secondDebt.rate
}

export function sortByAmount(firstDebt: IParsedDebt, secondDebt: IParsedDebt) {
  return firstDebt.amount - secondDebt.amount
}

function calculateMonthlyInterestRate(interest: number) {
  return interest / MONTHS_PER_YEAR / 100
}

export function calculateMinimumMonthlyRepayment(
  interest: number,
  debtAmount: number
): number {
  const monthlyInterest = calculateMonthlyInterestRate(interest)
  return roundCurrency(monthlyInterest * debtAmount + debtAmount * MINIMUM_PRINCIPAL_RATE)
}

function calculateMonthlyInterest(
  interest: number,
  debtAmount: number
): number {
  return roundCurrency(calculateMonthlyInterestRate(interest) * debtAmount)
}

function isDebtValid(debt: IParsedDebt) {
  if (debt.amount <= 0) {
    return false
  }
  return debt.rate >= 0
}

function parseDebt(debt: IDebt): IParsedDebt {
  return {
    ...debt,
    amount: parseFloat(debt.amount),
    rate: parseFloat(debt.rate),
    repayment: parseFloat(debt.repayment)
  }
}

export function parseChartData(rawChartData: IRepaymentSchedule): IStackData[] {
  return rawChartData.months.slice(1).map(month => {
    const values = Object.keys(month.values).reduce(
      (acc, debtId: string) => {
        return {
          ...acc,
          [debtId]: {
            amountPaid: month.values[debtId].amountPaid,
            remainingBalance: month.values[debtId].remainingBalance
          }
        }
      },
      {}
    )

    return {
      ...month,
      month: `${month.month}`,
      remainingBalance: Object.keys(values).reduce(
        (acc, curr) => acc + (values as Record<string, { remainingBalance: number }>)[curr].remainingBalance,
        0
      ),
      values
    }
  })
}

function getTotalBalanceFromValues(values: IValueMap): number {
  return Object.values(values).reduce((acc, value) => {
    return acc + (value.remainingBalance || 0)
  }, 0)
}

function calculateRepayments(
  debts: IParsedDebt[],
  repaymentSchedule: IRepaymentSchedule
): IRepaymentSchedule {
  const lastMonth =
    repaymentSchedule.months[repaymentSchedule.months.length - 1]
  const totalDebtRemaining = lastMonth
    ? getTotalBalanceFromValues(lastMonth.values)
    : 1

  if (totalDebtRemaining <= 0) {
    return repaymentSchedule
  }

  let extraContributions = repaymentSchedule.extraContributions

  const firstDebtNotPaidOff: number = debts.findIndex(debt => {
    return lastMonth.values[debt.id].remainingBalance > 0
  })

  let otherDebtRemainder = debts.slice(firstDebtNotPaidOff).reduce((acc, debt) => {
    const thisDebtLastMonth = lastMonth.values[debt.id]
    return thisDebtLastMonth.remainingBalance > 0 && thisDebtLastMonth.remainingBalance <= debt.repayment
      ? debt.repayment - thisDebtLastMonth.remainingBalance
      : 0
  }, 0)

  const paidOffDebts: IParsedDebt[] = Object.entries(lastMonth.values).reduce<IParsedDebt[]>(
    (acc, [key, value]) => {
      const debt = debts.find(debt => debt.id === key)
      if (value.remainingBalance <= 0 && debt) {
        acc.push(debt)
      }
      return acc
    },
    []
  )

  let extraFunds = paidOffDebts.reduce((acc, paidOffDebt) => {
    return acc + paidOffDebt.repayment
  }, 0)

  const newRepaymentSchedule: IRepaymentSchedule = {
    ...repaymentSchedule,
    months: [
      ...repaymentSchedule.months,
      {
        month: lastMonth.month + 1,
        values: debts.reduce<IValueMap>((acc, debt) => {
          const interestOnBalance = calculateMonthlyInterest(
            debt.rate,
            lastMonth.values[debt.id].remainingBalance
          )
          const balanceAsAtLastMonth = roundCurrency(
            interestOnBalance + lastMonth.values[debt.id].remainingBalance
          )

          let amountPaid: number = 0

          if (balanceAsAtLastMonth <= 0) {
            return {
              ...acc,
              [debt.id]: {
                amountPaid: 0,
                interestPaid: 0,
                remainingBalance: 0
              }
            }
          }

          extraFunds = extraFunds + extraContributions + otherDebtRemainder
          extraContributions = 0
          otherDebtRemainder = 0

          if (balanceAsAtLastMonth < debt.repayment + extraFunds) {
            const standardPaymentRemainder = roundCurrency(
              debt.repayment - balanceAsAtLastMonth
            )

            amountPaid = roundCurrency(balanceAsAtLastMonth)
            extraFunds = roundCurrency(extraFunds + standardPaymentRemainder)

            return {
              ...acc,
              [debt.id]: {
                amountPaid,
                interestPaid: interestOnBalance,
                remainingBalance: 0
              }
            }
          }

          amountPaid = roundCurrency(debt.repayment + extraFunds)
          extraFunds = 0

          const newRemainingBalance = roundCurrency(balanceAsAtLastMonth - amountPaid)
          const newRemainingPlusInterest = roundCurrency(
            calculateMonthlyInterest(debt.rate, newRemainingBalance) + newRemainingBalance
          )

          if (newRemainingPlusInterest - amountPaid > balanceAsAtLastMonth) {
            return {
              ...acc,
              [debt.id]: {
                amountPaid,
                interestPaid: interestOnBalance,
                remainingBalance: 0
              }
            }
          }

          return {
            ...acc,
            [debt.id]: {
              amountPaid,
              interestPaid: interestOnBalance,
              remainingBalance: newRemainingBalance
            }
          }
        }, {})
      }
    ]
  }

  return calculateRepayments(debts, newRepaymentSchedule)
}

export function calculateDebts({
  debtMethod,
  debts,
  extraContributions
}: ICalculateDebtArguments): IRepaymentSchedule {
  const parsedDebts = debts.map(parseDebt)
  const validDebts = parsedDebts.filter(isDebtValid)

  const sortedDebts =
    debtMethod === DEBT_PAYOFF_METHODS.SNOWBALL
      ? sortArray(validDebts, sortByAmount)
      : sortArray(validDebts, sortByRate).reverse()

  return calculateRepayments(sortedDebts, {
    extraContributions,
    guid: nanoid(),
    months: [
      {
        month: 0,
        values: sortedDebts.reduce<IValueMap>((acc, debt) => {
          return {
            ...acc,
            [debt.id]: {
              remainingBalance: debt.amount,
              amountPaid: 0,
              interestPaid: 0
            }
          }
        }, {})
      }
    ]
  })
}

export function editDebt(debt: IDebt, key: keyof IDebt, value: string): IDebt {
  return {
    ...debt,
    [key]: value
  }
}

export function editRow(
  rows: IDebt[],
  rowIndex: number,
  key: keyof IDebt,
  value: string
) {
  const newValue = [...rows]
  newValue[rowIndex] = editDebt(newValue[rowIndex], key, value)
  return newValue
}

function validateFields(
  error: IError,
  debt: IDebt,
  debtProperty: keyof IDebt,
  newValue: string
): IErrorFields {
  const newDebt = {
    ...debt,
    [debtProperty]: newValue
  }

  // BUG FIX: Use parseFloat instead of parseInt for currency values
  if (debtProperty === 'amount' && parseFloat(newDebt.amount) <= 0) {
    return error.fields.set('amount', {
      error: true,
      message: 'Amount should be more than 0'
    })
  }

  if (
    debtProperty === 'amount' ||
    debtProperty === 'repayment' ||
    debtProperty === 'rate'
  ) {
    // BUG FIX: Use parseFloat instead of parseInt
    const valueAsNumber = parseFloat(newDebt[debtProperty])
    const isItNaN = Number.isNaN(valueAsNumber)

    if (isItNaN) {
      return error.fields.set(debtProperty, {
        error: true,
        message: 'Value must be a number'
      })
    }

    error.fields.set('repayment', errorTemplate)
  }

  return error.fields.set(debtProperty, {
    error: false,
    message: ''
  })
}

export function validateRow(
  errors: IError[],
  debtIndex: number,
  debt: IDebt,
  debtProperty: keyof IDebt,
  newValue: string
): IError[] {
  errors[debtIndex] = {
    ...errors[debtIndex],
    fields: validateFields(errors[debtIndex], debt, debtProperty, newValue)
  }

  return errors
}
```

**Step 3: Commit**

```bash
git add -A
git commit -m "fix: algorithm bugs and extract constants

Bug fixes:
- Use parseFloat instead of parseInt for currency validation
- Add roundCurrency() to prevent floating-point precision errors
- Apply rounding during intermediate calculations

Constants extracted:
- MONTHS_PER_YEAR (12)
- MINIMUM_PRINCIPAL_RATE (0.01)
- DEBOUNCE_MS (300)

Also consolidated IDebt interface into utils to avoid circular imports.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Add Algorithm Tests

**Files:**
- Create: `src/utils/index.test.ts`

**Step 1: Create src/utils/index.test.ts**

Create `src/utils/index.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import {
  sortByAmount,
  sortByRate,
  sortArray,
  calculateDebts,
  calculateMinimumMonthlyRepayment,
  roundCurrency,
  DEBT_PAYOFF_METHODS,
  IDebt
} from './index'

describe('roundCurrency', () => {
  it('rounds to 2 decimal places', () => {
    expect(roundCurrency(10.126)).toBe(10.13)
    expect(roundCurrency(10.124)).toBe(10.12)
    expect(roundCurrency(100)).toBe(100)
  })
})

describe('sortByAmount', () => {
  it('sorts debts by amount ascending', () => {
    const debts = [
      { id: '1', name: 'Big', amount: 5000, rate: 5, repayment: 100 },
      { id: '2', name: 'Small', amount: 1000, rate: 10, repayment: 50 },
      { id: '3', name: 'Medium', amount: 3000, rate: 7, repayment: 75 }
    ]
    const sorted = sortArray(debts, sortByAmount)
    expect(sorted[0].name).toBe('Small')
    expect(sorted[1].name).toBe('Medium')
    expect(sorted[2].name).toBe('Big')
  })
})

describe('sortByRate', () => {
  it('sorts debts by rate ascending', () => {
    const debts = [
      { id: '1', name: 'High', amount: 5000, rate: 20, repayment: 100 },
      { id: '2', name: 'Low', amount: 1000, rate: 5, repayment: 50 },
      { id: '3', name: 'Medium', amount: 3000, rate: 10, repayment: 75 }
    ]
    const sorted = sortArray(debts, sortByRate)
    expect(sorted[0].name).toBe('Low')
    expect(sorted[1].name).toBe('Medium')
    expect(sorted[2].name).toBe('High')
  })
})

describe('calculateMinimumMonthlyRepayment', () => {
  it('calculates interest plus 1% principal', () => {
    // 12% annual = 1% monthly, debt of $1000
    // Monthly interest = $10, plus 1% principal = $10
    // Total = $20
    const result = calculateMinimumMonthlyRepayment(12, 1000)
    expect(result).toBe(20)
  })

  it('handles zero interest rate', () => {
    // 0% interest, just 1% principal on $1000 = $10
    const result = calculateMinimumMonthlyRepayment(0, 1000)
    expect(result).toBe(10)
  })
})

describe('calculateDebts - snowball method', () => {
  const createDebt = (name: string, amount: string, rate: string, repayment: string): IDebt => ({
    id: name,
    name,
    amount,
    rate,
    repayment
  })

  it('pays off smallest debt first', () => {
    const debts: IDebt[] = [
      createDebt('big', '5000', '10', '200'),
      createDebt('small', '500', '5', '100')
    ]

    const result = calculateDebts({
      debtMethod: DEBT_PAYOFF_METHODS.SNOWBALL,
      debts,
      extraContributions: 0
    })

    // Small debt should be paid off before big debt
    const smallPaidOffMonth = result.months.findIndex(
      m => m.values['small']?.remainingBalance === 0
    )
    const bigPaidOffMonth = result.months.findIndex(
      m => m.values['big']?.remainingBalance === 0
    )

    expect(smallPaidOffMonth).toBeLessThan(bigPaidOffMonth)
  })

  it('redirects payments after debt payoff', () => {
    const debts: IDebt[] = [
      createDebt('big', '5000', '10', '200'),
      createDebt('small', '100', '5', '100')
    ]

    const result = calculateDebts({
      debtMethod: DEBT_PAYOFF_METHODS.SNOWBALL,
      debts,
      extraContributions: 0
    })

    // After small debt is paid off, big debt should receive extra payments
    const monthAfterSmallPaidOff = result.months.find(
      (m, i) => i > 0 && result.months[i - 1].values['small']?.remainingBalance > 0 && m.values['small']?.remainingBalance === 0
    )

    // The month after small is paid, big should get more than its minimum
    if (monthAfterSmallPaidOff) {
      const nextMonthIndex = result.months.indexOf(monthAfterSmallPaidOff) + 1
      if (nextMonthIndex < result.months.length) {
        const nextMonth = result.months[nextMonthIndex]
        // Big debt payment should be at least 200 (its minimum) + some redirected amount
        expect(nextMonth.values['big'].amountPaid).toBeGreaterThanOrEqual(200)
      }
    }
  })
})

describe('calculateDebts - avalanche method', () => {
  const createDebt = (name: string, amount: string, rate: string, repayment: string): IDebt => ({
    id: name,
    name,
    amount,
    rate,
    repayment
  })

  it('pays highest interest rate first', () => {
    const debts: IDebt[] = [
      createDebt('lowRate', '1000', '5', '100'),
      createDebt('highRate', '1000', '20', '100')
    ]

    const result = calculateDebts({
      debtMethod: DEBT_PAYOFF_METHODS.AVALANCHE,
      debts,
      extraContributions: 50
    })

    // High rate debt should be paid off before low rate
    const highRatePaidOffMonth = result.months.findIndex(
      m => m.values['highRate']?.remainingBalance === 0
    )
    const lowRatePaidOffMonth = result.months.findIndex(
      m => m.values['lowRate']?.remainingBalance === 0
    )

    expect(highRatePaidOffMonth).toBeLessThan(lowRatePaidOffMonth)
  })
})

describe('calculateDebts - edge cases', () => {
  const createDebt = (name: string, amount: string, rate: string, repayment: string): IDebt => ({
    id: name,
    name,
    amount,
    rate,
    repayment
  })

  it('handles single debt', () => {
    const debts: IDebt[] = [
      createDebt('only', '1000', '10', '200')
    ]

    const result = calculateDebts({
      debtMethod: DEBT_PAYOFF_METHODS.SNOWBALL,
      debts,
      extraContributions: 0
    })

    // Should eventually pay off
    const lastMonth = result.months[result.months.length - 1]
    expect(lastMonth.values['only'].remainingBalance).toBe(0)
  })

  it('handles zero interest rate', () => {
    const debts: IDebt[] = [
      createDebt('noInterest', '500', '0', '100')
    ]

    const result = calculateDebts({
      debtMethod: DEBT_PAYOFF_METHODS.SNOWBALL,
      debts,
      extraContributions: 0
    })

    // Should pay off in ~5 months
    expect(result.months.length).toBeLessThanOrEqual(7)
    const lastMonth = result.months[result.months.length - 1]
    expect(lastMonth.values['noInterest'].remainingBalance).toBe(0)
  })

  it('handles extra contributions', () => {
    const debts: IDebt[] = [
      createDebt('debt', '1000', '10', '100')
    ]

    const withExtra = calculateDebts({
      debtMethod: DEBT_PAYOFF_METHODS.SNOWBALL,
      debts,
      extraContributions: 100
    })

    const withoutExtra = calculateDebts({
      debtMethod: DEBT_PAYOFF_METHODS.SNOWBALL,
      debts,
      extraContributions: 0
    })

    // Extra contributions should reduce payoff time
    expect(withExtra.months.length).toBeLessThan(withoutExtra.months.length)
  })

  it('filters out invalid debts (zero or negative amount)', () => {
    const debts: IDebt[] = [
      createDebt('valid', '1000', '10', '100'),
      createDebt('invalid', '0', '10', '100'),
      createDebt('negative', '-500', '10', '100')
    ]

    const result = calculateDebts({
      debtMethod: DEBT_PAYOFF_METHODS.SNOWBALL,
      debts,
      extraContributions: 0
    })

    // Only valid debt should be in the schedule
    expect(Object.keys(result.months[0].values)).toEqual(['valid'])
  })

  it('handles debt already paid off (empty debts array)', () => {
    const debts: IDebt[] = []

    const result = calculateDebts({
      debtMethod: DEBT_PAYOFF_METHODS.SNOWBALL,
      debts,
      extraContributions: 0
    })

    // Should return initial month with empty values
    expect(result.months.length).toBe(1)
    expect(Object.keys(result.months[0].values)).toEqual([])
  })
})
```

**Step 2: Run tests to verify they pass**

```bash
npm test -- --run
```

Expected: All tests pass.

**Step 3: Commit**

```bash
git add -A
git commit -m "test: add algorithm tests

Tests cover:
- roundCurrency utility
- sortByAmount (snowball ordering)
- sortByRate (avalanche ordering)
- calculateMinimumMonthlyRepayment
- calculateDebts snowball method
- calculateDebts avalanche method
- Edge cases: single debt, zero interest, extra contributions,
  invalid debts, empty debts array

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Convert App Component to Functional

**Files:**
- Rewrite: `src/components/app/app.tsx`
- Delete: `src/components/app/index.ts`

**Step 1: Rewrite src/components/app/app.tsx as functional component**

Replace `src/components/app/app.tsx`:
```tsx
import { useState, useEffect, useRef, useCallback } from 'react'
import throttle from 'lodash/throttle'
import debounce from 'lodash/debounce'
import { HelpCircle } from 'lucide-react'
import { stringify, parse } from 'query-string'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import AboutDialog from '../about-dialog'
import SnowballDialog from '../snowball-dialog'
import DebtTable from '../debt-table/debt-table'
import StackedBarChart from '../stacked-bar-chart'
import Insights from '../insights'
import {
  calculateDebts,
  IRepaymentSchedule,
  parseChartData,
  DEBT_PAYOFF_METHODS,
  IDebt
} from '../../utils'
import { DEBOUNCE_MS } from '../../constants'

function parseQueryStringParameter(
  parameter: string | string[] | null | undefined,
  defaultValue?: string
): string {
  if (!parameter && defaultValue) {
    return defaultValue
  }
  if (Array.isArray(parameter)) {
    return parameter[0]
  }
  if (typeof parameter === 'string') {
    return parameter
  }
  return ''
}

export default function App() {
  const wrapperRef = useRef<HTMLDivElement>(null)

  const [isViewReady, setIsViewReady] = useState(false)
  const [isAboutDialogOpen, setIsAboutDialogOpen] = useState(false)
  const [isSnowballDialogOpen, setIsSnowballDialogOpen] = useState(false)
  const [debts, setDebts] = useState<IDebt[]>([])
  const [extraContributions, setExtraContributions] = useState('0')
  const [debtData, setDebtData] = useState<IRepaymentSchedule | null>(null)
  const [debtPayoffMethod, setDebtPayoffMethod] = useState<DEBT_PAYOFF_METHODS>(
    DEBT_PAYOFF_METHODS.SNOWBALL
  )
  const [wrapperWidth, setWrapperWidth] = useState(0)

  const backupState = useCallback(() => {
    const query = stringify({
      extraContributions,
      debts: JSON.stringify(debts),
      debtPayoffMethod
    })
    window.history.pushState({}, '', `/?${query}`)
  }, [extraContributions, debts, debtPayoffMethod])

  const calculate = useCallback(
    debounce((currentDebts: IDebt[], method: DEBT_PAYOFF_METHODS, extra: string) => {
      const extraValue = parseInt(extra, 10)
      if (Number.isNaN(extraValue) || extraValue < 0) {
        return
      }
      setDebtData(
        calculateDebts({
          debts: currentDebts,
          debtMethod: method,
          extraContributions: extraValue
        })
      )
    }, DEBOUNCE_MS),
    []
  )

  const handleResize = useCallback(() => {
    if (wrapperRef.current) {
      setWrapperWidth(wrapperRef.current.getBoundingClientRect().width)
    }
  }, [])

  // Restore state from URL on mount
  useEffect(() => {
    const queryParams = parse(window.location.search)
    const debtsParam = parseQueryStringParameter(queryParams.debts)
    const payoffMethod = parseQueryStringParameter(
      queryParams.debtPayoffMethod as string,
      DEBT_PAYOFF_METHODS.SNOWBALL
    )
    const extraParam = parseQueryStringParameter(queryParams.extraContributions, '0')

    const parsedDebts = debtsParam === '' ? [] : JSON.parse(debtsParam)
    const validMethod =
      payoffMethod !== DEBT_PAYOFF_METHODS.SNOWBALL &&
      payoffMethod !== DEBT_PAYOFF_METHODS.AVALANCHE
        ? DEBT_PAYOFF_METHODS.SNOWBALL
        : (payoffMethod as DEBT_PAYOFF_METHODS)

    setDebts(parsedDebts)
    setExtraContributions(extraParam)
    setDebtPayoffMethod(validMethod)
    setIsViewReady(true)

    // Initial calculation
    calculate(parsedDebts, validMethod, extraParam)
  }, [calculate])

  // Handle resize
  useEffect(() => {
    handleResize()
    const throttledResize = throttle(handleResize, DEBOUNCE_MS)
    window.addEventListener('resize', throttledResize)
    return () => window.removeEventListener('resize', throttledResize)
  }, [handleResize])

  // Backup state when relevant values change
  useEffect(() => {
    if (isViewReady) {
      backupState()
    }
  }, [debts, extraContributions, debtPayoffMethod, isViewReady, backupState])

  const handleMethodChange = (value: string) => {
    setDebtPayoffMethod(value as DEBT_PAYOFF_METHODS)
    calculate(debts, value as DEBT_PAYOFF_METHODS, extraContributions)
  }

  const handleExtraContributionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setExtraContributions(value)
    calculate(debts, debtPayoffMethod, value)
  }

  const handleDebtChanged = (newDebts: IDebt[]) => {
    setDebts(newDebts)
    calculate(newDebts, debtPayoffMethod, extraContributions)
  }

  if (!isViewReady) {
    return null
  }

  return (
    <div className="min-h-screen">
      <header className="bg-primary text-primary-foreground py-4 px-6 flex items-center justify-between">
        <div className="w-10" />
        <h1 className="text-xl font-semibold">Debt Destroyer</h1>
        <Button
          variant="ghost"
          size="icon"
          className="text-primary-foreground hover:bg-primary/90"
          onClick={() => setIsAboutDialogOpen(true)}
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6" ref={wrapperRef}>
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="space-y-3">
            <Label className="text-base font-medium">Debt payoff method</Label>
            <RadioGroup
              value={debtPayoffMethod}
              onValueChange={handleMethodChange}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="snowball" id="snowball" />
                <Label htmlFor="snowball" className="font-normal cursor-pointer">
                  Snowball
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="avalanche" id="avalanche" />
                <Label htmlFor="avalanche" className="font-normal cursor-pointer">
                  Avalanche
                </Label>
              </div>
            </RadioGroup>
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsSnowballDialogOpen(true)}
            >
              What is this?
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="extra">Extra contributions</Label>
            <Input
              id="extra"
              type="number"
              min="0"
              startAdornment="$"
              value={extraContributions}
              onChange={handleExtraContributionsChange}
              helperText="How much extra can you afford per month?"
            />
          </div>
        </div>

        <DebtTable
          initialDebtState={debts}
          onDebtChanged={handleDebtChanged}
        />

        {debtData && (
          <Card>
            <Tabs defaultValue="chart">
              <CardContent className="pt-6">
                <TabsList className="mb-4">
                  <TabsTrigger value="chart">Chart</TabsTrigger>
                  <TabsTrigger value="insights">Insights</TabsTrigger>
                </TabsList>
                <TabsContent value="chart">
                  <StackedBarChart
                    width={wrapperWidth}
                    months={parseChartData(debtData)}
                    debts={debts}
                  />
                </TabsContent>
                <TabsContent value="insights">
                  <Insights
                    extraContributions={extraContributions}
                    debtPayoffMethod={debtPayoffMethod}
                    debtData={debtData}
                    debts={debts}
                  />
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        )}
      </main>

      <AboutDialog
        isOpen={isAboutDialogOpen}
        onCloseRequested={() => setIsAboutDialogOpen(false)}
      />
      <SnowballDialog
        isOpen={isSnowballDialogOpen}
        onCloseRequested={() => setIsSnowballDialogOpen(false)}
      />
    </div>
  )
}
```

**Step 2: Delete src/components/app/index.ts**

```bash
rm src/components/app/index.ts
```

**Step 3: Commit**

```bash
git add -A
git commit -m "refactor: convert App to functional component with hooks

- Replace class component with functional component
- Use useState for all state management
- Use useEffect for lifecycle (mount, resize, state backup)
- Use useCallback for memoized handlers
- Use useRef for DOM reference
- Replace MUI components with shadcn/ui equivalents
- Remove withStyles HOC wrapper

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Convert DebtTable Component

**Files:**
- Rewrite: `src/components/debt-table/debt-table.tsx`
- Delete: `src/components/debt-table/index.ts`

**Step 1: Rewrite src/components/debt-table/debt-table.tsx**

Replace `src/components/debt-table/debt-table.tsx`:
```tsx
import { useState, useEffect } from 'react'
import { nanoid } from 'nanoid'
import { Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { editRow, validateRow, IDebt } from '../../utils'
import { errorTemplate } from '../../constants'

interface IError {
  id: string
  fields: Map<keyof IDebt, { error: boolean; message: string }>
}

function debtFactory(): IDebt {
  return {
    name: '',
    id: nanoid(),
    amount: '',
    repayment: '',
    rate: ''
  }
}

function errorFactory(debtId: string): IError {
  return {
    id: debtId,
    fields: new Map([
      ['name', errorTemplate],
      ['amount', errorTemplate],
      ['repayment', errorTemplate],
      ['rate', errorTemplate]
    ])
  }
}

interface DebtTableProps {
  onDebtChanged: (rows: IDebt[]) => void
  initialDebtState: IDebt[]
}

export default function DebtTable({ onDebtChanged, initialDebtState }: DebtTableProps) {
  const [rows, setRows] = useState<IDebt[]>(initialDebtState)
  const [errors, setErrors] = useState<IError[]>(
    initialDebtState.map(debt => errorFactory(debt.id))
  )

  // Sync with parent when initialDebtState changes (e.g., from URL restore)
  useEffect(() => {
    setRows(initialDebtState)
    setErrors(initialDebtState.map(debt => errorFactory(debt.id)))
  }, [initialDebtState])

  // Notify parent of changes
  useEffect(() => {
    onDebtChanged(rows)
  }, [rows, onDebtChanged])

  const handleNewRow = () => {
    const newDebt = debtFactory()
    setRows(prev => [...prev, newDebt])
    setErrors(prev => [...prev, errorFactory(newDebt.id)])
  }

  const handleChange = (debtProperty: keyof IDebt, debtIndex: number) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = e.target.value
    setRows(prev => editRow(prev, debtIndex, debtProperty, newValue))
    setErrors(prev => {
      const newErrors = [...prev]
      return validateRow(newErrors, debtIndex, rows[debtIndex], debtProperty, newValue)
    })
  }

  const handleRemoveRow = (rowId: string) => () => {
    setRows(prev => prev.filter(row => row.id !== rowId))
    setErrors(prev => prev.filter(err => err.id !== rowId))
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Interest rate (%)</TableHead>
              <TableHead>Min. monthly repayment</TableHead>
              <TableHead className="w-16">Remove</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ id, name, amount, repayment, rate }, index) => {
              const fieldErrors = errors[index]?.fields
              const changeHandler = (debtProperty: keyof IDebt) =>
                handleChange(debtProperty, index)

              return (
                <TableRow key={id}>
                  <TableCell>
                    <Input
                      placeholder="Name"
                      value={name}
                      onChange={changeHandler('name')}
                      error={fieldErrors?.get('name')?.error}
                      helperText={fieldErrors?.get('name')?.message}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="Amount"
                      type="number"
                      startAdornment="$"
                      value={amount}
                      onChange={changeHandler('amount')}
                      error={fieldErrors?.get('amount')?.error}
                      helperText={fieldErrors?.get('amount')?.message}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="Rate"
                      type="number"
                      endAdornment="%"
                      value={rate}
                      onChange={changeHandler('rate')}
                      error={fieldErrors?.get('rate')?.error}
                      helperText={fieldErrors?.get('rate')?.message}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="Monthly repayment"
                      type="number"
                      startAdornment="$"
                      value={repayment}
                      onChange={changeHandler('repayment')}
                      error={fieldErrors?.get('repayment')?.error}
                      helperText={fieldErrors?.get('repayment')?.message}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveRow(id)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
            <TableRow>
              <TableCell colSpan={5}>
                <Button variant="outline" onClick={handleNewRow}>
                  <Plus className="h-4 w-4 mr-2" /> Add Row
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
```

**Step 2: Delete src/components/debt-table/index.ts**

```bash
rm src/components/debt-table/index.ts
```

**Step 3: Commit**

```bash
git add -A
git commit -m "refactor: convert DebtTable to functional component

- Replace class component with functional component
- Use useState for rows and errors state
- Use useEffect to sync with parent and notify changes
- Replace MUI Table with shadcn Table
- Replace MUI TextField with custom Input
- Replace MUI Icons with Lucide icons
- Remove withStyles HOC wrapper

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Convert Remaining Components

**Files:**
- Rewrite: `src/components/insights.tsx`
- Rewrite: `src/components/snowball-dialog.tsx`
- Rewrite: `src/components/about-dialog.tsx`
- Rewrite: `src/components/stacked-bar-chart.tsx`
- Delete: `src/@types.ts` (interfaces moved to utils)
- Delete: `src/index.ts` (replaced by main.tsx)

**Step 1: Rewrite src/components/insights.tsx**

Replace `src/components/insights.tsx`:
```tsx
import { useMemo } from 'react'
import { format, addMonths } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  calculateDebts,
  DEBT_PAYOFF_METHODS,
  IRepaymentSchedule,
  IDebt
} from '../utils'

interface InsightsProps {
  debtData: IRepaymentSchedule
  debts: IDebt[]
  extraContributions: string
  debtPayoffMethod: DEBT_PAYOFF_METHODS
}

function getTotalInterestPaid(debtData: IRepaymentSchedule): number {
  return debtData.months.reduce((acc, month) => {
    return (
      acc +
      Object.values(month.values).reduce((acc, value) => {
        if (!value.interestPaid) {
          return acc
        }
        return acc + value.interestPaid
      }, 0)
    )
  }, 0)
}

function getDebtPayoffDate(debtData: IRepaymentSchedule): string {
  return format(
    addMonths(new Date(), debtData.months[debtData.months.length - 1].month),
    'MMM, yyyy'
  )
}

export default function Insights({
  debtData,
  debts,
  extraContributions,
  debtPayoffMethod
}: InsightsProps) {
  const fiftyExtraScenario = useMemo(
    () =>
      calculateDebts({
        debtMethod: debtPayoffMethod,
        extraContributions: parseInt(extraContributions, 10) + 50,
        debts
      }),
    [debtPayoffMethod, extraContributions, debts]
  )

  const oneHundredFiftyExtraScenario = useMemo(
    () =>
      calculateDebts({
        debtMethod: debtPayoffMethod,
        extraContributions: parseInt(extraContributions, 10) + 150,
        debts
      }),
    [debtPayoffMethod, extraContributions, debts]
  )

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead />
          <TableHead>Current scenario</TableHead>
          <TableHead>Extra $50 a month</TableHead>
          <TableHead>Extra $150 a month</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">Pay off date</TableCell>
          <TableCell>{getDebtPayoffDate(debtData)}</TableCell>
          <TableCell>{getDebtPayoffDate(fiftyExtraScenario)}</TableCell>
          <TableCell>{getDebtPayoffDate(oneHundredFiftyExtraScenario)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Total interest paid</TableCell>
          <TableCell>${getTotalInterestPaid(debtData).toFixed(2)}</TableCell>
          <TableCell>${getTotalInterestPaid(fiftyExtraScenario).toFixed(2)}</TableCell>
          <TableCell>${getTotalInterestPaid(oneHundredFiftyExtraScenario).toFixed(2)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}
```

**Step 2: Rewrite src/components/snowball-dialog.tsx**

Replace `src/components/snowball-dialog.tsx`:
```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface SnowballDialogProps {
  isOpen: boolean
  onCloseRequested: () => void
}

export default function SnowballDialog({
  isOpen,
  onCloseRequested
}: SnowballDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCloseRequested()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Debt payoff methods</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            Snowball method sorts debts by{' '}
            <em className="text-foreground">lowest to highest balance</em>
          </p>
          <p>
            Avalanche (or Stack) method sorts debts by{' '}
            <em className="text-foreground">highest to lowest interest rate</em>
          </p>
          <p>
            Avalanche is technically the most cost-effective method because you
            end up paying less interest overall. This isn't as much of an issue
            if all of your debts have low interest rates or if you're going to
            be paying them off quickly.
          </p>
          <p>
            While Snowball isn't the most cost-effective method, the
            psychological benefits of closing off accounts are well-documented
            and for most people, this is the best way to keep motivated and
            focused on your goals (hence, the snowball effect).
          </p>
          <p>
            Snowball was popularised by Dave Ramsey and the Harvard Business
            Review has recently noted that the Snowball method is the best
            strategy for paying off card debt. You can read that article here:{' '}
            <a
              href="https://hbr.org/2016/12/research-the-best-strategy-for-paying-off-credit-card-debt"
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              HBR Article
            </a>
          </p>
          <p>
            For more information about these methods, read:{' '}
            <a
              href="https://www.investopedia.com/articles/personal-finance/080716/debt-avalanche-vs-debt-snowball-which-best-you.asp"
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Investopedia Article
            </a>
          </p>
        </div>
        <DialogFooter>
          <Button onClick={onCloseRequested}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

**Step 3: Rewrite src/components/about-dialog.tsx**

Replace `src/components/about-dialog.tsx`:
```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface AboutDialogProps {
  isOpen: boolean
  onCloseRequested: () => void
}

export default function AboutDialog({
  isOpen,
  onCloseRequested
}: AboutDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCloseRequested()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>About Debt Destroyer</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            Debt Destroyer was created by{' '}
            <a
              href="https://lukeboyle.com"
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Luke Boyle
            </a>
            . Many people have a hard time seeing a light at the end of their
            debt tunnel. This app gives accurate visualisations to show people
            that they can be debt free with their current budget. To report an
            issue, visit the Github repo at{' '}
            <a
              href="https://github.com/3stacks/debt-destroyer"
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/3stacks/debt-destroyer
            </a>
            .
          </p>
          <p>
            If you are not sure where or how to get started,{' '}
            <a
              href="https://www.amazon.com/Dave-Ramsey/e/B000APQ02W"
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Dave Ramsey
            </a>{' '}
            has an extremely comprehensive library of books to help beginners
            get started (consider the Total Money Makeover as a starting point).
          </p>
          <p>
            If you are having trouble finding extra room in your budget to
            contribute more to crushing your debts, think about any unnecessary
            vices you might be able to cut out. Keep in mind, it's probably not
            your 1-a-day latte habit keeping you in debt. The bigger culprits
            are larger, hidden expenses like unused gym memberships, smoking
            habits, a plethora of streaming service subscriptions.
          </p>
        </div>
        <DialogFooter>
          <Button onClick={onCloseRequested}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

**Step 4: Rewrite src/components/stacked-bar-chart.tsx**

Replace `src/components/stacked-bar-chart.tsx`:
```tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { IStackData, IDebt } from '../utils'

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

interface StackedBarChartProps {
  months: IStackData[]
  width: number
  debts: IDebt[]
}

export default function StackedBarChart({ months, width, debts }: StackedBarChartProps) {
  if (months.length === 0) {
    return null
  }

  return (
    <div style={{ paddingTop: 24 }}>
      <ResponsiveContainer width="100%" height={Math.max(300, width * 0.5)}>
        <BarChart data={months}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value) => `$${value}`} />
          <Legend />
          {Object.keys(months[0].values).map((debtId, index) => {
            const debt = debts.find(d => d.id === debtId)
            if (!debt) return null

            return (
              <Bar
                key={debtId}
                dataKey={`values.${debtId}.amountPaid`}
                name={debt.name}
                stackId="a"
                fill={CHART_COLORS[index % CHART_COLORS.length]}
              />
            )
          })}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
```

**Step 5: Delete obsolete files**

```bash
rm src/@types.ts src/index.ts src/components/burndown-chart.tsx
```

**Step 6: Commit**

```bash
git add -A
git commit -m "refactor: convert remaining components to functional

Components converted:
- Insights: use useMemo for scenario calculations, date-fns v3 API
- SnowballDialog: use shadcn Dialog
- AboutDialog: use shadcn Dialog
- StackedBarChart: use CSS variables for colors, ResponsiveContainer

Removed:
- @types.ts (moved to utils)
- index.ts (replaced by main.tsx)
- burndown-chart.tsx (unused)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 9: Final Cleanup and Verification

**Files:**
- Clean up: `public/` directory
- Remove: Mixpanel script remnants

**Step 1: Move favicon to public directory (keep only needed files)**

```bash
cd /Users/luke/Sites/debt-destroyer/.worktrees/quick-refresh
rm -rf public/index.html
# Keep only: favicon-32x32.png, android-icon-192x192.png, manifest.json
```

**Step 2: Update manifest.json**

Replace `public/manifest.json`:
```json
{
  "short_name": "Debt Destroyer",
  "name": "Debt Destroyer",
  "icons": [
    {
      "src": "favicon-32x32.png",
      "sizes": "32x32",
      "type": "image/png"
    },
    {
      "src": "android-icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#3f51b5",
  "background_color": "#ffffff"
}
```

**Step 3: Run build to verify everything compiles**

```bash
npm run build
```

Expected: Build succeeds with no errors.

**Step 4: Run tests to verify all pass**

```bash
npm test -- --run
```

Expected: All tests pass.

**Step 5: Start dev server and manual smoke test**

```bash
npm run dev
```

Test manually:
1. Add a debt row
2. Fill in values
3. Toggle between Snowball and Avalanche
4. Check chart renders
5. Check Insights tab
6. Open dialogs

**Step 6: Final commit**

```bash
git add -A
git commit -m "chore: final cleanup

- Remove Mixpanel script (was in old index.html)
- Update manifest.json
- Remove unused files from public/
- Verify build and tests pass

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Summary

After completing all tasks, the project will have:

1. **Vite** build system (replacing CRA)
2. **React 18** with functional components and hooks
3. **TypeScript 5** with strict mode
4. **Tailwind CSS** + **shadcn/ui** components
5. **Fixed algorithm bugs** (parseFloat, roundCurrency)
6. **Extracted constants** (MONTHS_PER_YEAR, etc.)
7. **Algorithm tests** with Vitest
8. **date-fns v3** API
9. **No @ts-ignore** annotations
10. **Clean, modern codebase**
