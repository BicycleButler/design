---
title: "0028 - Theming & Dark Mode"
type: "adr"
description: "Accepted"
status: "active"
last_updated: "2026-08-01T14:52:00Z"
---
# 0028 - Theming & Dark Mode

## Context
Multi-theme applications suffer from incomplete theme definitions and illegible dark mode surface hierarchies. Because dark shades bleed together more easily on digital displays, traditional light-mode contrast gaps are insufficient in dark mode.

## Decision
Adopt theming and dark mode elevation mechanics:

1. **Theme Contract:** Every theme must supply completed manifest of CSS custom properties. Incomplete theme manifests fail build validation.
2. **Required Token Categories:** Every theme must supply CSS variables for backgrounds, text contrast, primary/accent/border tokens, and 5 OKLCH chart series. Incomplete manifests fail build validation.
3. **Dark Mode Surface Elevation Mechanics:**
   - **Lightness Progression:** Dark surfaces get lighter as z-index increases (Canvas, Frame, Cards, and Modals).
   - **Double Lightness Contrast Gap:** Dark mode requires a **4%–6% lightness gap** between adjacent elevation layers (double light mode's 2% gap).
4. **Borders & Shadows in Dark Mode:** Shadows are supplemented or replaced by lightened stroke borders (`border-border/40`). Elevated surface borders derive from the lightness tier above their container.
5. **Media Comfort & Fidelity (`data-media-fidelity="exact"`):** Dim decorative media by 10–15% (`filter: brightness(0.85) contrast(1.05)`) in dark mode. Product photos inside `[data-media-fidelity="exact"]` (`<MediaFrame fidelity="exact">`) are **exempt** from dimming to preserve true colors in `storefront`, `site`, and `b2b`.
6. **System Preference & Scoped Client Previews (`BrandThemeScope`):** Default to `prefers-color-scheme` with user overrides persisted in local storage. Scope client website themes (`site`, `scope`, `storefront`) to `[data-brand-scope]` so the operator workspace theme stays unaffected.
7. **Paper Wells (`data-signature-well="paper"` — `ECO-0039`):** Signature canvases (`SignatureDrawer`, `pdf-butler`) use a paper well (`bg-white text-zinc-950`) across themes for legible `#09090b` ink.
