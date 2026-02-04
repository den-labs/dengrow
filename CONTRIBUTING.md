# Repository Guidelines

## Project Structure & Module Organization

- `apps/web`: Next.js frontend (pages in `src/app`, UI components in `src/components`, shared utilities in `src/lib`, `src/hooks`, and `src/utils`).
- `packages/contracts`: Clarinet smart contracts (`contracts/*.clar`) with tests in `tests/*.test.ts` and deployment plans in `deployments/`.
- `docs/`: product and planning docs (`PRD.md`, `ROADMAP.md`, `TASKS.md`).
- Root configs: `package.json`, `pnpm-workspace.yaml`, `turbo.json`.

## Build, Test, and Development Commands

- `pnpm dev`: run all dev servers via Turbo (web + contracts).
- `pnpm dev:web`: run only the web app.
- `pnpm test:contracts`: run Clarinet/Vitest contract tests.
- `pnpm build`: build all packages (Turbo).
- `pnpm lint`: lint all packages.

## Coding Style & Naming Conventions

- TypeScript + React in `apps/web`, Clarity in `packages/contracts`.
- Use 2-space indentation in TS/TSX and YAML, keep formatting consistent with existing files.
- Components use PascalCase (e.g., `PlantCard.tsx`), hooks use `use*` (e.g., `useCurrentAddress.ts`).
- Contract names are kebab-case (e.g., `plant-nft`) and file names match contract names.

## Testing Guidelines

- Contracts use Vitest + Clarinet (`packages/contracts/tests/*.test.ts`).
- Name tests by contract or feature, keep them focused and deterministic.
- Run with `pnpm test:contracts` before committing contract changes.

## Commit & Pull Request Guidelines

- Commit messages follow Conventional Commits (e.g., `chore(web): ...`, `fix(contracts): ...`).
- Keep commits small and scoped to one change.
- PRs should describe the change, list commands run, and include UI screenshots when relevant.

## Configuration Tips

- Use `NEXT_PUBLIC_STACKS_NETWORK` to switch network behavior (`mainnet`, `testnet`, `devnet`).
- Devnet wallets are simulated in `apps/web/src/lib/devnet-wallet-context.ts`.

## Non-Negotiable Safety & Workflow Rules

### Secrets & Sensitive Data (MUST)

- Never commit: private keys, seed phrases, mnemonics, API keys, tokens, passwords, certificates, wallet export files, or `.env` files.
- Only commit `.env.example` with safe placeholders.
- If unsure whether something is sensitive, treat it as sensitive and STOP to ask.

### Commit Discipline (MUST)

- Make granular commits frequently:
- Commit at least every 30–60 minutes of progress OR when a logical unit is complete.
- Each commit must be scoped to one change (no unrelated refactors mixed in).
- Use Conventional Commits: `feat|fix|chore|docs|test|refactor(scope): message`.

### Pre-Commit Checklist (MUST)

Before any commit:

- Review scope: `git status` and `git diff` (confirm only intended files).
- Ensure no build artifacts or dependencies are staged (e.g., `node_modules/`, `.next/`, `.turbo/`, `dist/`, `.cache/`).
- Run the minimal required checks:
- Contract changes: `pnpm test:contracts`
- Web changes: `pnpm lint` (and `pnpm build` if touching build config)

### Stop Conditions (MUST)

- If you see a large unexpected diff (mass deletions / many unrelated files), STOP and ask how to proceed.
- If commands fail due to environment (registry/DNS), STOP and report exact errors + what was changed.
