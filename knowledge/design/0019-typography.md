---
title: "0019 - Typography Standards"
type: "adr"
description: "Accepted"
status: "active"
last_updated: "2026-11-05T14:52:00Z"
---
# 0019 - Typography Standards

## Context
Unconstrained font usage leads to inconsistent visual hierarchy. Typography scales require a clear mathematical foundation to maintain harmonic proportions across viewports.

## Decision
Adopt typography standards across all UI components:

1. **2-Family Limit:** One sans-serif primary (for example, Inter, Geist) + one monospace. Decorative fonts apply only to marketing heroes. Cursive script fonts apply only inside `[data-signature-preview]` signature blocks (`SignatureDrawer`, `pdf-butler`).
2. **Scoped Three-Track Typography Contract:**
   - **Track 1 — Workspace UI Scale (`24px` Max):** Workspace chrome and content use 6 tiers (`xs` `12px` to `2xl` `24px`). Standard application UI font size is strictly capped at `24px` (`text-2xl`).
   - **Track 2 — Commerce & Editorial Display Scale (`text-display-*`):** Authorized **exclusively** inside customer-facing `commerce` and editorial hero surfaces (`site`, `storefront`, `scope` page builder preview):
     - `text-display-sm` (`30px` / `1.875rem`, line-height `1.15`, tracking `-0.02em`)
     - `text-display-md` (`36px` / `2.25rem`, line-height `1.12`, tracking `-0.025em`)
     - `text-display-lg` (`48px` / `3rem`, line-height `1.08`, tracking `-0.03em`)
   - **Track 3 — Readout Scale (`text-readout-*`):** Authorized **exclusively** for live numerical counters, POS totals, RF scan counts, timers, and gauges. Must strictly enforce `font-mono tabular-nums`:
     - `text-readout-sm` (`28px` / `1.75rem`, `font-mono tabular-nums`, line-height `1.1`)
     - `text-readout-md` (`36px` / `2.25rem`, `font-mono tabular-nums`, line-height `1.05`)
     - `text-readout-lg` (`48px` / `3rem`, `font-mono tabular-nums`, line-height `1.0`)
3. **4-Weight Hierarchy:** 400 (body text), 500 (labels/sub-labels), 600 (headings), 700 (hero/primary CTAs and kiosk readouts only).
4. **Display Heading Tightening:** For `text-display-*` headings beyond 24px, letter-spacing tightens by −2% to −3% and line-height drops to 108%–115%.
5. **Paragraph Readability:** Body line-height must remain between 140% and 160% (never below 140%).
