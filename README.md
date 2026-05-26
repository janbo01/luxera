# Luxera

A luxury e-commerce storefront built with React, TypeScript, and Vite. Features a home page, product detail pages, and a shopping cart with smooth add-to-cart animations.

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 6** — dev server and bundler
- **React Router 7** — client-side routing
- **Zustand** — cart and UI state management

## Getting Started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173` by default.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Lint source files |

## Project Structure

```
src/
├── components/
│   ├── home/       # Home page sections
│   ├── product/    # Product listing and detail
│   ├── cart/       # Cart drawer and items
│   ├── layout/     # Header, footer, shared layout
│   └── icons/      # SVG icon components
├── data/           # Product and category data
├── store/          # Zustand stores (cart, UI)
├── types/          # Shared TypeScript types
├── utils/          # Helpers (formatting, animations)
└── illustrations/  # Decorative SVG illustrations

project/            # Original HTML/CSS design prototypes
```

## Design Prototypes

The `project/` directory contains the original HTML prototype files exported from Claude Design. These served as the visual reference for the React implementation and are kept for reference.
