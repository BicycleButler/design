---
title: "0017 - Layout & Structure Standards"
type: "adr"
description: "Accepted"
status: "active"
last_updated: "2026-11-05T18:35:00Z"
---
# 0017 - Layout & Structure Standards

## Context
Web application interfaces often suffer from inconsistent navigation placement, z-index stacking conflicts between modals and dropdowns, and erratic dashboard grids. Without a shared structural contract, each new page introduces layout drift and increases cognitive load for users and developers.

## Decision

1. **F-Pattern Content Flow:** Primary data and CTAs occupy top-left quadrant. Layouts read top-to-bottom, left-to-right.
2. **Five Canonical Shell Archetypes (`ShellVariant`):** `AppShell` and `OmniButlerShell` provide five layout profiles so every ecosystem scenario follows deterministic rules:
   - **`workspace` (Default — Back-Office CRUD):** `0px` desktop header (`ADR 0037`), collapsible left sidebar (`w-64` / `w-16`), and `h-16` mobile drawer header. Used by `jules-crm`, `erp`, `expense`, `store-inventory-reporting`, `middlewarez`, `omnibutler`, and admin routes of hybrid apps.
   - **`commerce` (Storefront, Public CMS & Catalog):** Horizontal `h-16` frosted `CommerceHeader` on desktop and mobile with category links, search, and cart/pass slot. Internal multi-tenant controls (`AgencySwitcher`, cross-app integration menu) are omitted. Used by `storefront`, `site` public/events routes, `b2b` dealer catalog, and `bike-db` public spec views.
   - **`mobile-first` (Thumb-Zone Companion Apps):** Compact top bar and docked thumb-zone `BottomNavBar` (`3–5` tabs) on `< md` viewports, with a desktop sidebar rail. Used by `meaty` (Echo), `trail-tune-new` (TrailTune garage), `workforce` mobile timeclock, and mobile floor modes in `pos` and `wms-1`.
   - **`kiosk` (Frontline Register, PIN Timeclock & Handheld RF Scanner):** Distraction-free `100dvh` task shell with a compact `h-12` `KioskStatusBar` (station/device badge, offline/hardware sync indicator, and explicit station lock or exit action) and zero sidebar clutter. Defaults to `touch` density (`48px–56px` hit targets). Used by `pos` checkout lane and PIN kiosk, `wms-1` `/rf/*` scanner routes, and `site` `/events/[id]/check-in`.
   - **`canvas` (Spatial, Kinematics & Document Studio):** Edge-to-edge `100dvh` viewport with a locked `64px` (`w-16`) icon rail on desktop and zero scroll padding. Used by `trail-tune-new` kinematics studio, `pdf-butler` vector PDF annotator, `velo-term` geospatial radar, and `scope` visual block builder.
3. **Navigation Hierarchy & Sidebar Specification:** In `workspace` mode, the persistent sidebar holds 5–9 top-level items per section. Collapsed width is `64px` (`w-16`) icon-only, and expanded width is `240–280px` (`w-64`). Toggle occurs through an explicit button. Mobile uses a slide-over drawer (`workspace`) or `BottomNavBar` (`mobile-first`).
4. **Dashboard Grids, Section Bands & Task-Intent Surface Routing (`ECO-0041`):**
   - **Active Operational Work (`taskIntent="work-execution"` or `"triage-disposition"`):** Operational and triage routes default to `@wiltermoodj/ui/frontline` (`executionSurfaceMode="frontline-work"`) across desktop, tablet, and handheld viewports.
   - **Desk Analysis & Configuration (`taskIntent="desk-analysis"` or `"system-configuration"`):** Overview dashboards use 2–3 column grids (max 6 cards). Desk detail views use stacked sections or `SplitPaneLayout` (`ADR 0040`). In `commerce` and CMS apps (`site`, `storefront`, `scope`), pages stack `<SectionSurface>` bands (`lightest` through `darkest`) with width-constrained inner containers.
5. **Whitespace Over Borders:** Group related content by proximity and spacing — not containers or dividers. Resting elevated cards remain borderless (`ADR 0041`).
6. **Z-Index Scale:** Global layering — Base (`0`), Dropdowns (`40`), Sticky (`50`), FABs (`60`), Drawers (`70`), Modals (`80`), Popovers (`90`), Toasts (`100`).

## Consequences
- Standardized sidebar and z-index scale eliminates stacking conflicts between independently developed components.
- Whitespace-over-borders grouping reduces visual clutter across all pages.
