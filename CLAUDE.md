# CLAUDE.md — dengrow

This file scopes Claude Code to the **dengrow** project only.

## Project Context

- **dengrow** is an on-chain plant NFT game on Stacks (Bitcoin L2). It is the ONLY project in scope for this session.
- Do NOT reference or confuse with other DenLabs projects (den-vault, denlabs-engine, SnowRail, Florece).
- Monorepo with two workspaces: `apps/web` (Next.js) and `packages/contracts` (Clarity smart contracts).

## Tech Stack

- **Language**: TypeScript (strict mode)
- **Frontend**: Next.js 14 (App Router), React 18, Chakra UI 2, Tailwind CSS 3, Framer Motion
- **Blockchain**: Stacks — use `@stacks/transactions` and `@stacks/network` for on-chain interactions. **Do NOT use the `stx` CLI or raw Hiro REST API** for transaction building.
- **Wallet**: `@stacks/connect` v8 (showConnect pattern, NOT deprecated connect())
- **Smart Contracts**: Clarity 2.0, tested with Clarinet SDK 3 + Vitest
- **Package Manager**: pnpm 9 with Turbo for orchestration
- **Formatting**: Prettier (100 char, 2 spaces, single quotes) + ESLint (next/typescript)

## Common Commands

```bash
# Web app
pnpm dev                              # Start Next.js dev server
pnpm --filter @dengrow/web build      # Production build

# Smart contracts
pnpm --filter @dengrow/contracts test              # Run all contract tests
pnpm --filter @dengrow/contracts test:reports       # Tests with coverage + costs
pnpm --filter @dengrow/contracts test -- tests/plant-game-v1.test.ts  # Single test

# Full monorepo
pnpm build                            # Build all workspaces
pnpm lint                             # Lint all workspaces
```

## Architecture

### Smart Contracts (Clarity 2.0)

Layered architecture with separation of storage, logic, and NFT:

| Contract | Role |
|----------|------|
| `plant-storage` | Data layer (immutable) |
| `plant-game-v1` | Game logic (versionable) |
| `plant-nft` | SIP-009 NFT standard |
| `impact-registry` | Graduation tracking + Impact Pool |
| `plant-game` | Legacy backward compat |

### Web App Structure

```
apps/web/src/
├── app/           # Next.js App Router pages
├── components/    # React components (plants/, ui/)
├── hooks/         # Custom hooks (useGetPlant, useNftHoldings, etc.)
├── lib/           # Utilities (game/, nft/, network, stacks-api)
├── constants/     # Contract addresses, devnet config
└── utils/         # Formatting, explorer links
```

### Networks

- **Testnet**: Default. Deployer: `ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ`
- **Devnet**: Local development via Hiro Platform
- **Mainnet**: Not yet deployed (see docs/IMPACT_POLICY.md)

## Workflow Rules

- When a workflow mode is specified (Create, Edit, Validate), lock into that mode immediately. Do NOT suggest alternatives unless explicitly asked.
- Always verify tool/CLI availability before building automation scripts around them.
- For Stacks testnet interactions: use `@stacks/transactions` + `@stacks/network`. Test locally with Clarinet before testnet deployment.
- Before making changes, read existing patterns in the target files first.

## Testing

- **Contracts**: `pnpm --filter @dengrow/contracts test` (Vitest + Clarinet SDK, single fork mode)
- **Web**: `next lint` for linting, `next build` for type verification
- **E2E**: Playwright available at root level (`pnpm screenshots`)
- Always run relevant tests after making changes.

## Commits

- Use conventional commit format: `feat(scope)`, `fix(scope)`, `docs(scope)`, `chore(scope)`
- Scopes: `web`, `contracts`, `m1`-`m6` (milestones), or feature name
- Group commits by feature/concern, NOT by file type
- Keep commit messages concise (1-2 sentences for the summary line)

## Environment Setup

Copy `apps/web/.env.example` to `apps/web/.env` and configure:
```
NEXT_PUBLIC_STACKS_NETWORK=testnet
NEXT_PUBLIC_PLATFORM_HIRO_API_KEY=<your-key>
```
