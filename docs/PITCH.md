# DenGrow — Pitch Document

## Tagline

**Grow a plant. Graduate a tree. Plant real impact.**

---

## One-Liner

DenGrow is an on-chain plant NFT game on Stacks that turns daily digital habits into verifiable real-world tree planting.

---

## The Problem

- **Digital fatigue**: NFTs often lack purpose beyond speculation
- **Trust gap**: "Green" initiatives rarely prove their impact
- **Engagement decay**: Games lose users without meaningful progression

---

## The Solution

DenGrow combines three powerful mechanics:

1. **Daily Engagement**: Users water their plant once per day, building habits
2. **Visual Progression**: Plants evolve through 5 stages (Seed → Tree)
3. **Real Impact**: Graduated trees fund actual tree planting, proven on-chain

---

## How It Works

```
Mint → Water Daily → Graduate → Impact Pool → Real Trees
```

1. **Mint**: User receives unique plant NFT with random traits
2. **Grow**: Daily watering earns growth points (7 per stage)
3. **Graduate**: After 28 waters, plant becomes a Tree
4. **Pool**: Trees enter Impact Pool, tracked in smart contract
5. **Redeem**: Batches converted to real trees with proof hashes

---

## Why Stacks?

- **Bitcoin Security**: Inherited from Bitcoin L1 finality
- **Clarity Contracts**: Readable, predictable smart contracts
- **Transparent State**: All game logic verifiable on-chain
- **Ecosystem**: Growing DeFi and NFT community

---

## Technical Highlights

### Upgradeable Architecture

```
┌──────────────┐    ┌──────────────┐
│ plant-nft-v2 │───▶│plant-storage │  ← Immutable data layer
└──────────────┘    └──────────────┘
       │                   ▲
       ▼                   │
┌──────────────┐    ┌──────────────┐
│plant-game-v1 │───▶│impact-registry│  ← Impact tracking
└──────────────┘    └──────────────┘
```

- **Data-Logic Separation**: Storage is immutable, logic is versionable
- **SIP-009 Compliant**: Standard NFT interface
- **103 Tests**: Comprehensive test coverage

### Trait System

5 trait categories with rarity weighting:
- **Pot**: 7 options (Terracotta to Golden)
- **Background**: 7 options (Sky Blue to Aurora)
- **Flower**: 7 options (Daisy to Cosmic Bloom)
- **Companion**: 6 options (None to Phoenix)
- **Species**: 5 archetypes (Flowering, Rose Bush, Pine, Cactus, Bonsai)

---

## Traction

- **Testnet Live**: All 4 contracts deployed and functional
- **Web App**: Full Next.js frontend with wallet integration
- **Impact System**: Graduation and redemption flows tested
- **Documentation**: PRD, deployment guides, security review

---

## Roadmap

| Phase | Status | Description |
|-------|--------|-------------|
| Core Gameplay | ✅ | Mint, water, grow mechanics |
| Web MVP | ✅ | Full UI with wallet connect |
| Traits & Metadata | ✅ | Generative SVGs, rarity system |
| Impact Registry | ✅ | On-chain graduation tracking |
| Mainnet Launch | 🟡 | Ready for deployment |
| Growth Features | ⏳ | Leaderboards, social, events |

---

## Team

Built by developers passionate about blockchain gaming and environmental impact.

- **Smart Contracts**: Clarity expertise, upgradeable patterns
- **Frontend**: Next.js, React, modern web stack
- **Design**: Generative art, gamification mechanics

---

## Ask

We're looking for:

1. **Stacks Grants**: Funding for mainnet launch and marketing
2. **Partnerships**: Tree-planting organizations for redemption program
3. **Community**: Early adopters to test and provide feedback

---

## Links

- **GitHub**: [Repository URL]
- **Demo**: [Testnet URL]
- **Documentation**: [Docs URL]

---

## Contact

[Your contact information]

---

*Built with care for the Stacks ecosystem.*
