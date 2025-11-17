# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Next.js App Router source (pages, layout, styles). Edit `app/page.tsx` to change the homepage; global styles live in `app/globals.css`.
- `public/`: Static assets served at the root (e.g., `/vercel.svg`).
- Config: `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`.
- Root: `package.json`, `pnpm-lock.yaml`, `README.md`.
- Imports: Use the alias `@/*` (configured in `tsconfig.json`).

## Build, Test, and Development Commands
- `pnpm dev`: Run the local dev server at `http://localhost:3000`.
- `pnpm build`: Create a production build using Next.js.
- `pnpm start`: Serve the production build locally.
- `pnpm lint`: Run ESLint with Next.js rules.

## Coding Style & Naming Conventions
- Language: TypeScript with `strict` enabled; prefer functional React components and hooks.
- Linting: Follow rules from `eslint.config.mjs` (Next.js core-web-vitals + TypeScript). Fix issues or use `pnpm lint --fix`.
- Formatting: Keep consistent 2-space indentation; avoid unused exports and `any` when possible.
- Naming: Route segment folders lowercase-kebab-case (e.g., `app/user-settings`). Components PascalCase (e.g., `Header.tsx`).
- Imports: Prefer absolute imports via `@/...` over long relative paths.

## Testing Guidelines
- Current status: No tests are configured yet. When adding tests:
  - Use `*.test.ts`/`*.test.tsx` filenames placed next to the unit under test.
  - Favor React Testing Library for components and Playwright for E2E.
  - Add a `test` script in `package.json` (e.g., `vitest run` or `playwright test`). Target ≥80% coverage for new code.

## Commit & Pull Request Guidelines
- Commits: History does not establish a convention; use imperative mood and consider Conventional Commits, e.g., `feat(app): add hero section`.
- PRs: Keep scope small; include a clear description, linked issues (e.g., `Closes #123`), and screenshots/gifs for UI changes.
- Quality gates: Ensure `pnpm lint` passes and the app builds (`pnpm build`). Note any breaking changes.

## Security & Configuration Tips
- Secrets: Store in `.env.local` (not committed). Prefix public variables with `NEXT_PUBLIC_`.
- Dependencies: Use `pnpm` for installs (`pnpm i <pkg>`). Avoid mixing package managers.
