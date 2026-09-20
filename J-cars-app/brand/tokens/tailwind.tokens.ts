// J-Cars Exports brand tokens — Tailwind theme extension.
// Merge into your tailwind.config.ts (or the `theme.extend` block if using Tailwind v4 CSS config).
export const jCarsColors = {
  "brand-blue": "#3E60D9",
  "brand-black": "#000000",
} as const;

// Example usage in tailwind.config.ts:
//
// import { jCarsColors } from "./tokens/tailwind.tokens";
//
// export default {
//   theme: {
//     extend: {
//       colors: jCarsColors,
//     },
//   },
// };
