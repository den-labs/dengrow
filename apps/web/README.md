# DenGrow Web App

Next.js web application for DenGrow - an on-chain plant NFT game on Stacks.

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

Create `.env.local` file:

**For Testnet (Recommended):**
```bash
NEXT_PUBLIC_STACKS_NETWORK=testnet
```

**For Devnet (Development):**
```bash
NEXT_PUBLIC_STACKS_NETWORK=devnet
NEXT_PUBLIC_DEVNET_HOST=platform
NEXT_PUBLIC_PLATFORM_HIRO_API_KEY=your-api-key-here
```

### 3. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Network Configuration

The app supports three networks:

- **Testnet** (default): Public Stacks testnet
- **Mainnet**: Stacks mainnet (not yet deployed)
- **Devnet**: Local development with Hiro Platform

### Switching Networks

Use the Network Selector dropdown in the navbar to switch between networks. Your selection is persisted in localStorage.

## Wallet Connection

The app uses [@stacks/connect](https://github.com/hirosystems/connect) v8 for wallet integration.

Supported wallets:
- Hiro Wallet (browser extension)
- Xverse Wallet
- Leather Wallet

### Connecting to Testnet

1. Install a Stacks wallet (e.g., [Hiro Wallet](https://wallet.hiro.so/))
2. Switch your wallet to Testnet network
3. Click "Connect Wallet" in the app
4. Approve the connection in your wallet

### Getting Testnet STX

Visit the [Testnet Faucet](https://explorer.hiro.so/sandbox/faucet?chain=testnet) to get free testnet STX for testing.

## Features

### My Plants Page

- View all your plant NFTs
- See real-time growth progress from on-chain data
- Water plants (requires cooldown: 144 blocks ≈ 24 hours)
- Mint new plants

### Plant States

Plants progress through 5 stages:
1. **Seed** (0-1 waters)
2. **Sprout** (2-3 waters)
3. **Plant** (4-5 waters)
4. **Bloom** (6 waters)
5. **Tree** (7+ waters) - Final stage 🌳

## Smart Contracts

The app integrates with two Stacks smart contracts:

### Testnet Deployment

```
Deployer: ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ

Contracts:
- plant-nft:  ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ.plant-nft
- plant-game: ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ.plant-game
```

[View on Explorer](https://explorer.hiro.so/address/ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ?chain=testnet)

## Development

### Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── my-plants/         # My Plants page
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── plants/           # Plant-related components
│   │   └── PlantCard.tsx # Individual plant card
│   ├── ConnectWallet.tsx # Wallet connection button
│   ├── HiroWalletProvider.tsx # Wallet context provider
│   ├── Navbar.tsx        # Navigation bar
│   └── NetworkSelector.tsx # Network switching dropdown
├── hooks/                 # Custom React hooks
│   ├── useGetPlant.ts    # Fetch plant state from contract
│   ├── useNftHoldings.ts # Fetch user's NFTs
│   └── useCurrentAddress.ts # Get current wallet address
├── lib/                   # Utilities and helpers
│   ├── game/             # Game contract operations
│   │   └── operations.ts # waterPlant()
│   ├── nft/              # NFT contract operations
│   │   └── operations.ts # mintFunnyDogNFT()
│   ├── contract-utils.ts # Contract call helpers
│   ├── network.ts        # Network configuration
│   ├── stacks-api.ts     # Stacks API client
│   └── userSession.ts    # User session management
└── constants/            # App constants
    └── contracts.ts      # Contract addresses
```

### Scripts

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm prettier:fix     # Format code
```

### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Chakra UI + Tailwind CSS
- **State**: React Query (TanStack Query)
- **Blockchain**: @stacks/connect, @stacks/transactions, @stacks/network
- **TypeScript**: Fully typed

## Troubleshooting

### Wallet won't connect

1. Ensure your wallet is set to the same network as the app (check Network Selector)
2. Try disconnecting and reconnecting
3. Clear browser cache and reload
4. Check browser console for errors

### Contract calls fail

1. Verify you have enough STX for gas fees
2. Confirm contract addresses match the selected network
3. Check transaction status in [Stacks Explorer](https://explorer.hiro.so/?chain=testnet)

### Plant data not loading

1. Ensure you've minted at least one plant
2. Check that the contract addresses are correct in `src/constants/contracts.ts`
3. Verify the plant was initialized (should happen automatically on mint)

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) in the repo root.

## License

See [LICENSE](../../LICENSE) in the repo root.
