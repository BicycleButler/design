---
title: "0024 - Responsive & Adaptive Layout"
type: "adr"
description: "Accepted"
status: "active"
last_updated: "2026-11-05T12:25:00Z"
---
# 0024 - Responsive & Adaptive Layout

## Context
Desktop-only layouts fail on tablets and phones when data tables overflow, multi-column forms crowd, or fixed bars overlap notches. Without unified breakpoints, safe-area inset rules, and adaptive bottom-zone slotting, mobile layouts suffer from clipping and dead bottom padding.

## Decision
Adopt responsive layout standards across all viewports and components:

1. **4 Breakpoints:** `sm` (≥640px), `md` (≥768px), `lg` (≥1024px), `xl` (≥1280px).
2. **Mobile-First:** Base CSS targets the smallest viewport. Layout complexity scales upward responsively.
3. **Data Table Viewport Adaptation Standards (`responsiveMode`):**
   - **Desktop (>1024px):** Render a full structured data table with density-appropriate row height (`touch` 56px–64px, `comfortable` 64px, `compact` 48px, `ultra-compact` 36px) and complete column visibility.
   - **Tablet (768px–1024px):** Enforce progressive column hiding. Secondary metadata columns collapse into expandable inline detail rows or drawer summaries while preserving core primary columns.
   - **Mobile (<768px) — Dual Authorized Adaptation Modes:**
     - **Mode A: Mobile Card Transformation (`responsiveMode="cards"`, Default):** Entity tables dismantle rows into stacked cards (`mobileCardRenderer`) with Sub-label Stacking. Uncontrolled horizontal scrolling for entity lists is forbidden.
     - **Mode B: Sticky-Column Comparison Matrix (`responsiveMode="comparison-matrix"`):** Authorized when the user's primary task is cross-row or cross-column numerical/technical comparison (for example, `bike-db` frame geometry comparison matrices, `trail-tune-new` shock telemetry tables, `erp` trial balance columns, `velo-term` quote grids). Preserves the tabular grid below `768px` with the first identifier column pinned (`sticky left-0 z-10 bg-card`) and smooth horizontal pan for comparison columns.
4. **Form & Navigation Adaptation:** Multi-column forms transition to single-column below 768px (`md`). Side panels convert to slide-over drawers below 1024px (`lg`). Navigation adapts according to the active `ShellVariant` (`workspace` hamburger drawer, `mobile-first` thumb-zone `BottomNavBar`, `commerce` responsive `CommerceHeader`, or `kiosk` status bar).
5. **Safe Area & Dynamic Bottom-Zone Clearance Handling (`--omni-bottom-clearance`):**
   - Single Scroll Authority: Page layouts (`PageLayout`, `DetailLayout`) must not add nested `overflow-y-auto min-h-screen` containers inside `<main id="main-content">`. `<main>` handles viewport scrolling.
   - Dynamic Bottom Scroll Clearance: `AppShell` computes `--omni-bottom-clearance` dynamically based on the active `bottomZone` mode (`"sticky-footer"` → `5.5rem`, `"bottom-nav"` → `4.5rem`, `"fab"` → `5rem`, `"none"` → `0px`). Views without a fixed bottom bar (`bottomZone="none"`, `kiosk`, `canvas`, and standard `commerce` pages) enforce `pb-[env(safe-area-inset-bottom,0px)]` without dead `6rem` bottom padding.
   - Fixed Footer Safe-Area Offset: Fixed bottom bars (`StickyFooter`, `BottomNavBar`) must append `pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]` to guarantee clearance above mobile home indicator bars.
6. **Adaptive Mobile Sticky Footer Slotting (Zero Disabled Slots Rule):**
   - Mobile sticky footers must never present disabled grey buttons or empty slots when entity attributes (phone, coordinates) are absent.
   - Footers must dynamically slot alternative high-value actions in priority order (Call → Email → Log Note. Navigate → Email → Log Activity), guaranteeing 3 active touch targets.
   - Sticky footers use frosted glass styling (`bg-background/80 backdrop-blur-xl border-t shadow-lg z-50`).
7. **Viewport Meta:** `width=device-width, initial-scale=1`.
