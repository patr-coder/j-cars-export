# J-Cars Exports — Style Guide

Brand reference derived from `Logo/logo-transparent-pdf.pdf` (project root).

## Logo

See `Logo/logo-transparent-pdf.pdf` at the project root.

- Wordmark: **"J-cars Exports"**, bold geometric sans-serif, black.
- Tagline lockup: **"J-cars Exports"** in brand blue, regular weight, set below/beside the wordmark.
- Mark: a globe split into two hemispheres — front hemisphere in brand blue, back hemisphere in black — with horizontal latitude bands.
- Clear space: keep at least the height of the globe icon as empty margin around the full lockup.
- Backgrounds: designed for white/transparent. On dark backgrounds, use a white or blue-only variant (not provided yet — request a dark-mode logo variant before shipping on dark UI).

## Color palette

| Token | Hex | RGB | Role |
|---|---|---|---|
| Brand Blue | `#3E60D9` | 62, 96, 217 | Primary — CTAs, links, active/selected states, icon front |
| Brand Black | `#000000` | 0, 0, 0 | Secondary — headings, body text, icon back |
| White | `#FFFFFF` | 255, 255, 255 | Background / negative space |

Only these two brand colors exist today. For UI needs beyond them (success/error/warning states, disabled states, neutral grays), derive a neutral gray scale rather than inventing new brand hues, and keep saturation low so Brand Blue stays the only "loud" color on screen.

## Typography

The wordmark uses a bold, tight geometric sans-serif (visually close to something like Poppins ExtraBold / Inter Black, but this is a visual approximation, not a confirmed font match — get the exact typeface from whoever designed the logo before locking in a UI font). The tagline uses a lighter weight of a similar geometric sans.

Recommendation for the app UI: pick one geometric sans (e.g. Inter, Poppins) as the single UI typeface, reserve the heaviest weight (700/800) for headings and brand moments, and use 400/500 for body text.

## Voice & tone

Not defined yet — this guide only covers visual identity extracted from the logo. Add copy/voice guidelines here if needed later.

## Usage checklist

- [ ] Primary actions (submit, book, confirm) use Brand Blue.
- [ ] Never place Brand Blue text/icons on a similarly saturated blue background (contrast).
- [ ] Headings and primary text use Brand Black (or a near-black, not pure gray) for consistency with the wordmark.
- [ ] No third brand color is introduced without updating this guide and `tokens/colors.json`.
