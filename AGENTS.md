# Полевской Bus

React + Vite + Tailwind CSS app for the public transport schedule of Polevskoy.

## Start

A Vite dev server is already running in Figma Make. Do not start one manually.

## What to edit first

- `src/App.tsx` - app shell and page switching
- `src/pages/*` - home, routes, map, profile screens
- `src/data/transitData.ts` and `src/data/transitData.json` - transport data and helpers
- `src/index.css` - global styles and Tailwind v4 setup

## App notes

- Keep the UI mobile-first and inside the 390px layout.
- Most text is in Russian.
- Preserve default exports.
- Use Tailwind utilities for layout and styling.
- Avoid touching generated/imported assets unless the task needs it.

## Scripts

- `npm run build`
- `npm run format`
- `npm run android:sync`
- `npm run android:apk`
