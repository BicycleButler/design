---
title: "Ecosystem UI Migration Playbook"
type: "playbook"
status: "active"
description: "Step-by-step playbook for migrating sibling repositories to consume @wiltermoodj/ui, @wiltermoodj/ui/frontline, and @wiltermoodj/configs."
last_updated: "2026-11-07"
---

# Ecosystem UI Migration Playbook: Mimicking Jules CRM through OmniButler

This guide provides the authoritative step-by-step procedure for migrating each sibling repository (for example, `b2b`, `pos`, `wms-1`, `scope`, `velo-term`, `meaty`, `store-inventory-reporting`) to consume `@wiltermoodj/ui`, `@wiltermoodj/ui/frontline`, and `@wiltermoodj/configs`.

## 1. Architectural Principles & Goals

1. **Pure Package Consumption**: Sibling repositories consume all design primitives (`Button`, `Dialog`, `Table`, `PageToolbar`, `ContainerPanel`, and so on) directly from `@wiltermoodj/ui` and frontline execution primitives from `@wiltermoodj/ui/frontline`. No local duplicate copies in `src/components/ui/`.
2. **Zero-CSS Redundancy**: Sibling repositories import `@wiltermoodj/ui/globals.css` once in their root entry point. Do not duplicate or override design token tables locally.
3. **ADR 0017 / ADR 0037 / ECO-0039 Shell Archetypes**:
   - **`workspace` (Default)**: Persistent collapsible sidebar (272px expanded / 64px icon-only) and **0px top header** on desktop (`≥ md`). Mobile (`< md`) uses a fixed 64px (`h-16`) frosted-glass `TopNav` with drawer.
   - **Contextual Variants**: Use `variant="commerce"`, `"mobile-first"`, `"kiosk"`, or `"canvas"` per `ECO-0039`.
4. **Task-Intent Surface Routing (`ECO-0041`)**:
   - **`frontline-work` (`taskIntent: "work-execution" | "triage-disposition"`)**: Default across all viewports for active physical, operational, and triage work.
   - **`desk-ledger` (`taskIntent: "desk-analysis" | "system-configuration"`)**: Reserved for reading reports, financial ledgers, prose authoring, and system configuration.
5. **Turnkey Shell**: Leverage `OmniButlerShell` from `@wiltermoodj/ui/ecosystem` to compose `LayoutConfigProvider`, `ThemeProvider`, `Toaster` (Sonner), and `AppShell` with zero layout boilerplate.
6. **Continuous Verification**: Maintain 0 ERRORs and 0 WARNINGs when executing `npm run audit:design` (or `npx omnibutler audit design`).

## 2. Step-by-Step Migration Process

### Step 1: Install & Synchronize Ecosystem Dependencies

Make sure that the target repository consumes the canonical OmniButler packages:

```bash
# In consumer repository root:
npm install @wiltermoodj/ui @wiltermoodj/auth @wiltermoodj/configs
```

Synchronize agent rules, skills, hooks, and audit scripts:

```bash
npx sync-agents
# or
npx omnibutler sync-agents
```

This automatically registers the following scripts in `package.json`:
- `"audit:design": "npx tsx .agents/skills/design/scripts/audit-design-system-compliance.ts src"`
- `"verify:design": "npx tsx .agents/skills/design/scripts/verify-design-adrs.ts"`

### Step 2: Automated UI Import Rewriting & Shadow Cleanup

Run the automated migration CLI:

```bash
# 1. Preview changes in dry-run mode:
npx migrate-ui --dry-run
# or: npx omnibutler migrate-ui --dry-run

# 2. Execute migration:
npx migrate-ui
# or: npx omnibutler migrate-ui
```

What `migrate-ui` does:
- Scans all files across `src/`.
- Rewrites legacy local UI imports:
  - `import { Button } from "@/components/ui/button"` $\rightarrow$ `import { Button } from "@wiltermoodj/ui"`
  - `import { Dialog } from "./ui/dialog"` $\rightarrow$ `import { Dialog } from "@wiltermoodj/ui"`
- Preserves `@wiltermoodj/ui/frontline` and `@wiltermoodj/ui/ecosystem` subpath imports.
- Removes duplicate local shadow primitives in `src/components/ui/` (for example, `button.tsx`, `card.tsx`, `table.tsx`).
- Configures `src/components/ui/index.ts` to cleanly re-export `@wiltermoodj/ui` as a safety bridge for dynamic references.

### Step 3: Streamline CSS & Design Tokens

In the consumer repository's root entry point (for example, `src/main.tsx` for Vite or `src/app/layout.tsx` for Next.js):

```tsx
// Remove local duplicated globals.css imports
import "@wiltermoodj/ui/globals.css";
```

Make sure that no local CSS file overrides:
- `--surface-raised-border` (must remain `transparent` per ADR 0041)
- `--surface-raised-border-opacity` (must remain `0` per ADR 0041)

### Step 4: Adopt `OmniButlerShell` Layout

Replace bespoke layout wrappers (for example, legacy `portals-layout.tsx` or duplicate `app-sidebar.tsx`) with the turnkey `OmniButlerShell`:

#### For Vite + React Router SPAs:

```tsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { OmniButlerShell, type NavSection } from "@wiltermoodj/ui/ecosystem";
import { useAuth } from "./context/auth-context";

type RouterLinkProps = React.ComponentPropsWithoutRef<"a"> & { href: string };

// Custom Link adapter for React Router (zero `any` per @wiltermoodj/configs)
const ReactRouterLinkAdapter = React.forwardRef<HTMLAnchorElement, RouterLinkProps>(
  ({ href, ...props }, ref) => <Link ref={ref} to={href} {...props} />
);
ReactRouterLinkAdapter.displayName = "ReactRouterLinkAdapter";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, currentAgency, accessibleAgencies, logout } = useAuth();
  const location = useLocation();

  const navSections: NavSection[] = [
    {
      title: "Navigation",
      items: [
        { title: "Catalog", href: "/catalog", icon: <StoreIcon />, isActive: location.pathname === "/catalog" },
        { title: "Orders", href: "/orders", icon: <ShoppingCartIcon />, isActive: location.pathname === "/orders" },
      ],
    },
  ];

  return (
    <OmniButlerShell
      appName="B2B Portal"
      currentApp="b2b"
      navSections={navSections}
      linkComponent={ReactRouterLinkAdapter}
      user={user}
      currentAgency={currentAgency}
      accessibleAgencies={accessibleAgencies}
      onLogout={logout}
      onSearchClick={() => { /* open command palette */ }}
    >
      {children}
    </OmniButlerShell>
  );
}
```

#### For Next.js App Router:

```tsx
import { OmniButlerShell } from "@wiltermoodj/ui/ecosystem";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <OmniButlerShell
      appName="Jules CRM"
      currentApp="jules-crm"
      linkComponent={Link}
      // ... props
    >
      {children}
    </OmniButlerShell>
  );
}
```

## 3. Migrating Operational & Triage Views to `@wiltermoodj/ui/frontline` (`ECO-0041`)

When a route does active operational execution (`taskIntent="work-execution"`, such as receiving, picking, packing, dispatch, POS checkout, or B2B order allocation) or queue triage (`taskIntent="triage-disposition"`, such as RMA claims or compliance sign-off):

1. **Declare a `ThroughputProfile` and verify conformance**:
   ```tsx
   import {
     createFrontlineSession,
     foldFrontlineSession,
     useFrontlineStream,
     validateThroughputProfile,
     sensory,
     type ThroughputProfile,
   } from "@wiltermoodj/ui/frontline";
   ```
2. **Route the shell by `taskIntent` with a `surfaceModeOverride` ledger toggle**:
   ```tsx
   const [surfaceOverride, setSurfaceOverride] = React.useState<"frontline-work" | "desk-ledger" | undefined>(undefined);

   return (
     <OmniButlerShell
       appName="Stow WMS"
       currentApp="wms-1"
       taskIntent="work-execution"
       surfaceModeOverride={surfaceOverride}
     >
       {/* Top 60% passive ledger (Track 3 tabular-nums readouts) + Bottom 40% somatic bar (56px h-14 targets, 1..9 ChoiceProvider) */}
     </OmniButlerShell>
   );
   ```
3. **Eliminate Frontline Anti-Patterns**:
   - Replace `<Dialog>` and `<AlertDialog>` modals on operational paths with `ChoiceProvider` (`1..9` locked slots), `StageLifecycleSpec` somatic tiles, or `Obligation` items.
   - Replace `window.prompt()`, `window.confirm()`, and `window.alert()` with structured `ChoiceProvider` reasons or `classifyMutationGovernance`.
   - Replace `setInterval` DOM `.focus()` polling with `useFrontlineStream` and `hardwareBroker.claimWedgeInterception()`.

## 4. Verify Compliance

Run the automated verification suite to guarantee zero design violations:

```bash
# Verify design tokens, shadows, aria labels, frontline rules, and shell structure:
npm run audit:design
# or: npx omnibutler audit design --strict

# Verify ADR alignment and mirror parity:
npm run verify:design

# Verify TypeScript compilation:
npm run typecheck
```

Check the generated report at `scratch/design-audit-report.md`. Target: **0 ERRORs, 0 WARNINGs**.
