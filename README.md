# DenGrow

DenGrow is an on-chain plant NFT game on Stacks. Users mint a plant NFT, water it daily to grow, and once it reaches the Tree stage it enters a global Impact Pool for weekly batch redemption.

## Repo Structure

- `apps/web` — Next.js web app
- `packages/contracts` — Clarinet smart contracts

## Prerequisites

- Node.js 18+
- `pnpm`
- Hiro Platform API key (for Devnet)

## Setup

```bash
pnpm install
cp apps/web/.env.example apps/web/.env
```

Add your Hiro Platform API key to `apps/web/.env`:

```
NEXT_PUBLIC_PLATFORM_HIRO_API_KEY=your-api-key-here
```

## Development

Run the web app from the repo root:

```bash
pnpm dev
```

If you prefer running only the web app:

```bash
pnpm --filter @dengrow/web dev
```

## Contracts

Run contract tests:

```bash
pnpm --filter @dengrow/contracts test
```

## Documentation

Complete project documentation is available in the `docs/` directory:

- **[Product Requirements](docs/PRD.md)** - Product vision and requirements
- **[Master Plan](docs/MASTER_PLAN.md)** - Complete roadmap with milestones and DoD
- **[Deployment Guide](docs/DEPLOYMENT.md)** - How to deploy contracts to testnet/mainnet
- **[Security Review](docs/SECURITY.md)** - Security considerations and audits
- **[Task Backlog](docs/TASKS.md)** - Current development tasks
- **[Roadmap](docs/ROADMAP.md)** - High-level project phases

### Milestones

- **[M1: Core On-Chain Gameplay](docs/milestones/M1_COMPLETION.md)** ✅ Completed

