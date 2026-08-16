# Repository Guidelines

## Project Structure & Module Organization

This is an Astro 4 static portfolio/CV site. The single landing page lives in `src/pages/index.astro`; `src/pages/cv-[lang].pdf.ts` generates one downloadable PDF per language. Reusable UI is in `src/components/`, with CV sections in `src/components/sections/`, layouts in `src/layouts/`, and custom SVG icons in `src/icons/`.

Keep data separate by purpose: put language-neutral profile data, IDs, dates, URLs, and skills in `src/data/content.json`; put user-facing copy in `src/i18n/<lang>.json`. Client-side translation, validation, and DOM bindings live in `src/i18n/`. Analytics code is in `src/analytics/`, PDF model/rendering in `src/cv/`, and static assets in `public/`.

## Build, Test, and Development Commands

Use pnpm; the committed lockfile is the deployment source of truth.

```bash
pnpm install       # install dependencies
pnpm dev           # start the Astro development server
pnpm build         # run astro check, then generate dist/
pnpm preview       # serve the generated site locally
```

There is no separate automated test suite or linter. `pnpm build` is the required validation step because it type-checks Astro/TypeScript and validates translation parity before building.

## Coding Style & Naming Conventions

Follow the existing TypeScript and Astro style: two-space indentation, ESM imports, semicolons, and scoped component styles. Use PascalCase filenames for components (for example, `LanguageSelector.astro`), camelCase for TypeScript modules/functions, and kebab-case page routes. Import project modules through the `@/` alias rather than deep relative paths.

Use stable, lowercase IDs in `content.json` (for example, `cicd-system`). Any new structural item must have matching text under the corresponding key in every `src/i18n/*.json` file. Reuse CSS custom properties from `Layout.astro`; do not hardcode theme colors.

## Commit & Pull Request Guidelines

Recent history uses concise Conventional Commit-style subjects, such as `feat: add PDF generation` and `chore: remove CV JSON files`. Prefer `feat:`, `fix:`, `chore:`, or a scoped form such as `feat(i18n): ...`, written in imperative mood.

Keep pull requests focused. Include a clear summary, linked issue when applicable, validation results (`pnpm build`), and screenshots for visible UI or theme changes. Do not commit generated `dist/` output unless explicitly requested.

## Deployment & Configuration

GitHub Actions deploys `dist/` to GitHub Pages after pushes to `main`. Keep deployment-sensitive values in the existing environment/configuration flow; do not add secrets or analytics keys to source files.
