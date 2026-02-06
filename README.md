# DenGrow

**Grow a plant. Graduate a tree. Plant real impact.**

DenGrow is an on-chain plant NFT game built on [Stacks](https://www.stacks.co/). Users mint a virtual plant, nurture it daily through watering, and watch it evolve through 5 growth stages. When a plant graduates to a Tree, it enters a global **Impact Pool** — a transparent mechanism for converting virtual achievements into real-world tree planting.

## Features

- **Mint & Grow**: Each plant starts as a Seed and progresses through Sprout → Plant → Bloom → Tree
- **Daily Care**: Water your plant once per day to earn growth points (7 points per stage)
- **Unique Traits**: 5 trait categories with rarity weighting generate unique visual combinations
- **Impact Pool**: Graduated trees enter a verifiable pool for batch redemption
- **On-Chain Transparency**: All game state, graduations, and redemptions recorded on Stacks blockchain

## Live Demo

**Testnet**: [https://dengrow.xyz](https://dengrow.xyz) *(coming soon)*

## Architecture

DenGrow uses an **upgradeable architecture** separating data from logic:

```
┌─────────────────────────────────────────────────────────┐
│                      CONTRACTS                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐    ┌──────────────┐                  │
│  │ plant-nft-v2 │───▶│plant-storage │◀── Data Layer   │
│  └──────────────┘    └──────────────┘    (Immutable)   │
│         │                   ▲                           │
│         │                   │                           │
│         ▼                   │                           │
│  ┌──────────────┐    ┌──────────────┐                  │
│  │plant-game-v1 │───▶│impact-registry│◀── Impact Pool  │
│  └──────────────┘    └──────────────┘                  │
│   Logic Layer                                           │
│   (Versionable)                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

| Contract | Purpose | Upgradeable |
|----------|---------|-------------|
| `plant-storage` | Stores all plant data (stage, growth, owner) | No |
| `plant-game-v1` | Game logic (water, cooldowns, progression) | Yes |
| `plant-nft-v2` | SIP-009 NFT standard with game hooks | Yes |
| `impact-registry` | Tracks graduated trees & batch redemptions | No |

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- [Hiro Wallet](https://wallet.hiro.so/) browser extension

### Installation

```bash
# Clone the repository
git clone https://github.com/anthropics/dengrow.git
cd dengrow

# Install dependencies
pnpm install

# Set up environment
cp apps/web/.env.example apps/web/.env
```

Add your [Hiro Platform API key](https://platform.hiro.so/) to `apps/web/.env`:

```
NEXT_PUBLIC_PLATFORM_HIRO_API_KEY=your-api-key-here
```

### Run Locally

```bash
# Start the web app
pnpm dev

# Open http://localhost:3000
```

### Run Contract Tests

```bash
cd packages/contracts

# Run all 103 tests
pnpm test

# Run with coverage report
pnpm test:reports
```

## Deployed Contracts (Testnet)

| Contract | Address |
|----------|---------|
| plant-storage | [`ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ.plant-storage`](https://explorer.hiro.so/txid/ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ.plant-storage?chain=testnet) |
| plant-game-v1 | [`ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ.plant-game-v1`](https://explorer.hiro.so/txid/ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ.plant-game-v1?chain=testnet) |
| plant-nft-v2 | [`ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ.plant-nft-v2`](https://explorer.hiro.so/txid/ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ.plant-nft-v2?chain=testnet) |
| impact-registry | [`ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ.impact-registry`](https://explorer.hiro.so/txid/ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ.impact-registry?chain=testnet) |

**Deployer**: `ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ`

## Game Mechanics

### Growth Stages

| Stage | Points Required | Visual |
|-------|-----------------|--------|
| Seed | 0 | Starting state |
| Sprout | 7 | First leaves |
| Plant | 14 | Growing stems |
| Bloom | 21 | Flowers appear |
| Tree | 28 | **Graduated!** |

### Watering Rules

- Water once per day (144 blocks on mainnet, instant on testnet)
- Each successful water = +1 growth point
- After 7 waters, plant advances to next stage
- Tree stage = graduation to Impact Pool

### Impact Pool

When a plant reaches Tree stage:
1. Automatically registered in `impact-registry`
2. Enters the global Impact Pool
3. Admin records batch redemptions with proof
4. Proof includes hash + URL for verification

## Project Structure

```
dengrow/
├── apps/
│   └── web/                 # Next.js frontend
│       ├── src/app/         # App routes (/, /my-plants, /impact)
│       ├── src/components/  # React components
│       └── src/hooks/       # Custom hooks for contract calls
├── packages/
│   └── contracts/           # Clarity smart contracts
│       ├── contracts/       # .clar files
│       ├── tests/           # Vitest + Clarinet SDK tests
│       └── scripts/         # Deployment & admin scripts
└── docs/                    # Documentation
```

## Admin Operations

For project administrators:

```bash
cd packages/contracts

# Deploy impact-registry (if needed)
pnpm deploy:impact-registry

# Register existing graduated plants
pnpm register:graduated

# Record a redemption batch
pnpm redeem -- --quantity 5 --proof-url "https://example.com/proof.pdf"
```

## Documentation

- [Product Requirements (PRD)](docs/PRD.md)
- [Master Plan & Milestones](docs/MASTER_PLAN.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Task Backlog](docs/TASKS.md)
- [Security Considerations](docs/SECURITY.md)

## Tech Stack

- **Blockchain**: [Stacks](https://www.stacks.co/) (Bitcoin L2)
- **Smart Contracts**: [Clarity](https://docs.stacks.co/clarity)
- **Frontend**: Next.js 14, React, TailwindCSS
- **Testing**: Vitest, Clarinet SDK
- **Wallet**: Hiro Wallet via @stacks/connect

## Contributing

Contributions welcome! Please read the contributing guidelines before submitting PRs.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Built with care for the Stacks ecosystem.**
