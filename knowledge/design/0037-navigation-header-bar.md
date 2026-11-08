---
title: "0037 - Navigation Header Bar"
type: "adr"
description: "Accepted"
status: "active"
last_updated: "2026-11-05T15:30:00Z"
---
# 0037 - Navigation Header Bar

## Context
`top-nav.tsx` implements a `h-16` (64px) header with global search left, and actions right (sync indicator, install button, notifications, theme toggle, user avatar menu). Breadcrumbs are a separate `PlatformBreadcrumbs` component below the header. No standard documents the header's height, zone layout, content rules, or relationship to the sidebar — leaving agents free to add items arbitrarily.

## Decision

### 1 — Header Visibility & Viewport Scope Across Shell Archetypes (`ShellVariant`)
Header visibility and navigation consolidation are governed deterministically by the active `ShellVariant` (`ADR 0017`, `ECO-0039`):
- **`workspace` (Default — Enterprise Back-Office):**
  - **Desktop (`≥ md`):** Top navigation header is **removed (`0px`)**. Global search (`⌘K`), Copilot (`⌘J`), notifications, theme switcher, and user profile dock into the persistent Left Sidebar.
  - **Mobile (`< md`):** Fixed `h-16` (`64px`) frosted `TopNav` header is **retained** (`position: sticky; top: 0`, `z-[var(--z-index-sticky-header)]`, `bg-background/80 backdrop-blur-md`).
- **`commerce` (Customer-Facing Storefront, Public CMS & Catalog):**
  - **Desktop & Mobile (`all viewports`):** Renders a horizontal `h-16` (`64px`) frosted `CommerceHeader` (`bg-background/85 backdrop-blur-md border-b border-border`). Contains 3 zones: Left (Brand logo + title), Center (top-level category/editorial navigation links on `≥ md`, collapsible sheet on `< md`), and Right (search trigger, custom cart/ticket drawer trigger through `headerActionsSlot`, and customer account menu). Internal multi-tenant controls (`AgencySwitcher`, cross-app integration switcher) are strictly omitted from public customer headers.
- **`mobile-first` (Thumb-Zone Field & Companion Apps):**
  - **Mobile (`< md`):** Compact `h-14` (`56px`) top context bar paired with a docked thumb-zone `BottomNavBar` (`3–5` primary destinations).
  - **Desktop (`≥ md`):** Transitions to the standard `0px` top header + persistent `AppSidebar`.
- **`kiosk` (Frontline Register, PIN Timeclock & Handheld RF Scanner):**
  - **All Viewports:** Renders a compact `h-12` (`48px`) `KioskStatusBar` with station identity, sync status slot, and lock action (`onExitKiosk`). Full sidebar and cross-app navigation menus are omitted to maintain task lock.
- **`canvas` (Immersive Spatial, Kinematics & Document Studio):**
  - **Desktop (`≥ md`):** `0px` top header with a locked `64px` (`w-16`) icon-only sidebar rail (`defaultCollapsed={true}`).
  - **Mobile (`< md`):** Compact floating or sticky `TopNav` trigger without bottom scroll buffer overhead.

### 2 — Zone Layout (Mobile Viewports `< md`)

```
[ Left zone (flex-1)      ] [ Center zone (hidden) ] [ Right zone (shrink-0) ]
  Hamburger · Search                                     Install · Bell · Avatar
```

- Zone | Content | Width
- Left | Mobile drawer trigger + `GlobalSearch` icon | `flex-1`, max `xl:max-w-xl`
- Center | Reserved for future logo on marketing pages. Empty in app. | —
- Right | Utility icons + avatar menu | `shrink-0`, items in a flex row with `gap-1.5 sm:gap-3`

### 3 — Desktop Sidebar Consolidation (`≥ md`) & Mobile Sidebar Dock (`< md`)
On desktop viewports (`≥ md`), global controls are distributed in the Left Sidebar:
1. **Top Section:** Application branding + collapse toggle, followed by a full-width Search affordance button with hover tooltip (`⌘K` / `Ctrl+K`).
2. **Bottom Section (3-Tier Cluster):**
   - **Tier 1 (AI Assistant):** Dedicated Copilot AI trigger button with hover tooltip (`⌘J` / `Ctrl+J`).
   - **Tier 2 (System Utilities):** Custom utilities, status alert slots, and Theme toggle.
   - **Tier 3 (User Profile & Account):** User avatar, display name, email/role, with DropdownMenu for Profile, Workspaces, Integrations, Theme, and Log out.

On mobile slide-out sidebar (`< md`):
- The bottom dock streamlines to **Tier 1 (Copilot Assistant)** and active sync alerts only. Omit the avatar dropdown, settings menu, and notification bell from the mobile sidebar dock because they live in `TopNav`.

### 4 — Global Search & Sidebar Tooltips
- Trigger: click on search trigger OR `⌘K` / `Ctrl+K` keyboard shortcut (implemented in `command-palette.tsx` and `GlobalSearch.tsx`).
- Search opens `CommandPalette` / `GlobalSearch` dialog at modal z-index.
- On desktop, search affordance lives at the top of the Left Sidebar (`w-full` in expanded mode, `h-9 w-9` icon in collapsed mode).
- Inline `<kbd>` badges are omitted from sidebar buttons in favor of standard hover tooltips ("Search records & commands (`⌘K` / `Ctrl+K`)" and "Copilot AI Assistant (`⌘J` / `Ctrl+J`)").
- On mobile (below `md`): search button in mobile header opens palette.

### 5 — Right Zone / Utility Allowed Items (Mobile TopNav)
1. `GlobalSyncIndicator` — offline/sync state (conditional)
2. `InstallAppButton` — PWA install prompt (hidden when not applicable)
3. `NotificationBell` — in-app notifications with unread count text indicator
4. User avatar `DropdownMenu` — 32px avatar, `ghost` button trigger

### 6 — User Avatar Dropdown — Required Items
The avatar dropdown must always contain in this order:
1. User name + email (non-interactive label)
2. Role text / Concept C sub-label if applicable (for example, Financial Admin) — never a badge or pill
3. Separator
4. "Workspaces" (if multi-agency)
5. "Bicycle Butler Integrations"
6. "Profile & Settings" → `/settings/profile`
7. Theme sub-menu / selector
8. Separator
9. "Log out"

### 7 — Mobile against Desktop Rule Summary
- **Mobile (`< md`):** TopNav visible + StickyFooter visible + Safe area bottom padding (`pb-[calc(6rem+env(safe-area-inset-bottom,0px))]`).
- **Desktop (`≥ md`):** Hide `TopNav` and `Fab` (`md:hidden`), set primary scroll buffer to `md:pb-0`, and dock utilities in Left Sidebar.

## Consequences
- 100% of vertical canvas space (+128px) reclaimed on desktop across all data tables, kanbans, and split-pane detail views.
- No floating action buttons covering bottom table rows, pagination controls, or form actions.
- Mobile interactions remain completely stable and compliant with ADR 0041/ADR 0045.
