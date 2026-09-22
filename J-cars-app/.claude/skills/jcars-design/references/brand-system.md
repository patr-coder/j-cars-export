# J-cars Exports brand system

## Brand character

Design for a modern international vehicle exporter. The experience must feel trustworthy, efficient, transparent, globally capable, and automotive-focused. Use clean geometry and confident hierarchy rather than visual noise.

## Logo

- Use `../assets/jcars-logo.jpeg` as the authoritative supplied artwork.
- Preserve its aspect ratio and surrounding white space.
- Never recolor, distort, rotate, outline, shadow, mask, or place the logo over busy imagery.
- On white or very light backgrounds, use the supplied logo unchanged.
- Until transparent or monochrome official variants are supplied, place the existing logo inside a white logo area on dark surfaces.
- Recommended displayed width: 180–260 px in desktop headers, 140–190 px on mobile, and no smaller than 120 px where the full wordmark must remain readable.

## Color tokens

The primary blue matches `--brand-blue` in `src/app/globals.css`, the project's single source of truth for the brand color (itself sourced from the dedicated `J-cars-design` repo, not resampled independently — see that project's `DECISIONS.md`). Use semantic token names in code.

| Role | Token | Value | Guidance |
|---|---|---:|---|
| Brand primary | `brand-600` | `#3E60D9` | Primary buttons, links, active navigation |
| Primary hover | `brand-700` | `#314EB8` | Hover and pressed emphasis |
| Primary dark | `brand-800` | `#233E99` | Strong selected states |
| Primary soft | `brand-100` | `#ECEFFB` | Selected backgrounds, badges |
| Ink | `ink-950` | `#000000` | Logo-aligned headings and critical text |
| Navy | `ink-900` | `#101828` | Default body copy and dark surfaces |
| Muted text | `ink-600` | `#475467` | Supporting text |
| Border | `surface-300` | `#D0D5DD` | Inputs and dividers |
| Soft surface | `surface-100` | `#F2F4F7` | Secondary sections and skeletons |
| Page | `surface-50` | `#F8FAFC` | Application background |
| White | `white` | `#FFFFFF` | Cards and inverse text |
| Success | `success-600` | `#14804A` | Confirmed, available, completed |
| Warning | `warning-600` | `#B54708` | Attention and pending states |
| Error | `error-600` | `#B42318` | Destructive and failed states |

Use brand blue intentionally, not as a background for every section. Maintain one dominant primary action per view. Do not use pure black for long paragraphs; use navy.

## Typography

- Default UI family: `Inter`, with `ui-sans-serif`, `system-ui`, and `sans-serif` fallbacks.
- Use weights 400, 500, 600, and 700. Avoid ultra-light body text and unnecessary 800/900 weights.
- Use a modular, responsive type scale: 12, 14, 16, 18, 20, 24, 30, 36, and 48 px.
- Use 16 px minimum for primary body copy and form inputs; 14 px is acceptable for metadata and dense tables.
- Use sentence case for headings, buttons, tabs, and navigation. Avoid all caps except short vehicle-status labels.
- Use tabular numerals for prices, mileage, years, and dashboard metrics.

## Shape, depth, spacing, and motion

- Use an 8 px spacing grid with 4 px for fine alignment.
- Default corner radius: 10 px controls, 12 px cards, 16 px large panels. Pills are reserved for tags, statuses, and compact filters.
- Prefer borders and subtle elevation. Use `0 8px 24px rgb(16 24 40 / 0.08)` only for floating or emphasized surfaces.
- Use 150–220 ms transitions for color, opacity, and small transforms. Respect `prefers-reduced-motion`.
- Do not animate layout-critical content or use parallax in inventory browsing and admin views.

## Layout

- Design mobile first, then verify at 768, 1024, 1280, and 1440 px.
- Use a centered content container with a 1280 px maximum for public pages; allow dense admin workspaces to extend to 1440 px.
- Use 16 px mobile gutters, 24 px tablet gutters, and 32 px desktop gutters.
- Use clear page titles, breadcrumbs where hierarchy is deep, and sticky actions only when they reduce user effort.

## Imagery and icons

- Vehicle images must be large, sharp, consistently framed, and shown with their real aspect ratio.
- Do not place essential specifications only inside images.
- Use one coherent outline icon family with 1.75–2 px stroke. Do not mix icon styles or use emoji as interface icons.
- Use authentic ports, shipping, vehicles, inspections, and customer-delivery imagery when content is available.