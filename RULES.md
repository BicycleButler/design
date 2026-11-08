---
title: "Design Repository Rules & Domain Routing"
type: "rules"
status: "active"
description: "Repository rules, compiler standards, and domain routing matrix for the design system."
---

# Design Repository Rules

## Compiler & Verification Standards
- Zero tolerance for `any`, non-null assertions (`!`), or diagnostic suppressions (`// @ts-ignore`, `eslint-disable`).
- All ADRs in `knowledge/design/` must maintain `status: active` and complete frontmatter.
- Frontmatter, links, ADR integrity, and installation check must pass via `npm test`.

## Domain Routing
- For UI component design, token scales, and accessibility: see [DESIGN-RULES.md].
