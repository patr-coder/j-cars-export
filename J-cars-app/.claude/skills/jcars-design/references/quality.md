# J-cars quality standard

## Accessibility

- Target WCAG 2.2 AA.
- Maintain at least 4.5:1 contrast for normal text and 3:1 for large text and essential UI graphics.
- Ensure all functionality works by keyboard and that focus order follows the visual order.
- Use semantic HTML first; add ARIA only where semantics are insufficient.
- Give vehicle images useful alt text based on available make, model, year, and view.
- Provide labels, instructions, error summaries, and live announcements for asynchronous changes where needed.
- Never communicate price changes, stock status, validation, or shipment state through color alone.

## Responsive behavior

- Test at 320 px without horizontal page scrolling.
- Give touch targets a minimum 44 × 44 px effective area.
- Stack dense cards and form sections logically; do not merely shrink desktop layouts.
- Make data tables responsive through prioritized columns, controlled horizontal scrolling, or an alternate card presentation.

## Performance

- Optimize vehicle images and use responsive `srcset`/`sizes`; prefer AVIF or WebP with a fallback where supported.
- Lazy-load below-the-fold media, but never delay the likely largest contentful image unnecessarily.
- Prevent layout shift by reserving media dimensions and stable skeleton space.
- Load only necessary font weights and prefer self-hosted or system fallbacks.
- Avoid large animation libraries for simple transitions and avoid shipping unused components.
- Aim for Core Web Vitals in the green range and test representative mobile conditions.

## Implementation checks

- Centralize design tokens in the project's theme or CSS variables.
- Reuse existing, well-implemented components before adding new dependencies.
- Keep domain data separate from presentation.
- Preserve URL behavior, analytics hooks, test selectors, and API contracts during redesigns unless the task explicitly changes them.
- Add or update component tests for important behaviors when working in a codebase with tests.
- Run the project's lint, typecheck, unit/component tests, and production build when available.

## Final review

Confirm that:

1. The supplied logo is used correctly and remains readable.
2. Blue, black/navy, white, and neutrals form a coherent hierarchy.
3. The primary action is obvious without competing accents.
4. Mobile, tablet, and desktop layouts are intentional.
5. Loading, empty, error, success, and disabled states exist.
6. Keyboard navigation and focus visibility work.
7. Images, fonts, animation, and bundles are performance-conscious.
8. The result feels specific to an international vehicle exporter rather than a generic template.