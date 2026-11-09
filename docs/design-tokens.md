# Luxera design tokens

The scales below are the ones new UI should use. Most already exist in `src/index.css`;
the goal is to stop adding one-off values.

## Radius

| Token         | Value  | Use                             |
| ------------- | ------ | ------------------------------- |
| `--radius-sm` | 8px    | inputs, thumbnails, small tiles |
| `--radius`    | 14px   | cards, product media, panels    |
| `--radius-lg` | 20px   | large sections, sheets, banners |
| full          | 9999px | chips, pills, icon buttons      |

| `--radius-xs` | 4px | tags, code, tiny marks |

Utilities: `rounded-xs`, `rounded-sm`, `rounded-[var(--radius)]`, `rounded-lg`, `rounded-full`.
ESLint rejects one-off pixel radii such as `rounded-[10px]` (rule `no-restricted-syntax` in
`eslint.config.js`). The spacing scale is guidance only and is not linted yet.

## Spacing

Use the 4px Tailwind scale. Page gutters come from `--pad`, section rhythm from the
`.page-section` wrapper. Do not hand-roll `padding-block` on sections.

## Type roles

- Headings: Morabba (`font-heading`)
- Body: Yekan Bakh (`font-body`)
- Latin brand and kickers only: Cormorant Garamond (`font-display`), JetBrains Mono (`font-mono`)
- Persian text sizes: 12 / 13 / 14.5 / 18 / 24 / 32+ with line-height 1.7 for running text

## Motion

- One easing curve: `--ease-lux`
- Two durations: 180ms for state changes, 320ms for panels and sheets
- Always respect `prefers-reduced-motion`

## Loading

Use shape-matched skeletons (see `PRODUCT_SKELETON` in `CategoryPage`) instead of spinners
for lists and grids, so layout does not jump when data arrives.
