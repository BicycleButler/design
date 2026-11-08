---
name: design
title: design-guidelines
type: skill
status: active
description: >
  Layout structure, spacing tokens, typography, color systems, icons/imagery,
  motion, accessibility, dark mode, forms, frontline execution, and component standards for any UI project.
last_updated: 2026-11-07
---

# Design Guidelines Skill

Read `REFERENCE.md` for full token tables, decision trees, and lookup references. Read `MIGRATION.md` when refactoring legacy repositories to `@wiltermoodj/ui` and `@wiltermoodj/ui/frontline`.

## Quick Checklist (run before every UI commit)

- [ ] Run automated design audit (`npm run audit:design` or `npx omnibutler audit design`). 0 ERRORs and 0 WARNINGs
- [ ] Code properties use `camelCase`. UI labels use Title Case
- [ ] Layout follows defined `ShellVariant` archetype (`workspace`, `commerce`, `mobile-first`, `kiosk`, `canvas`), Task-Intent surface routing (`frontline-work` for active operational/triage execution against `desk-ledger` for desk reading, reporting, prose, and configuration per `ECO-0041`), sidebar spec, and z-index scale
- [ ] Spacing uses only defined spacing tokens and `DensityTier` (`touch`, `comfortable`, `compact`, `ultra-compact`). No ad-hoc values
- [ ] Typography obeys Three-Track scale: Workspace UI capped at 24px (`text-2xl`), `text-display-*` for commerce, `text-readout-*` for telemetry
- [ ] Colors use semantic tokens only. Client website customization (`site`, `storefront`, `scope`) is sandboxed inside `<BrandThemeScope>` with OKLCH WCAG AA contrast. Zero alert colors on passive records at rest (active scan/sensor feedback permitted per ADR 0036)
- [ ] Icons from one approved library only, sized to defined scale. Avatar containers remain immutable. Hero imagery uses `<HeroSurface>` scrims and product media uses `<MediaFrame fidelity="exact">`
- [ ] No linear easing. Obey motion budget (`150–500ms` UI states, `0ms` `requestAnimationFrame` drag on `<TactileDial>` with `triggerDetentHaptic` step pulses). Obey tooltip delays
- [ ] Every async operation defines 4 states: Empty / Loading / Error / Degraded
- [ ] Route and section transitions use defined patterns and durations
- [ ] Accessibility: focus rings, keyboard nav, semantic landmarks, minimum touch targets (`44×44px` in `desk-ledger`, `56×56px` / `h-14` in `frontline-work`)
- [ ] Mobile-first, breakpoint grid, component adaptation rules, safe-area insets
- [ ] Forms: labels above inputs, validation timing, required indicators, grouping. Hardware-twin controls (`<TactileDial>`) use Triple-Input Modality and `<HardwareSurface>` finishes
- [ ] Charts: labeled axes+units, accessible palette, tabular alternative, responsive reflow
- [ ] Themes supply complete token contract. Dark mode lightness delta meets minimum. Signature capture uses `data-signature-well="paper"`
- [ ] Max 1 primary button per surface (with `<HeroSurface>` dual-CTA and `<MicroCardSurface>` Approval Decision-Triad exceptions). Variant matches action type. Loading state defined
- [ ] Button text pairing complies with transient against persistent surface presence rules. Primary CTA in toolbars uses icon + text
- [ ] Dates use relative/absolute rule. Currency formatted. Unknowns use em-dash
- [ ] Copy: verb-first labels, error = what + do, empty state = action invitation
- [ ] Dialog: correct type for risk level in `desk-ledger`. Zero blocking modal dialogs in `frontline-work`
- [ ] Error toasts persist. Success auto-dismiss. Max concurrent limit. Toast ≠ bell notification
- [ ] Table: text left-aligned, numeric right-aligned, sub-label stacking, no badge/dot/pill
- [ ] Badge/status dots/pills are completely banned. Use sub-label stacking or margin wash instead
- [ ] Zero semantic color at rest: allow alert colors only in toasts, open dialogs, validation, or active hardware/sensor feedback
- [ ] Destructive entry points gated behind menu or dialog. No persistent destructive buttons
- [ ] Header: limited zones, fixed height, no nav links inside header
- [ ] Toolbar: 52px single-row layout (or `<CanvasHudDock>` in `canvas` mode), priority collapse, persistent overflow anchor, icon-only utilities, tooltip delay, max 1 primary CTA
- [ ] Surface options through `surface` prop on layout/card primitives. Shadow scale for depth
- [ ] Multi-step wizard: consistent 3-zone layout, background draft auto-save, next button never disabled, accordion review step
- [ ] Mobile bottom actions follow Single Bottom-Zone Authority per active view (`sticky-footer`, `bottom-nav`, `fab`, `none`) with safe-area buffer
- [ ] Scrollbar auto-hide: hidden at rest. Visible on active scroll. Fade after idle timer. Zero-width overlay layout

## Workflows

### 1 — Building a new component

1. Classify `taskIntent` through `resolveTaskExecutionMode(taskIntent)` (`ECO-0041`) and select `ShellVariant` + `DensityTier` (`ECO-0039`). If `frontline-work`, follow **Workflow 4**.
2. Check spacing + layout rules → pick tokens from `REFERENCE.md` tables.
3. Apply color: semantic tokens only. Zero semantic alert color on passive records at rest.
4. Set surface tier through `surface` prop on layout/card primitives.
5. Wire all 4 async states if component fetches data.
6. Run accessibility checklist: focus, ARIA, keyboard, touch target (`44×44px` desk, `56×56px` frontline).
7. Test dark mode: verify minimum lightness delta on adjacent surfaces.
8. Run automated design audit (`npm run audit:design`).

### 2 — Reviewing a PR for style compliance

1. Execute design audit (`npx omnibutler audit design` or `npm run audit:design`) on target scope.
2. Verify task-intent surface mode (`frontline-work` against `desk-ledger`) and check the **Multi-Option & Leniency Matrix** before flagging exceptions.
3. Scan for raw literal spacing/color values → flag, replace with tokens.
4. Check layering values against global scale and confirm icons come from Lucide at defined sizes.
5. Verify form validation timing, reduced-motion guards, and zero resting semantic alert colors on passive records.

### 3 — Adding a new theme

1. Supply all required token categories (or sandbox client themes inside `<BrandThemeScope>`).
2. Run contrast check on every semantic pair (WCAG 2.1 AA $\ge 4.5:1$).
3. Verify minimum lightness delta between adjacent background layers.
4. Visual test on representative pages: overview, detail, form.

### 4 — Building or refactoring a `frontline-work` operational surface (`ECO-0041`)

1. Define a `ThroughputProfile` (`LineSchema`, `StageLifecycleSpec`, `ChoiceProvider`, `CapabilitySpec`, `TelemetryGateSpec`) and validate it with `validateThroughputProfile`.
2. Pass `taskIntent="work-execution"` (or `"triage-disposition"`) to `AppShell` / `OmniButlerShell` and expose a header `surfaceModeOverride` toggle (`preserveSessionAcrossToggle: true`).
3. Enforce the 2-Zone Somatic Topology: Top 60% passive ledger (`Track 3` `text-readout-*` counters, stage pills, `[data-hand="ltr"|"rtl"]`) and Bottom 40% somatic bar (`56px–64px` / `h-14` targets, `1..9` `ChoiceProvider`, single primary stage CTA).
4. Bind hardware peripherals through `useFrontlineStream` and `hardwareBroker` (zero DOM focus traps, zero blocking modals) and emit `sensory.signal(...)` detents.

## Governed Multi-Option & Leniency Matrix (Do Not False-Flag)

- Dimension | Valid Options & Leniency Rules | Authority
- Execution Surface | `frontline-work` (`work-execution`, `triage-disposition`) or `desk-ledger` (`desk-analysis`, `system-configuration`) with `surfaceModeOverride` toggle | ECO-0041
- Shell Archetype | `workspace` (`0px` desktop header), `commerce` (top `CommerceHeader`), `mobile-first` (`BottomNavBar`), `kiosk` (`KioskStatusBar`), `canvas` (`64px` rail + `CanvasHudDock`) | ECO-0039 / ADR 0017
- Density Tier | `touch` (`56–64px` rows), `comfortable` (`64px`), `compact` (`48px`), `ultra-compact` (`36px` rows, `12px` tabular numerals) | ECO-0039 / ADR 0018
- Status Display | Concept C Sub-label Stacking (`text-xs font-medium text-muted-foreground/70`) OR Concept A Left-Edge Margin Wash (`border-l-2`). Neutral glass overlays on `<MediaFrame>` | ADR 0034 / ADR 0035
- Typography Scale | Track 1 (`24px` / `text-2xl` cap for workspace UI), Track 2 (`text-display-*` for `commerce` / editorial heroes), Track 3 (`text-readout-*` `font-mono tabular-nums` for telemetry) | ECO-0039 / ADR 0019
- Button CTA Exceptions | Max 1 primary CTA per surface, EXCEPT `<HeroSurface>` dual-CTA (1 default + 1 outline) and `<MicroCardSurface>` Decision-Triad (`Approve` + `Request Changes` + `Reject`) | ECO-0039 / ADR 0029
- Semantic Color Leniency | Banned on passive records at rest. Permitted in toasts, open dialogs, form validation (`status?.type`), required `*`, `Progress` bars, transient save flashes, and active hardware/sensor/scan pulses (`data-frontline-pulse`, `animate-pulse`) | ECO-0039 / ADR 0036
- Mobile Bottom Zone | Single Bottom-Zone Authority per active view: `sticky-footer` (1–3 slots), `bottom-nav` (3–5 tabs), `fab` (1 floating action), or `none` | ECO-0039 / ADR 0045

## Query Mode (fast lookup)

- Question | Answer
- Shadow for a resting card / dropdown / modal / toast? | `shadow-xs` / `shadow-md` / `shadow-lg` / `shadow-xl`
- When can I show success/warning/destructive color? | Toast, open dialog, form validation, hover inside open menu, or active scan/sensor pulse — never on passive records at rest
- Can I use badge/pill/dot status? | No — fully deprecated. Use Concept C sub-label stacking or Concept A margin wash
- Tooltip delay for toolbar icon / dropdown / standalone avatar? | `200–300ms` / `700–1000ms` / `1000ms`
- Is this a toast or a bell notification? | Current user triggered it → toast. Another actor triggered it → bell
- Hard delete against soft delete confirmation? | Hard delete (`desk-ledger`): `AlertDialog`. Soft delete or low-cost mutation: Undo toast
- Easing curve for entering elements? | `ease-out` (`linear` and `transition: all` are banned)
- Max stagger count? | 8 — items 9+ appear simultaneously
- Missing value display? | em-dash (`—`), never `N/A`, `null`, `-`, or blank
- When must buttons be icon-only or have text? | Persistent surface utilities are icon-only, except max 1 primary CTA which is icon+text. Transient surface buttons use text or icon+text
- How to structure split-pane detail cards? | `DynamicInspector` CSS Grid layout with entity priority rankings (ADR 0040)
- Which mobile bottom action pattern to use? | Enforce Single Bottom-Zone Authority per active view: `sticky-footer`, `bottom-nav`, `fab`, or `none` (ADR 0045 / ECO-0039)
- When to use the simplified Frontline Kernel UI (`@wiltermoodj/ui/frontline`) against Standard UI (`DataTable`, `Dialog`, `SplitPaneLayout`)? | Route by Task Intent (`resolveTaskExecutionMode`, `ECO-0041`). Use `frontline-work` for active operational and triage work (`work-execution`, `triage-disposition`) on all viewports. Reserve `desk-ledger` for desk reading, reports, prose, and settings (`desk-analysis`, `system-configuration`).

## Key Rules (inline reference)

- Domain | Rule | ADR
- Casing | Code properties = camelCase. UI display = Title Case | ADR 0015
- Layout | Defined structure. Sidebar widths. Z-index base→toast | ADR 0017
- Spacing | Defined grid, tokens only, no ad-hoc values, content width caps | ADR 0018
- Typography | Three-Track scale. Workspace UI capped at 24px (`text-2xl`) | ADR 0019
- Color | Semantic tokens only in components. `<BrandThemeScope>` for client themes | ADR 0020
- Icons | Lucide only. Defined sizes. Avatar immutable container | ADR 0021
- Animation | No linear easing. No `transition: all`. Duration budget. Tooltip delay tiers. Reduced-motion | ADR 0022
- Accessibility | WCAG 2.1 AA. Focus rings. Landmarks. `44px` desk / `56px` frontline touch targets | ADR 0023
- Responsive | Mobile-first. Breakpoints. `cards` or `comparison-matrix` table adaptation | ADR 0024
- Forms | Labels above inputs. Validation timing. `<TactileDial>` Triple-Input Modality | ADR 0025
- Data Viz | Labeled axes+units+legend. Accessible palette. Tabular alt. Responsive | ADR 0026
- Theming | Complete token contract. Minimum dark mode delta. `data-signature-well="paper"` | ADR 0028
- Buttons | 1 primary per surface (plus Hero/Decision-Triad exceptions). Loading state | ADR 0029
- Content Format | Relative time threshold. Currency format. Unknowns = em-dash | ADR 0030
- Copy | Verb-first labels. Error = what+what-to-do. Empty state = action invitation | ADR 0031
- Modals | Correct type for risk level in `desk-ledger`. Zero blocking modals in `frontline-work` | ADR 0032
- Toasts | Success auto-dismiss. Error persistent. Max concurrent. Undo toast for soft deletes | ADR 0033
- Tables | Text left / numeric right. Row height. Sub-labels. No badges/dots/pills | ADR 0034
- Badge Ban | Badges, dots, pills = total ban system-wide. Sub-label stacking or margin wash | ADR 0035
- Semantic Color at Rest | Zero semantic alert color on passive resting surfaces. Active scan/sensor pulses permitted | ADR 0036
- Header | Archetype-aware header (`0px` desktop in `workspace`). Fixed height. No nav links in workspace header | ADR 0037
- Toolbar | 52px single-row layout (or `<CanvasHudDock>`). Priority collapse. Primary CTA is icon+text | ADR 0039
- Split Pane | DynamicInspector CSS Grid, priority rankings | ADR 0040
- Elevation | 5-tier shadow scale. Borderless resting containers. `surface` prop on primitives | ADR 0041
- Multi-Step Wizard | 3-zone layout. Background draft auto-save. Next never disabled. Accordion review | ADR 0042
- Button Text against Icon | Transient surface buttons require text/icon+text. Persistent surface utilities are icon-only | ADR 0043
- Scrollbar Auto-Hide | Hidden at rest. Visible on active scroll. Fade after idle. Zero-width overlay | ADR 0044
- Mobile Bottom Actions | Single Bottom-Zone Authority per view (`sticky-footer`, `bottom-nav`, `fab`, `none`). Safe-area buffer | ADR 0045
- Contextual Archetypes | 5 `ShellVariant` archetypes, 4 `DensityTier` presets, 3-Track Typography, `<BrandThemeScope>`, `<HardwareSurface>` | ECO-0039
- Frontline Execution | Task-intent routing, 60/40 somatic layout, `56px` targets, `1..9` slot lock, zero blocking modals | ECO-0041
