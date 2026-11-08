---
title: "0034 - Table Design Standards"
type: "adr"
description: "Accepted"
status: "active"
last_updated: "2026-11-05T05:45:00Z"
---
# 0034 - Table Design Standards

## Context
`DataTable` handles tabular data display for desk analysis, historical ledgers, financial reporting, and catalog browsing (`executionSurfaceMode="desk-ledger"` per `ECO-0041`). Operational and triage workflows (`work-execution`, `triage-disposition`) default to `@wiltermoodj/ui/frontline` (`frontline-work`) and expose `DataTable` through a `desk-ledger` toggle. Dedicated status columns, pill badges, colored dots, heavy vertical grid lines, persistent red delete buttons, and unaligned numbers create clutter and reduce scannability.

## Decision

### 1 — Structural Cleanliness (Ban on Badges, Dots & Heavy Grid Lines)
- **Zero Badges, Pills, or Dots:** Dedicated status columns, pill badges, colored dots (`•`), and colored status strings are **banned** system-wide.
- **No Heavy Grid Lines:** Vertical cell borders are forbidden. Table cells rely on generous horizontal spacing and subtle row divider strokes (`border-b border-border/40`).

### 2 — Categorical Data Tier Patterns

All categorical attributes, record tiers, and status information must be displayed using one of two approved system patterns:

#### Sub-label Stacking (System Standard — Default)
- **Sub-label Stacking Inside a Single Cell:** Primary text sits on the top line. Secondary metadata, tier names, and IDs sit stacked on the bottom line within the exact same primary cell.
- **Typography & Opacity Hierarchy:**
  - **Top Line:** Primary Identifier / Name in `font-medium text-foreground`.
  - **Bottom Line:** Muted Tier Name $\cdot$ Secondary ID at **50%–60% opacity** (`text-muted-foreground/60 text-xs`).

```
[ Primary Record Name                             ]
[ Gold Tier · ID: #84920                          ]
```

#### Margin Wash Variant (Enhanced Flare Variant — Option)
- **Left-Edge Margin Wash:** Reserved for high-contrast or brand-flair requirements.
- **Visual Spec:** A subtle left-edge margin gradient wash ($\approx$6%–12% opacity linear gradient fading out completely within the first 20%–30% container width) applied to the record row or primary cell.

### 3 — Numeric Right-Alignment
- **Mandatory Right-Alignment:** All metrics, financial amounts, percentages, counts, and dates **must be right-aligned** (`text-right`) for vertical scanning.
- **Left-Alignment:** Text strings, names, and stacked Sub-label Stacking labels are left-aligned (`text-left`).
- **Column Header Alignment:** Headers must align with their column data (right-align numeric headers, left-align text headers).

### 4 — Four-Tier Density Specs (`DensityTier`)
Tables and grids support four density tiers (`density` prop on `DataTable`):
- **Touch Density (`touch`):** `16px` cell padding (`py-4 px-4`), `56px–64px` row height (`h-16`), `48px` interactive targets. Designed for `pos` touchscreen registers, `wms-1` handheld barcode terminals, and `kiosk` views.
- **Comfortable Density (`comfortable` — Default):** `16px` cell padding (`py-4 px-4`), `64px` row height (`h-16`). Designed for general `workspace` and `commerce` overview and browsing.
- **Compact Density (`compact`):** `8px` cell padding (`py-2 px-3`), `48px` row height (`h-12`). Designed for financial data grids (`erp`), wholesale order sheets (`b2b`), and high-density operational workflows (`store-inventory-reporting`).
- **Ultra-Compact Density (`ultra-compact`):** `4px` vertical / `8px` horizontal cell padding (`py-1 px-2`), `36px` row height (`h-9`), `text-xs font-mono tabular-nums`. Designed for quantitative terminals (`velo-term`), general ledger journal lines (`erp`), technical bike geometry comparison matrices (`bike-db`), and `SpreadsheetGrid`.

### 5 — Inline & Menu-Gated Row Actions
- Row actions use neutral `ghost` icon buttons.
- **Canonical source for color-at-rest and destructive entry point rules:** [0036-destructive-action-confirmation.md]. Summary: destructive row actions must never appear as persistent red buttons. They must be tucked inside an overflow menu (`MoreHorizontal` ghost icon). Red accent highlights manifest only when hovering over the destructive item inside the open menu.

### 6 — Responsive Table Adaptations (`responsiveMode`)

**Canonical source:** [0024-responsive-layout.md] defines the full Desktop / Tablet / Mobile table adaptation spec. Summary:
- **Desktop (>1024px):** Full structured table.
- **Tablet (768px–1024px):** Progressive column hiding. Secondary columns collapse into expandable detail rows.
- **Mobile (<768px):**
  - `responsiveMode="cards"` (Default): Mandatory Mobile Card Transformation — grid structures dismantle into stacked cards (`mobileCardRenderer`) with Sub-label Stacking.
  - `responsiveMode="comparison-matrix"`: Authorized for multi-column technical or financial comparison matrices (`bike-db` geometry, `trail-tune-new` telemetry, `erp` trial balance). Retains tabular layout below `768px` with a sticky primary identifier column (`sticky left-0 z-10 bg-card`).

## Consequences
- Data tables are clean, scannable, and free of noisy badges, dots, and grid lines.
- Numeric alignment enables effortless visual comparison of figures across rows.
- Sub-label Stacking compresses primary data and secondary status into a single readable column.
- Menu-gated destructive actions prevent accidental record deletion.
