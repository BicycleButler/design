---
title: Design Guidelines Reference
type: reference
status: active
description: Reference
---

# Design Guidelines Reference

## Spacing Tokens

- Token | Value | Use
- `space-1` | 4px | Inline gaps, icon padding
- `space-2` | 8px | Tight component padding
- `space-3` | 12px | Default component padding
- `space-4` | 16px | Card inner padding
- `space-6` | 24px | Section gaps
- `space-8` | 32px | Field group separation
- `space-12` | 48px | Page section breaks

**Content width constraints:**
- Text: 65–75 chars/line
- Forms: max 640px
- Standard dashboards: max 1280px
- Data-dense layouts: max 1600px

**Border radius tokens:** `radius-sm`, `radius-md`, `radius-lg`, `radius-xl`, `radius-full`

## Typography Scale (Scoped Three-Track Contract — ADR 0019)

- Step | Size | Weight / Track Use
- `xs` | 12px | Metadata, captions, `ultra-compact` cells
- `sm` | 14px | Secondary labels
- `base` | 16px | Body copy (line-height 140–160%)
- `lg` | 18px | Emphasized body
- `xl` | 20px | Section headings
- `2xl` | 24px | Workspace page headings (Hard cap for Track 1 Workspace UI)
- `text-display-sm` / `md` / `lg` | 30px / 36px / 48px | Track 2: Customer-facing `commerce` and editorial hero blocks ONLY
- `text-readout-sm` / `md` / `lg` | 28px / 36px / 48px | Track 3: `font-mono tabular-nums` live numeric readouts (POS totals, RF scan counters, timers, telemetry) ONLY

**Weights:** 400 body · 500 labels · 600 headings · 700 hero/CTA & kiosk readouts only
**Workspace UI cap:** 24px (`text-2xl`). Larger sizes require `text-display-*` (commerce/editorial) or `text-readout-*` (tabular numeric telemetry).

## Color Architecture

```
3 seed colors (primary, accent, neutral)
- Lightness stepping
- light shade
- mid shade
- dark shade

Primitives:  --primary-100, --primary-200, --primary-300, and so on.
Semantic:    --primary, --background, --border, --foreground, and so on.

Components consume ONLY semantic tokens.
```

**Neutral foundation:**
- 3 background layers
- 2 structural strokes
- 3 text contrast tiers

**Status palette:** success, warning, destructive, info — each with matching foreground.

**Dark mode validation:**
- Minimum lightness delta between adjacent background layers
- Borders shift to lightened strokes
- Manual override persisted. Default = system preference
- Product photography & merchandise swatches use `data-media-fidelity="exact"` (`<MediaFrame fidelity="exact">`) to bypass `.dark img` dimming
- Client website themes (`site`, `storefront`, `scope`) use `<BrandThemeScope>` (`[data-brand-scope]`) to isolate OKLCH brand seeds, `SectionColorScheme` (`lightest` to `darkest`), `BrandFontPairing`, and `BrandRadiusScale` from `:root`

## Icon Sizes & Optical Weights

- Tier | Size | Stroke | Context
- Inline | 16px | 2 | Inline with text
- Action | 20px | 2 | Buttons, form inputs
- Navigation | 24px | 1.75 | Sidebar, toolbar, top nav
- Feature | 32px | 1.5 | Feature tiles, card headers
- Hero | 48px | 1.5 | Empty states, onboarding

**Touch target rule:** Use `44×44px` minimum targets on `desk-ledger` touch viewports (`ADR 0023`). Use `56×56px` (`h-14`, `8px` gap) somatic targets on `frontline-work` surfaces (`ECO-0041`).
**Avatar sizes:** 24 / 32 / 40 / 48px — circular.

## Z-Index Scale

- Layer | Value
- Base | 0
- Dropdowns | 40
- Sticky | 50
- FABs | 60
- Drawers | 70
- Modals | 80
- Toasts | 100

## Shadow / Elevation Tiers

- Token | Box Shadow Spec | Use
- `shadow-xs` | `0 1px 2px 0 rgba(0, 0, 0, 0.05)` | Resting cards
- `shadow-sm` | `0 1px 3px 0 + 0 1px 2px -1px` | Raised / hover
- `shadow-md` | `0 4px 6px -1px + 0 2px 4px -2px` | Floating / dropdowns
- `shadow-lg` | `0 10px 15px -3px + 0 4px 6px -4px` | Overlay / modal
- `shadow-xl` | `0 20px 25px -5px + 0 8px 10px -6px` | Top-level / toast

Higher-elevation elements always cast larger shadows. Shadowless elements must not appear above shadowed elements.

## Breakpoints

- Token | Min width | Adaptation
- base | 0 | Mobile — single column
- `sm` | 640px | Minor layout unlocks
- `md` | 768px | Tables→cards. Multi-col forms→single
- `lg` | 1024px | Side panels expand. 2-col layouts
- `xl` | 1280px | Full dashboard grids

## Animation Durations

- Tier | Duration | Use
- Micro | 100ms | State toggles, checkboxes
- Standard | 200ms | Hover effects, dropdowns
- Emphasis | 300ms | Panels, modals entering
- Complex | 500ms | Page transitions, data reveals

**Easing defaults:**
- Entering: `ease-out`
- Leaving: `ease-in`
- Repositioning: `ease-in-out`
- Default curve: `cubic-bezier(0.4, 0, 0.2, 1)`
- `linear` is banned.

**Async state requirements (every data-fetching component):**
1. Empty — illustrated CTA
2. Loading — skeleton shimmer
3. Error — contextual message + retry
4. Partial/Degraded — show succeeded, inline error for failed

## Theming — Required Token Categories

Every theme must define:
- 3 background tiers
- 3 text tiers
- primary / secondary / accent + foregrounds
- 4 semantic status colors + foregrounds
- border / input / ring
- chart colors

**Dark mode validation:**
- Minimum lightness delta between adjacent backgrounds
- Borders shift to lightened strokes
- Images dimmed or desaturated
- Manual override persisted. Default = system preference

## Forms Quick Rules

- Rule | Detail
- Surface mode boundary (`ECO-0041`) | Standard multi-field typing forms apply to `desk-ledger` (`desk-analysis`, `system-configuration`). On `frontline-work` (`work-execution`, `triage-disposition`), replace typing forms with `ChoiceProvider` (`1..9` slot lock), `useFrontlineStream`, and `StageLifecycleSpec`
- Input height | 36–40px in `desk-ledger` (`56px` / `h-14` in `frontline-work` manual fallback). Textarea min 80px
- Labels | Always above — never placeholder-only
- Validation trigger | Text inputs: on blur · Selects/toggles: on change
- Error state | Red border + icon + message below
- Warning state | Amber + icon + message below
- Success state | Green + icon + message below
- Required indicator | `*` in destructive color beside label
- Optional grouping | Label group "Optional." explicitly
- Field grouping | `<fieldset>` / `<legend>`. Separated by `space-8` (32px)
- Multi-step | stepper showing current/total/completed
- Hardware-twin controls (`trail-tune-new`) | Use `<HardwareSurface>`, `<TactileDial>`, and `useTactileControl`. Require Triple-Input Modality (frame-locked `requestAnimationFrame` drag + `48×48px` `-`/`+` glove steppers + tap-to-type `.text-readout-sm` numeric entry) and discrete step haptics (`triggerDetentHaptic`)

## Frontline Kernel Quick Reference (`@wiltermoodj/ui/frontline` — `ECO-0041`)

- Primitive / Function | Decision Node | Operational Purpose
- `resolveTaskExecutionMode(taskIntent)` | `Q18` | Routes `work-execution` and `triage-disposition` to `frontline-work`, and `desk-analysis` and `system-configuration` to `desk-ledger`
- `createFrontlineSession` / `foldFrontlineSession` | `Q1`, `Q6` | Pure append-only intent log (`append`, `adjust`, `void`, `transition-stage`, `resolve-obligation`, `commit`) with telemetry folds
- `useFrontlineStream` / `hardwareBroker` | `Q2` | Focus-agnostic scanner burst (`<= 35 ms`) and key (`1..9`) interceptor with `120 ms` optical deduplication
- `ChoiceProvider` / `stabilizeChoiceSlots` | `Q3` | Unified `1..9` choice surface locking top-K (`topKLock = 3`) slots while prefix matches
- `Obligation` / `classifyMutationGovernance` | `Q4`, `Q10` | Non-blocking governance ledger (`allowance`, `inline`, `at-commit`, `remote`, `post-hoc`) and reversibility classifier
- `CapabilitySpec` / `resolveCapabilityWithLadder` | `Q5` | `250 ms` peripheral degradation ladder (`hardware -> manual-entry -> deferred-post-hoc`)
- `ThroughputProfile` / `validateThroughputProfile` | `Q7`, `Q13` | Declarative station profile contract and static conformance verifier
- `PhaseSpec` / `StageLifecycleSpec` | `Q8`, `Q14` | Hybrid single-capture/stream phases and multi-stage lifecycle progression inside one 2-zone somatic canvas
- `computeSettlementQuanta` / `evaluateSplitAllocation` / `sealBlindCustodyAudit` | `Q9` | Exact/next-up settlement quanta, split deficit calculation, and blind custody variance sealing
- `projectSessionView` | `Q11` | `< 50 ms` privacy-bounded projections (`operator`, `counterparty`, `supervisor`, `ambient-slave`, `blind-auditor`)
- `sensory.signal` | `Q12` | Tri-modal feedback bus: Web Audio chimes + vibration pulses + `200 ms` `data-frontline-pulse` edge flares
- `distributeAcrossTargets` | `Q15` | 1-tap multi-target split presets (`even-split`, `proportional-weight`, `front-load-primary`, `remainder-to-fallback`)
- `rankSpatialHotspots` | `Q17` | 2D visual merchandising and diagram pin ranking into `1..9` choice slots
- `evaluateTelemetryGates` | `Q19` | Continuous scale stability, thermal range, and safety interlock (`NIST 800-88`, `NFPA 400`) gate evaluator
- `resolveCubbySlotRoute` | `Q20` | Deterministic 1-to-N put-wall and BOM kitting slot router

## Data Visualization Rules

- Chart palette: 5–8 colors, ≥30° OKLCH hue separation, WCAG AA contrast
- Mandatory: title, labeled axes with units, legend (multi-series), readable gridlines
- Tooltips: hover desktop / tap mobile. Show value + series + unit. Follow cursor
- Below `md`: simplify to key metrics or tabular summary. Legend below chart. Min height 200px
- Every chart must have a tabular data alternative for screen readers

## Accessibility Checklist

- [ ] WCAG 2.1 Level AA minimum
- [ ] `:focus-visible` 2px ring — never suppressed
- [ ] Focus trapped inside modals. Returned to trigger on close
- [ ] Skip-navigation link on every page
- [ ] One `<h1>` per page. No skipped heading levels
- [ ] `<nav>`, `<main>`, `<aside>` over `<div>` where semantic
- [ ] Status indicators use icon/text in addition to color
- [ ] `44×44px` minimum touch targets in `desk-ledger` (`56×56px` / `h-14` somatic targets in `frontline-work`)
- [ ] `aria-hidden` on decorative images
- [ ] `aria-label` on icon-only buttons
- [ ] `aria-live` regions for dynamic updates
- [ ] `prefers-reduced-motion`: instant state changes, opacity-only transitions

## Sidebar Specification

- State | Width | Behavior
- Collapsed | 64px | Icon-only
- Expanded | 240–280px | Label + icon
- Mobile | full-screen | Drawer overlay

- 5–9 top-level items max
- Low-frequency actions (profile, settings, billing) → header profile menu

## Toolbar / Header Principles

- Toolbar: max height across viewports. Single-row layout preferred. Persistent overflow anchor. Tooltip delay tier. Max 1 primary action
- Spatial Canvas HUD (`<CanvasHudDock>`): floating frosted dock (`z-40`) for `ShellVariant="canvas"` (`pdf-butler`, `velo-term`, `trail-tune-new` studio, `scope`) with icon-only tools and `tabular-nums` zoom/page readouts
- Cross-App Micro-Cards (`<MicroCardSurface>`): semantic `Card surface="raised"` tokens, Concept A/C status blocks, and Decision-Triad approval row (`Approve` `default`, `Request Changes` `outline`, `Reject` `ghost` with hover-destructive tint)
- Header: limited zones. Fixed height. No nav links inside header
- Persistent-surface utilities are icon-only. Transient-surface buttons require text or icon+text

## Surface & Elevation

- Use a defined shadow scale for depth
- Layout/card primitives expose a `surface` prop or equivalent when available
- Layering rule: higher-elevation elements cast larger shadows than lower ones

## Mobile Bottom Actions

### Application Paradigm Evaluation Decision Tree
```
Evaluate App-Wide Action Needs:
- Does app require 2–3 contextual actions per view on average?
  (Search/Filter + Primary Action + Voice/AI Assistant)
- SELECT STICKY FOOTER PARADIGM (App-Wide)
  • 1–3 slot layout flexibility per page
  • Deprecate mobile floating FABs
  • Safe-area inset + scroll buffer

- Does app require strictly 1 floating action across all views?
- SELECT FAB PARADIGM (App-Wide)
          • Single persistent floating button
          • Safe-area inset offset
```

### Sticky Footer Slot Contract (1–3 Slots)
- **1-Slot**: Full-width primary CTA
- **2-Slot**: Left: Context/Secondary action · Right: Primary CTA
- **3-Slot**: Left: Search/Filter · Center: Primary CTA · Right: Assistant/Voice trigger

### Mandatory Bottom Scroll Buffer Rule
- Page container: `pb-[calc(var(--sticky-footer-height,4rem)+env(safe-area-inset-bottom,0px))] md:pb-0`

## Scrollbar Auto-Hide

- Hidden at rest
- Visible on active scroll
- Fade after idle timer
- Zero-width overlay when hidden

## Decision Trees

### Surface Mode Routing (`resolveTaskExecutionMode` — `ECO-0041`)
```
Evaluate task intent (independent of viewport width):
- Active physical or operational execution (receiving, picking, packing, checkout, repair bay, scan-pad)?
  -> taskIntent = "work-execution" -> surface = "frontline-work"
- Queue triage, inspection, grading, or compliance disposition (RMA, ITAD, variance sign-off)?
  -> taskIntent = "triage-disposition" -> surface = "frontline-work"
- Reading financial ledgers, KPI dashboards, audit logs, or authoring long-form prose?
  -> taskIntent = "desk-analysis" -> surface = "desk-ledger"
- Configuring facility topology, RBAC roles, webhooks, or multi-step setup wizards?
  -> taskIntent = "system-configuration" -> surface = "desk-ledger"
```

### Entity Disambiguation & Lookup (`stabilizeChoiceSlots` against `<Combobox>` — `ECO-0041` / `ADR 0048`)
```
Evaluate active execution surface:
- Surface is frontline-work?
  -> Use ChoiceProvider + stabilizeChoiceSlots (topKLock = 3, 1..9 somatic keys, 1500ms idle auto-clear)
- Surface is desk-ledger (> 15 options)?
  -> Use async <Combobox> with 250–300ms keydown debounce and WAI-ARIA listbox roles (ADR 0048)
```

### Multi-Target Distribution & Bulk Operations (`distributeAcrossTargets` against `DataTable` — `ECO-0041` / `ADR 0047`)
```
Evaluate active execution surface:
- Surface is frontline-work (splitting units across stores, waves, or put-wall cubbies)?
  -> Use distributeAcrossTargets presets (even-split, proportional-weight, front-load-primary) + multiplier pills (+1, +6, +12) or resolveCubbySlotRoute
- Surface is desk-ledger (selecting rows to export, tag, or archive)?
  -> Use DataTable row checkboxes + floating batch action bar (ADR 0047)
```

### Dialog type for an action
```
Evaluate task intent and risk:
- Active operational execution or triage (taskIntent = work-execution | triage-disposition)?
- DO NOT open a modal Dialog. Use inline ChoiceProvider (1..9 slots), StageLifecycleSpec somatic tiles, or Obligation ledger (@wiltermoodj/ui/frontline, ECO-0041)
- Destructive / high-stakes / permanent in desk-ledger mode?
- Use alert-style dialog; require explicit confirm
- Contextual side panel in desk-ledger mode?
- Use sheet/side panel when supported
- Standard form or informational in desk-ledger mode?
- Use standard dialog
```

### Button text against icon
```
Evaluate surface persistence:
- Persistent surface?
- Utilities are icon-only with tooltip/aria-label
- Max 1 primary CTA, and it is icon+text
- Transient surface?
- Buttons are text or icon+text
```

### Missing value display
Use an em-dash. Never use N/A, null, -, or blank.

## Source Reference Map

- Topic | Reference
- Casing & Style | ADR 0015
- Layout & Shell Archetypes | ADR 0017 / ECO-0039
- Spacing & Density Tiers | ADR 0018 / ECO-0039
- Typography (Three-Track) | ADR 0019 / ECO-0039
- Color & BrandThemeScope | ADR 0020 / ECO-0039
- Icons & MediaFrame | ADR 0021 / ECO-0039
- Animation & Tactile Physics | ADR 0022 / ECO-0039
- Accessibility | ADR 0023
- Responsive & Matrix Mode | ADR 0024 / ECO-0039
- Forms & TactileDial | ADR 0025 / ECO-0039
- Data Viz | ADR 0026
- Theming & Signature Well | ADR 0028 / ECO-0039
- Buttons & Decision-Triad | ADR 0029 / ECO-0039
- Content Format | ADR 0030
- Copy | ADR 0031
- Modals | ADR 0032
- Toasts | ADR 0033
- Tables | ADR 0034
- Badge Ban | ADR 0035
- Semantic Color at Rest | ADR 0036
- Header | ADR 0037
- Toolbar & CanvasHudDock | ADR 0039 / ECO-0039
- Split Pane | ADR 0040
- Surface Tier | ADR 0041
- Wizards | ADR 0042
- Button Text against Icon | ADR 0043
- Scrollbar Auto-Hide | ADR 0044
- Mobile Bottom Actions | ADR 0045 / ECO-0039
- Tabs & Segmented Controls (RFC) | ADR 0046
- Batch Selection & Bulk Ops (RFC) | ADR 0047
- Combobox & Date Pickers (RFC) | ADR 0048
- Drag-and-Drop & Kanban (RFC) | ADR 0049
- Offline States & Sync (RFC) | ADR 0050
- i18n, RTL & High-Contrast (RFC) | ADR 0051
- Print & PDF Export (RFC) | ADR 0052
- Contextual UI Archetypes | ECO-0039
- Frontline Execution Kernel | ECO-0041
