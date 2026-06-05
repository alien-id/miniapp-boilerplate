# CLAUDE.md

## Project Overview

Alien Miniapp Boilerplate — a production-ready starter for building mini apps on the Alien platform. Ships with authentication and payments. Deploys on **Vercel**.

- Platform & SDK docs: https://docs.alien.org/ (auth, payments, bridge, hooks reference)
- Dev Portal: https://dev.alien.org/dashboard
- Setup, env vars, payment flow, API & DB reference: see [README.md](README.md)

## Package Manager

**Always use `bun`**. Never npm, yarn, or pnpm.

```bash
bun run dev / build / lint
bun run db:generate / db:migrate / db:push / db:studio
```

## Tech Stack

- Next.js 16 (App Router), React 19, TypeScript 5 (strict)
- Tailwind CSS 4 (no config file — theme inline in `globals.css`)
- PostgreSQL + Drizzle ORM, Zod 4, TanStack React Query 5
- Alien SDK: `@alien-id/miniapps-react` (client), `@alien-id/miniapps-auth-client` (server), `@alien-id/miniapps-bridge` / `@alien-id/miniapps-contract` (shared)

## Project Structure

Feature-based architecture under `features/<name>/` (`components/`, `hooks/`, `dto.ts`, `queries.ts`, `constants.ts`, `lib.ts`). App routes in `app/`, API routes in `app/api/`, shared UI primitives in `components/ui/`.

Key shared modules:

- `lib/api/with-auth.ts` — `withAuth` wrapper for protected API routes (Bearer extraction + JWT error handling). Use it for every authenticated route.
- `lib/api/client.ts` — `fetchApi` authorized JSON fetcher for client hooks.
- `lib/env.ts` — Zod-validated env access via `getServerEnv()` / `getClientEnv()`. Env vars are documented in `.env.example` and the README.
- `features/auth/lib.ts` — server-side token verification (`verifyToken`, JWKS, audience).
- `app/api/webhooks/payment/route.ts` — Ed25519-verified payment webhook: cross-checks payload against the stored intent and processes idempotently.

## Code Conventions

- **Formatting**: semicolons, double quotes, 2-space indent, trailing commas (multiline)
- **Files**: `kebab-case.ts(x)`; hooks `use-*.ts`
- **Naming**: components/types `PascalCase` (prefer `type` over `interface`), functions/hooks `camelCase`, constants `SCREAMING_SNAKE_CASE`, DB columns `snake_case` in Postgres / `camelCase` in TS
- **Imports**: `@/` alias for cross-feature imports, relative only within a feature; `import type` for type-only imports
- **React**: `"use client"` on all client components, named exports, Tailwind classes directly on elements
- **TypeScript**: explicit return types on exported functions; co-locate Zod schema and inferred type: `export type Foo = z.infer<typeof Foo>;`
- **DB**: use the Drizzle query builder (no raw SQL), `onConflictDoUpdate` for upserts, UUID PKs, timezone-aware timestamps

## Alien SDK Essentials

- Wrap the app in `AlienProvider` (done in `app/providers.tsx`); it sends `app:ready`, exposes `authToken` / `contractVersion`, sets safe-area CSS vars, and intercepts external links.
- Gate host features with `callable` / `useCallable(method)` — never assume a method is available. Outside the Alien app the bridge is unavailable and hooks return `callable: false`.
- Auth: client sends `authToken` as `Authorization: Bearer`; server verifies via `@alien-id/miniapps-auth-client` (`audience` comes from the `ALIEN_AUDIENCE` env — your provider address). The JWT `sub` claim is the user's Alien ID.
- Payments: create the invoice server-side (`POST /api/invoices`, amounts resolved from the catalog only), call `pay()` from `usePayment`, fulfill on the webhook — never on the client result. Webhooks are unversioned, Ed25519-signed (`x-webhook-signature`).
- Full hook/method reference and payload schemas: https://docs.alien.org/ — don't duplicate them here. A live demo of SDK features lives in `features/sdk-showcase/` (Explore page).

## Agent Teams

Pre-configured subagents in `.claude/agents/` (`frontend`, `backend`, `fullstack`, `reviewer`) for parallel work with Agent Teams (enabled in `.claude/settings.json`). Assign teammates non-overlapping files; the `reviewer` agent (haiku, read-only) is cheap — use it liberally after changes.

## Deployment (Vercel)

Import repo → add PostgreSQL → set env vars from `.env.example` → register the webhook in the Dev Portal pointing to `https://<domain>/api/webhooks/payment` → deploy. Set `RUN_MIGRATIONS=true` for auto-migrations on start. Details in the README.

<!-- skrrt:ship -->
## Git workflow — skrrt skills

Use the installed skrrt skills for all git shipping operations:

- **Commits**: Use `/commit` to stage changes and write conventional commits with gitmojis.
- **Pull requests**: Use `/pr` to push branches and open PRs or MRs with the matching forge CLI.
- **Releases**: Use `/release` to draft release notes and publish releases.

Do not write raw `git commit`, `gh pr create`, `gh release create`, `glab mr create`, or
`glab release create` commands manually when these skills are available.

### Deployment conventions (Skrrt)

These rules apply regardless of branching strategy:

- **Tag format:** `vX.Y.Z` (production), `vX.Y.Z-rc.N` (release candidate), `vX.Y.Z-{env}.N` (custom tier). Always use annotated tags.
- **Tags are immutable.** Never delete or move a tag. If a release is bad, cut a new patch version.
- **Build once, promote the same artifact.** The artifact tested in staging must be identical to what reaches production. Never rebuild from a tag.
- **Lower environments do not need tags.** Dev deploys from branch HEAD on merge. Preview environments are per-PR and SHA-scoped.
- **Manual `workflow_dispatch`** can promote an existing artifact to any environment. It complements the tag-driven flow, not replaces it.

<!-- skrrt:branching -->
## Branching strategy — GitHub Flow

This project uses **GitHub Flow**. All agents and contributors must follow these rules:

### Branch rules

- `main` is the only long-lived branch and is always deployable.
- All work happens on short-lived, descriptively named branches.
- Never commit directly to `main` — all changes reach `main` through a pull request.
- PRs always target `main`.
- Feature branches must be up to date with `main` before merging.
- Feature branches are deleted after merge.
- CI runs on every PR.
- Releases are cut by tagging commits on `main`.
- Do not create `develop`, `release/*`, or `hotfix/*` branches.

### Branch naming

Use `<type>/<short-description>` with lowercase and hyphens:
- Features: `feat/add-auth`, `feat/search-index`
- Fixes: `fix/login-redirect`, `fix/null-check`
- Other: `docs/api-guide`, `chore/update-deps`, `refactor/auth-module`

### Keeping branches up to date (Skrrt convention)

- Before opening a PR, rebase the feature branch onto `main`: `git pull --rebase origin main`
- If the rebase has conflicts, resolve them and run `git rebase --continue`.
- If the rebase cannot be resolved cleanly, abort with `git rebase --abort` and ask the user for help.

### PR merge strategy (Skrrt convention)

- Use **squash merge** — each PR becomes one clean commit on `main`.
- This keeps `main` history linear: one commit = one PR = one logical change.

### Tagging and environment (Skrrt convention)

Tags are placed **on `main` only** — never on feature branches. See shared deployment conventions above.

| Environment | Trigger | Tag? |
| --- | --- | --- |
| Dev | Merge to `main` (squash merge) | No |
| Staging | Tag `vX.Y.Z-rc.N` on `main` | Yes |
| Production | Tag `vX.Y.Z` on `main` | Yes |

- Promote to staging by tagging an RC on `main`. If it fails, merge fixes via PR and tag a new RC.
- Promote to production by tagging a clean semver release on the validated commit.

### Agent lifecycle (full auto)

1. Create a branch from `main`: `git switch -c <type>/<description>`
2. Make changes and commit using `/commit`.
3. Before opening a PR, rebase onto `main`: `git pull --rebase origin main`
4. Push and open a PR using `/pr` — target is always `main`.
5. After squash merge, the branch is deleted automatically by the forge.
6. To promote to staging, tag an RC on `main`: use `/release` with a pre-release tag.
7. After staging validation, tag the production release on `main`: use `/release`.
<!-- /skrrt:branching -->
