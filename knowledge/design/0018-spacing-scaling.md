---
title: "0018 - Spacing & Scaling System"
type: "adr"
description: "Accepted"
status: "active"
last_updated: "2026-07-18T18:35:00Z"
---
# 0018 - Spacing & Scaling System

## Context
Ad-hoc spacing values (13px, 17px) produce visually inconsistent interfaces and make design reviews subjective. Without spacing system, UI density varies unpredictably across pages, and text truncation failures break responsive layouts.

## Decision

1. **4-Point Grid:** spacing uses multiples of 4px. Layout spacing between content blocks uses 8px increments.
2. **7-Token Spacing Scale:**`space-1` (4px) `space-12` (48px) — no values outside set.
3. **Minimum Interactive Sizing & Four-Tier Density System (`DensityTier`):**
   - Standard buttons and inputs are `≥36px` height, with touch targets `≥44×44px` hit area.
   - Components and layouts support four named density tiers:
     - **`touch` (`56px–64px` row height, `48px–52px` control height):** High-ergonomic hit targets for `pos` touchscreen registers, `wms-1` handheld RF barcode terminals, and `kiosk` views.
     - **`comfortable` (`64px` row height, `36px–40px` control height):** System default for `workspace`, `commerce`, and `mobile-first` applications.
     - **`compact` (`48px` row height, `32px–36px` control height):** High-density back-office and financial views (`erp`, `b2b`, `store-inventory-reporting`, `middlewarez`).
     - **`ultra-compact` (`36px` row height, `28px–32px` control height):** Quantitative terminals, general ledger journal grids, bike geometry matrices, and `SpreadsheetGrid` (`velo-term`, `erp`, `bike-db`).
4. **Content Width Constraints (`StandardLayout` Presets):**
   - `reading` (`max-w-3xl` / `768px`): Long-form CMS articles, documentation, and legal envelopes (`site`, `pdf-butler`). Text is capped at 65–75 characters per line. Forms max `640px`.
   - `standard` (`max-w-7xl` / `1280px`): Standard overview dashboards.
   - `commerce` (`max-w-[1440px]`): Storefront product grids, merchandising landing pages, and community event directories (`storefront`, `site`, `b2b`).
   - `data-dense` (`max-w-[1600px]`): Multi-column financial tables, inventory matrices, and territory views.
   - `full` (`max-w-none`): Edge-to-edge spatial canvases (`trail-tune-new`, `pdf-butler`, `velo-term`).
5. **String Overflow:** Single-line labels use `text-overflow: ellipsis`. Multi-line uses `line-clamp` (2–3 lines max).
6. **Border Radius Tokens:** Derived from single base value (8–12px): `radius-sm`, `radius-md`, `radius-lg`, `radius-xl`, `radius-full`.
