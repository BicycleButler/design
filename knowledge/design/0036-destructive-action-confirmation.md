---
title: "0036 - Semantic Color at Rest & Destructive Action Confirmation"
type: "adr"
description: "Accepted"
status: "active"
last_updated: "2026-11-05T05:45:00Z"
---
# 0036 - Semantic Color at Rest & Destructive Action Confirmation

## Context
Destructive actions (deleting records, revoking access, cancelling contracts) present permanent risk of data loss. Destructive workflow entry points must be strictly menu-gated, and preceding trigger controls must remain visually neutral at rest. More broadly, all semantic alert colors — not just destructive red — create visual anxiety and noise when present on resting surfaces.

## Decision

### 1 — Zero Semantic Color on Resting UI Surfaces

This is the foundational rule governing all semantic colors (success, warning, and destructive) in the application UI:

- **Semantic Alert Colors Banned at Rest:** Success, warning, and destructive colors are **forbidden** on resting cards, rows, headers, and buttons. This extends and formalizes the color-system rule in [0020-color-system.md] (§5 — Dynamic-Only Semantic Status Palette).
- **Allowed Surfaces Only (State-Kinetic Semantic Color Boundary):** Semantic colors can only manifest during **active user interaction, live hardware/sensor feedback, or ephemeral system events**:
  - Destructive / warning colors → inside an **open overflow menu** (red text + background highlight on hover of the destructive item only)
  - Destructive confirm button → inside an **active `AlertDialog`** modal
  - Success / warning / error colors → **transient toast notifications** (<4–8s auto-dismiss, per [0033-toast-notification-rules.md])
  - Form validation error colors → **only on active blur or submission failure** (per [0025-forms-inputs.md] §3)
  - Change indicators (percentage or monetary up/down deltas) → permitted inline in data tables, financial ledgers (`erp`, `velo-term`), and KPI cards (contextual data display, not static status signaling)
  - **Active Hardware Scan & Sensor Capture (`kiosk` / `mobile-first`):** Authorized for active scan banners, live recording indicators, and offline banners (`KioskStatusBar`)
  - **Continuous Scientific & Kinematics Data Series:** Authorized inside plotted telemetry curves and threshold zones (`trail-tune-new` leverage/damping curves, per [0026-data-visualization.md])
- **Neutral at Rest (All 19 Apps):** Resting cards, rows, and labels must use neutral typography, Sub-label Stacking, or Margin Wash. Never use static semantic alert colors or colored status pills on passive records.

### 2 — Menu-Gated Destructive Entry Points
- **Resting Trigger Neutrality:** Resting buttons preceding a destructive workflow **must remain neutral or `ghost` style**. Persistent red "Delete" buttons on resting screens are strictly forbidden (covered by Rule 1 above).
- **Allowed Entry Points:** Initiate destructive workflows **only** from an open overflow menu (`...`) (with hover-gated red highlight) or a confirmation dialog.

### 3 — When Confirmation Is Required

**Always require confirmation dialog:**
- Action | Reason
- Permanently delete a record | Irreversible data loss
- Bulk delete (≥2 records) | Higher impact, harder to recover
- Revoke user access / role removal | Security consequence
- Cancel a deal / close a deal (financial) | Revenue-impacting, can affect commissions
- Disconnect an integration (Google, Stripe) | Service disruption
- Clear / reset data (import rollback) | Bulk data modification

**Do NOT require confirmation:**
- Action | Reason
- Archive a record | Reversible — unarchive is available
- Mark as inactive | Reversible
- Reassign an owner | Reversible
- Save / publish a form | Positive-direction action

### 4 — Confirmation Dialog Requirements
Use `AlertDialog` (not standard `Dialog` — see ADR 0032) for all hard destructive confirmations:
- **Title:** Question form naming the entity. "Delete John Smith?" / "Delete 5 Contacts?"
- **Description:** Clear sentence explaining the consequence. "This action cannot be undone."
- **Cancel Button:** `outline` variant, left position, labeled "Cancel". Keyboard focus lands on Cancel upon dialog opening.
- **Confirm Button:** `destructive` variant, right position, explicitly naming the action + entity: "Delete Contact", "Delete 5 Contacts".
- **Forbidden:** Enter key auto-confirmation is disabled (Radix default). Confirm button labels like "OK", "Yes", or "Confirm" alone are banned.

### 5 — Undo as Alternative to Confirmation
For soft-delete workflows where records can be recovered within a grace period:
- Skip the confirmation dialog.
- Do the action immediately (optimistic UI, ADR 0022).
- Show an 8-second undo toast ([0033-toast-notification-rules.md] §4): "John Smith deleted. [Undo]".

## Consequences
- Resting surfaces stay free of semantic color. Alert colors appear only during active interactions or live hardware/system events.
- Destructive workflows require deliberate overflow menu interaction.
- Dialog focus defaults protect against accidental keyboard confirms.
- The principle extends ADR 0020 §5 from the color system level to the component behavior level.
