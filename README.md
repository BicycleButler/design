---
title: Design Guidelines
type: overview
status: active
description: A codebase-agnostic skill for applying design guidelines across any UI project.
---

# Design Guidelines

A codebase-agnostic skill for applying design guidelines across any UI project.

- Installable via terminal
- Source: https://github.com/BicycleButler/design
- Format: Open Knowledge Format markdown

## Install

Run the following command from the root of the project you want to install the skill into:

```bash
curl -fsSL https://raw.githubusercontent.com/BicycleButler/design/main/scripts/install-design-skill.sh | bash
```

Alternatively, if you have cloned the `design` repository locally:

```bash
bash /path/to/design/scripts/install-design-skill.sh .
```

### Installed Project Structure

The installer places the guidelines and agent skill directly into your project:

- **Project Root**:
  - `RULES.md` — Agent design system rules and routing matrix
- **Agent Customizations (`.agents/`)**:
  - `.agents/rules/design-rules.md` — Automatic directory rule discovery
  - `.agents/skills/design/SKILL.md` — Core design skill instructions and checklist
  - `.agents/skills/design/REFERENCE.md` — Token lookup tables and specifications
  - `.agents/skills/design/MIGRATION.md` — Migration guide and strict typing adapter for legacy UI
  - `.agents/skills/design/knowledge/` — Design ADR corpus
  - `.agents/skills/design/scripts/` — Automated compliance and remediation scripts

## Validate

```bash
npx -y tsx scripts/ci/validate-frontmatter.ts .
npx -y tsx scripts/ci/validate-links.ts .
```

## Quick Preview

- Layout: F-pattern, sidebar spec, z-index scale
- Spacing: defined token scale only
- Typography: defined scale and weights
- Color: semantic tokens in components; zero semantic alert color at rest
- Buttons: max 1 primary per surface; correct variant for risk level
- Badges/dots/pills: fully banned; use sub-label stacking or margin wash
- Async states: Empty, Loading, Error, Degraded
- Accessibility: WCAG 2.1 AA, focus rings, 44px touch targets
- Dark mode: minimum lightness delta on adjacent surfaces
- Scrollbars: auto-hide with idle fade

## Upgrade

Re-run the installation command from your project root at any time to refresh the skill and rules from upstream:

```bash
curl -fsSL https://raw.githubusercontent.com/BicycleButler/design/main/scripts/install-design-skill.sh | bash
```

## Uninstall

To remove the installed design skill and rules from your project, run from your project root:

```bash
rm -rf .agents/skills/design .agents/rules/design-rules.md RULES.md
```

## License

MIT
