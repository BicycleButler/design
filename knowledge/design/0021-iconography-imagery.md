---
title: "0021 - Iconography & Imagery Standards"
type: "adr"
description: "Accepted"
status: "active"
last_updated: "2026-08-08T06:15:00Z"
---
# 0021 - Iconography & Imagery Standards

## Context
Mixed icon sources, uncontrolled sizing, and missing avatar fallbacks degrade visual consistency. Mutating avatar containers into inline name tags causes layout reflows and clipping.

## Decision

1. **Single Icon Library:** Lucide across the entire project. No mixed styles, stock SVGs, or emoji for functional UI.
2. **5-Tier Icon Size & Optical Stroke Scale:**
   - **Inline (16px):** `strokeWidth={2}` (2px stem protection for dense context)
   - **Action (20px):** `strokeWidth={2}` (buttons, input fields)
   - **Navigation (24px):** `strokeWidth={1.75}` (toolbar, sidebar)
   - **Feature (32px):** `strokeWidth={1.5}` (card headers, metric callouts)
   - **Hero (48px):** `strokeWidth={1.5}` (empty states, banners)
3. **Touch Target Bounds:** Interactive icons on touch devices (`<768px`) require a **44×44px** hit area (`size-11`), adapting to `md:size-9` on desktop.
4. **Dynamic Background Contrast:** Icons on user-uploaded images require a solid backdrop, drop-shadow, or scrim overlay.
5. **Avatar System & Fixed Bounds:**
   - 4 sizes (24/32/40/48px), strictly circular. Fallback chain: uploaded image → initials → generic icon.
   - **Immutable Container Rule:** The `Avatar` primitive must preserve its 1:1 circular aspect ratio. Expanding it into name tags, pills, or cards is strictly prohibited. Hover previews must render through portal overlays per [0022-animations-microinteractions.md].
6. **Image & Rich Media Handling (`MediaFrame` & `HeroSurface` — `ECO-0039`):**
   - **Aspect Ratio Locking:** Lock media aspect ratios (`1:1`, `4:3`, `3:2`, `16:9`, `21:9`) through `MediaFrame` for zero CLS. Use lazy loading below the fold, descriptive `alt` text, and WebP/AVIF formats.
   - **Hero Scrim Mandate:** Place all text and CTAs over hero imagery (`HeroSurface`, `SectionSurface`) above a contrast scrim (`overlayOpacity` `25%–85%`). This guarantees $\ge 4.5:1$ WCAG 2.1 AA contrast across uploaded images.
   - **Neutral Glass Overlays:** Render product corner tags ("Digital", "Service", "Sold Out") in neutral frosted glass (`bg-background/85 backdrop-blur-md text-foreground`) ([0035-badge-status-indicators.md]).