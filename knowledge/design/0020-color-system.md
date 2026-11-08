---
title: "0020 - Color System Architecture"
type: "adr"
description: "Accepted"
status: "active"
last_updated: "2026-08-01T14:52:00Z"
---
# 0020 - Color System Architecture

## Context
Color management across multi-theme applications can be fragile. Manual palette creation produces inconsistent perceived brightness across hues (known HSL limitation). Components consuming raw color values break when themes change. External system colors (for example, Google Calendar) require special handling to maintain visual continuity.

> [!WARNING]
> ### Zero Static Semantic Alert Colors
> Saturated red, amber-yellow, or alert-green colors are **strictly forbidden** on resting UI surfaces, cards, and default table views. Semantic alert colors are reserved solely for dynamic, ephemeral feedback states (active input validation errors, transient toast notifications <3s, or active hover/push interactions). Resting elements and status indicators must rely on neutral typography and sub-label hierarchy.

## Decision
Adopt OKLCH color system standards and palette derivation rules:

1. **OKLCH Perceptual Model:** Mandate OKLCH (`oklch()`) for dynamic themes, status tints, and chart series for consistent perceived lightness.
2. **3-Seed Derivation:** Every theme is generated from 3 seed colors (primary, accent, neutral). Each seed produces shade stops through OKLCH lightness stepping (-100 light, -200 mid, -300 dark).
3. **Two-Tier Architecture:** Tier 1 = palette primitives (`--primary-100/200/300`, and so on.). Tier 2 = semantic tokens (`--primary`, `--background`, `--border`). Components consume Tier 2 tokens exclusively.
4. **Neutral Foundation:** 3 background layers, 2 structural strokes, 3 text contrast tiers — with defined WCAG contrast minimums.
5. **Dynamic-Only Semantic Status Palette:** Dynamic feedback colors (Success green, Warning amber, Destructive red, Info blue) are defined independently of seed colors with paired foreground tokens. They manifest only during active user interactions or ephemeral system events—never statically on resting views.
6. **Chart Color Generation:** Increment Hue ($H$) by $25^\circ\text{--}30^\circ$ while locking Lightness ($L$) and Chroma ($C$) constant.
7. **Third-Party Exception Category:** Namespace external colors (`--color-google-*`) globally. Never redefine them per theme, and compute foreground contrast dynamically.
8. **Google Calendar Fidelity:** Fetch live colors (1hr cache) with an 11-color fallback map and 200 custom labels. Preserve core hues in dark mode with WCAG AA container scrims ([0028-theming-dark-mode.md]).
9. **Base Theme Seed Derivation:** Default light (`minimal`) and dark (`dark-sapphire`) themes derive tokens through `generateCustomThemeTokens` rather than manual HSL overrides. Custom themes allow all primary hues, and accent hues use `mainHue - 15` to keep blues within $210^\circ\text{--}240^\circ$.
10. **Scoped Client Brand Sandboxing (`BrandThemeScope` — `ECO-0039`):** Multi-tenant sites (`site`, `storefront`, `scope`, `b2b`) must apply client brand seeds inside `<BrandThemeScope>` (`[data-brand-scope]`) without mutating `:root`. Convert client hex inputs to OKLCH with WCAG 2.1 AA foregrounds (`>= 4.5:1`) and 5-tier section schemes (`lightest` through `darkest`).
11. **Physical Hardware-Twin Circuit Colors (`<HardwareSurface>` — `ECO-0039`):** Mechanical circuit tokens (`--hardware-rebound`, `--hardware-compression`, `--hardware-kashima`, `--hardware-titanium`, `--hardware-carbon`) represent physical suspension finishes, not UI alerts. Authorize them only inside `<HardwareSurface>` (`[data-surface="hardware"]`) controls and SVG hardware diagrams, never on CRUD tables or badges.

## Consequences
- OKLCH guarantees consistent perceived brightness across all hues — the key advantage over HSL.
- Components remain theme-agnostic. Zero Tier 1 primitive values in component files.
- All default and custom themes share a single, mathematically verified OKLCH token contract.
