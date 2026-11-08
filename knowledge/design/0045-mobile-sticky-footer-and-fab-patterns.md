---
title: "ADR 0045: Mobile Sticky Footer and FAB Architecture Standards"
type: "adr"
status: "active"
description: "Single bottom-zone authority standards, 1-3 slot sticky footer contracts, thumb-zone bottom navigation, and dynamic safe-area scroll buffers."
date: "2026-11-05"
---

# ADR 0045: Mobile Sticky Footer and FAB Architecture Standards

## Context

Mobile web and hybrid applications frequently require persistent access to high-frequency actions (for example, creating items, filtering datasets, invoking voice or AI assistants, or initiating communications).

Historically, applications mix two competing interaction paradigms:
1. **Floating Action Buttons (FABs)**: Unanchored circular buttons hovering over content in a screen corner.
2. **Sticky Footer Bars**: Docked horizontal toolbars pinned to the bottom of the viewport.

Mixing the two paradigms within the same application creates severe usability defects:
- **UI Collisions**: Floating FABs hover directly over bottom table rows, pagination controls, or docked footer bars.
- **Safe-Area Bugs**: Hardcoded bottom CSS offsets ignore device notch and safe-area inset environment variables (`env(safe-area-inset-bottom)`).
- **Inconsistent UX**: Users face unpredictable action locations when switching between list views, detail views, and workflow pages.

## Decision

We establish a Single Bottom-Zone Authority rule and define strict architectural standards for mobile bottom actions and navigation.

### 1. Single Bottom-Zone Authority Per Active View (`BottomZoneMode`)
To preserve thumb-zone ergonomics across single-purpose and hybrid applications (`pos`, `wms-1`, `site`, `workforce`), each active viewport **MUST** select at most **one** bottom-zone authority (`bottomZone` on `AppShell`):
- **`sticky-footer` (Default for `workspace` multi-action & detail views)**: Selected when views require 1–3 contextual or primary actions (for example, search/filter, primary CTA, global assistant trigger, or mobile event/checkout CTA).
- **`bottom-nav` (Default for `mobile-first` companion & field apps)**: Selected when a mobile-first application (`meaty` / Echo, `trail-tune-new` / TrailTune, `workforce` mobile employee portal) requires persistent thumb-zone tab switching across `3–5` top-level destinations through `BottomNavBar`.
- **`fab` (Minimal Single-Action Views)**: Selected ONLY for views requiring strictly one singular floating creation action and zero secondary bottom bars.
- **`none` (Immersive Canvases, Kiosks & Camera Scanners)**: Selected for `kiosk`, `canvas`, and standard scrolling `commerce` views where no fixed bottom bar is mounted.

> **Strict Mutual Exclusion Rule:** Mounting more than one bottom-zone authority in the same active viewport (for example, rendering a floating `Fab` over a `StickyFooter` or `BottomNavBar`, or stacking a `StickyFooter` directly on top of a `BottomNavBar` without mode transition) is strictly prohibited.

### 2. Sticky Footer Slot Contract (1–3 Slots) & BottomNavBar Contract (3–5 Tabs)
`StickyFooter` (`bottomZone="sticky-footer"`) adapts between 1 and 3 slots per view, while `BottomNavBar` (`bottomZone="bottom-nav"`) renders 3 to 5 tabs:

- Layout | Slot Configuration | Use Cases
- **1-Slot (Single Primary)** | Full-width primary CTA button | Form submissions, single-action workflows, event registration or cart checkout bar
- **2-Slot (Dual Action)** | Left: Secondary/Context CTA · Right: Primary CTA | Detail pages (for example, Call / Log Note), confirmation bars (for example, Cancel / Save)
- **3-Slot (Tri-Action Standard)** | Left: Context (Search/Filter) · Center: Primary CTA · Right: Assistant/Voice | Primary list views (Tasks, Contacts, Deals, Organizations) requiring view management, primary creation, and global AI voice triggers
- **BottomNavBar (3–5 Tabs)** | 3 to 5 equal-width icon + micro-label (`11px`) destination tabs (`min-h-[48px]` touch targets) | Mobile-first apps (`meaty`, `trail-tune-new`, `workforce` mobile)

### 3. Dynamic Bottom Scroll Buffer (`--omni-bottom-clearance`)
`AppShell` sets `--omni-bottom-clearance` on `<main id="main-content">` from the active `bottomZone` mode so `bottomZone="none"` views prevent dead `6rem` padding:

```css
/* Dynamic clearance governed by active BottomZoneMode */
/* sticky-footer: 5.5rem | bottom-nav: 4.5rem | fab: 5rem | none: 0px */
padding-bottom: calc(var(--omni-bottom-clearance, 0px) + env(safe-area-inset-bottom, 0px));
```

This guarantees that table rows, card list items, and form fields can scroll clear of the sticky footer with zero text or control occlusion.

### 4. Safe-Area & Backdrop Standard
Every sticky footer must satisfy the following technical layout contract:
- **Positioning**: `fixed bottom-0 left-0 right-0 z-40`
- **Safe Area**: `pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]`
- **Visual Styling**: Translucent background with backdrop blur (`bg-background/85 backdrop-blur-xl`), subtle top stroke (`border-t border-border`), and top shadow elevation.
- **Responsive Display**: `flex md:hidden` (auto-hides on desktop viewports where header/top toolbars handle actions).

### 5. Z-Index Layer Hierarchy (ADR 0017 Alignment)
- `z-30`: Sticky table headers / in-page sticky tabs
- `z-40`: Mobile Sticky Footer bar / `BottomNavBar`
- `z-50`: Global floating toasts / snackbars
- `z-60`: Sliding drawers (for example, Copilot Drawer, Inspector Drawer)
- `z-70`+: Modals & Alert dialogs

## Consequences

### Positive
- **Predictable Mobile UX**: Users encounter consistent action placement across all screens.
- **Zero Content Obstruction**: Safe bottom scroll buffers prevent elements from being hidden under footers.
- **Clean AI/Voice Integration**: Global voice triggers sit cleanly in the 3rd slot of the sticky footer without floating over text.

### Negative
- Requires developer discipline to apply bottom scroll clearance padding (`pb-24`) to page layout containers.
