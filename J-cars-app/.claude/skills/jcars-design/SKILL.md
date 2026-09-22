---
name: jcars-design
description: Apply the official J-cars Exports visual identity and reusable design system to websites, vehicle marketplaces, customer portals, admin dashboards, mobile interfaces, presentations, and other digital products. Use when creating, redesigning, reviewing, or implementing any J-cars interface, page, component, prototype, or branded asset, especially in React, Next.js, Tailwind CSS, or HTML/CSS.
---

# J-cars Design

Create polished, fast, responsive J-cars Exports experiences from the supplied logo and the blue, black, and white brand identity. Preserve brand consistency while adapting layouts to the user's product, framework, content, and audience.

## Required workflow

1. Inspect the target application, existing component system, framework, and constraints before editing.
2. Read `references/brand-system.md` for every task.
3. Read `references/components.md` when creating or reviewing UI components, pages, dashboards, catalogues, or forms.
4. Read `references/quality.md` before finalizing implementation.
5. Reuse the logo from `assets/jcars-logo.jpeg`; do not redraw, recolor, stretch, crop, or add effects to it.
6. Apply the supplied tokens directly or map them to the project's existing theme system.
7. Verify responsive states, keyboard navigation, contrast, loading, empty, error, and success states.

## Design direction

- Express trust, international reach, automotive expertise, efficiency, and premium professionalism.
- Use blue for primary actions and active states, black/navy for hierarchy, and white/light neutrals for clarity.
- Prefer generous whitespace, strong photography, crisp typography, compact data presentation, and restrained motion.
- Make inventory and business data easy to scan. Preserve function over decoration.
- Avoid generic AI aesthetics: excessive gradients, glowing borders, glassmorphism everywhere, oversized pills, decorative charts, or animation without purpose.
- Do not introduce unrelated brand colors. Semantic colors are permitted only for feedback and status.

## Output expectations

- Implement real, production-oriented layouts rather than isolated styling suggestions when code is requested.
- Reuse components and tokens; do not scatter raw colors, spacing values, or one-off styles.
- Preserve the application's behavior and data flows during redesigns.
- When the user provides a screenshot or existing page, identify the highest-impact inconsistencies and correct them systematically.
- When requirements are incomplete, make conservative decisions consistent with an international vehicle-export platform and state only material assumptions.

## Assets and references

- `assets/jcars-logo.jpeg`: official supplied logo.
- `assets/jcars-tokens.css`: portable CSS custom properties and baseline theme.
- `references/brand-system.md`: identity, color, typography, layout, imagery, and logo rules.
- `references/components.md`: page and component patterns.
- `references/quality.md`: accessibility, responsive behavior, performance, and acceptance checks.