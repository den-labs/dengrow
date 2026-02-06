# DenGrow - Deployment Guide

**Last Updated:** 2026-02-05
**Status:** Testnet Deployed ✅ | Mainnet Pending

---

## Architecture Overview

DenGrow uses an **upgradeable architecture** with 4 contracts:

```
┌─────────────────────────────────────────────────────────┐
│                    CONTRACTS                             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐    ┌──────────────┐                   │
│  │ plant-nft-v2 │───▶│plant-storage │◀── Data Layer    │
│  └──────────────┘    └──────────────┘    (Immutable)    │
│         │                   ▲                            │
│         │                   │                            │
│         ▼                   │                            │
│  ┌──────────────┐    ┌──────────────┐                   │
│  │plant-game-v1 │───▶│impact-registry│◀── Impact Pool   │
│  └──────────────┘    └──────────────┘                   │
│   Logic Layer                                            │
│   (Versionable)                                          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

| Contract | Purpose | Upgradeable |
|----------|---------|-------------|
| `plant-storage` | Stores all plant data | ❌ Immutable |
| `plant-game-v1` | Game logic (water, stages) | ✅ Versionable |
| `plant-nft-v2` | SIP-009 NFT with game hooks | ✅ Versionable |
| `impact-registry` | Tracks graduated trees & redemptions | ❌ Immutable |

---

## Deployed Contracts (Testnet)

| Contract | Address | Explorer |
|----------|---------|----------|
| plant-storage | `ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ.plant-storage` | [View](https://explorer.hiro.so/txid/ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ.plant-storage?chain=testnet) |
| plant-game-v1 | `ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ.plant-game-v1` | [View](https://explorer.hiro.so/txid/ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ.plant-game-v1?chain=testnet) |
| plant-nft-v2 | `ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ.plant-nft-v2` | [View](https://explorer.hiro.so/txid/ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ.plant-nft-v2?chain=testnet) |
| impact-registry | `ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ.impact-registry` | [View](https://explorer.hiro.so/txid/ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ.impact-registry?chain=testnet) |

**Deployer Address:** `ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ`

---

## Local Development

### Prerequisites

```bash
# Install dependencies
pnpm install

# Install Clarinet (for contract development)
brew install clarinet
# or
curl -L https://github.com/hirosystems/clarinet/releases/latest/download/clarinet-macos-x64.tar.gz | tar xz
```

### Run Tests

```bash
cd packages/contracts

# Run all 103 tests
pnpm test

# Run with coverage
pnpm test:reports
```

### Start Web App

```bash
# From root
pnpm dev

# Or just web app
pnpm --filter @dengrow/web dev
```

---

## Testnet Deployment

### Step 1: Get Testnet STX

1. Go to [Testnet Faucet](https://explorer.hiro.so/sandbox/faucet?chain=testnet)
2. Request STX to your wallet address

### Step 2: Configure Environment

```bash
cd packages/contracts

# Create .env.testnet
cat > .env.testnet << EOF
# DenGrow Testnet Configuration
STX_TESTNET_KEY=your_private_key_here
EOF
```

To get your private key from seed phrase:
```bash
pnpm derive-key
# Enter your 24-word seed phrase
# Copy the "Private Key (hex)" value
```

### Step 3: Deploy Contracts

**Deployment Order Matters!**

1. `plant-storage` (data layer - first)
2. `plant-game-v1` (logic layer)
3. `plant-nft-v2` (NFT layer)
4. `impact-registry` (impact pool)

Using Clarinet:
```bash
clarinet deployment generate --testnet
clarinet deployment apply -p deployments/default.testnet-plan.yaml
```

Or using custom scripts:
```bash
# Deploy impact-registry (if not deployed)
pnpm deploy:impact-registry
```

### Step 4: Post-Deployment Setup

After deploying, authorize contracts:

```bash
# Authorize plant-nft-v2 to write to storage
# (Done via contract call by deployer)

# Authorize plant-game-v1 to write to storage
# (Done via contract call by deployer)

# Authorize plant-game-v1 as registrar in impact-registry
# (Done automatically by deploy script)
```

### Step 5: Verify Deployment

```bash
# Test the deployment
pnpm test:testnet

# This will:
# - Mint an NFT
# - Water the plant
# - Query plant state
```

---

## Admin Operations

### Register Existing Graduated Plants

For plants that graduated before impact-registry was deployed:

```bash
pnpm register:graduated
```

### Record Redemption Batch

When converting virtual trees to real-world impact:

```bash
# Redeem 5 trees with proof
pnpm redeem -- --quantity 5 --proof-url "https://example.com/proof.pdf"
```

---

## Mainnet Deployment

### Checklist

- [ ] Audit contracts (recommended)
- [ ] Test thoroughly on testnet
- [ ] Prepare mainnet STX for deployment (~0.5 STX)
- [ ] Update `BLOCKS-PER-DAY` constant to `u144` (24 hours)
- [ ] Update web app contract addresses
- [ ] Configure metadata API base URL

### Contract Changes for Mainnet

In `plant-game-v1.clar`:
```clarity
;; Change from testnet (instant)
(define-constant BLOCKS-PER-DAY u0)

;; To mainnet (24 hours)
(define-constant BLOCKS-PER-DAY u144)
```

---

## Contract Interfaces

### plant-storage (Read-Only)

```clarity
(get-plant (token-id uint))           ;; Returns plant state
(get-stage (token-id uint))           ;; Returns stage (0-4)
(get-growth-points (token-id uint))   ;; Returns growth points (0-7)
(get-plant-owner (token-id uint))     ;; Returns owner principal
(plant-exists (token-id uint))        ;; Returns bool
```

### plant-game-v1 (Public)

```clarity
(water (token-id uint))               ;; Water plant (owner only)
(update-owner (token-id uint) (new-owner principal))  ;; Called by NFT on transfer
```

### plant-nft-v2 (SIP-009)

```clarity
(mint (recipient principal))          ;; Mint new plant
(transfer (id uint) (sender principal) (recipient principal))
(get-owner (id uint))
(get-token-uri (id uint))
```

### impact-registry (Read-Only + Admin)

```clarity
;; Read-Only
(get-pool-stats)                      ;; Returns totals
(get-graduation (token-id uint))      ;; Returns graduation info
(is-graduated (token-id uint))        ;; Returns bool
(get-batch (batch-id uint))           ;; Returns batch info

;; Admin Only
(register-graduation (token-id uint) (owner principal))
(record-redemption (quantity uint) (proof-hash buff) (proof-url string))
(authorize-registrar (registrar principal))
```

---

## Gas Costs (Estimated)

| Operation | Cost (μSTX) | ~USD |
|-----------|-------------|------|
| Deploy plant-storage | ~50,000 | $0.05 |
| Deploy plant-game-v1 | ~35,000 | $0.035 |
| Deploy plant-nft-v2 | ~25,000 | $0.025 |
| Deploy impact-registry | ~50,000 | $0.05 |
| Mint NFT | ~2,000 | $0.002 |
| Water plant | ~1,000 | $0.001 |
| Transfer NFT | ~1,500 | $0.0015 |
| Record redemption | ~10,000 | $0.01 |

**Total Deployment:** ~160,000 μSTX (~0.16 STX)

---

## Troubleshooting

### "Contract already exists"
Deploy with a different contract name or use a new wallet.

### "Insufficient funds"
Get STX from [testnet faucet](https://explorer.hiro.so/sandbox/faucet?chain=testnet).

### "Unauthorized" error
Ensure contract authorization is set up:
- plant-nft-v2 authorized in plant-storage
- plant-game-v1 authorized in plant-storage
- plant-game-v1 authorized as registrar in impact-registry

### "block-height unresolved"
Contract deployed with wrong Clarity version. Use Clarity 2:
```typescript
clarityVersion: ClarityVersion.Clarity2
```

---

## Links

- **Testnet Explorer:** https://explorer.hiro.so/?chain=testnet
- **Testnet Faucet:** https://explorer.hiro.so/sandbox/faucet?chain=testnet
- **Hiro Platform:** https://platform.hiro.so
- **Clarinet Docs:** https://docs.hiro.so/clarinet
- **Stacks Docs:** https://docs.stacks.co
