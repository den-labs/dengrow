# DenGrow — Product Requirements Document (PRD)

## Overview

DenGrow is an on-chain plant NFT game built on Stacks.
Each plant grows through daily care actions recorded on-chain.
When a plant reaches the final stage ("Tree"), it enters a global Impact Pool.
Impact is redeemed weekly in transparent batches based on real-world capacity.

DenGrow prioritizes verifiable care, transparency, and sustainability over infinite promises.

---

## Goals

- Ship a functional MVP in under 7 days.
- Generate real, justified on-chain activity (daily interactions).
- Provide a clear and honest impact narrative (weekly batch redemptions).
- Be eligible and competitive for Stacks Builder Rewards.

---

## Non-Goals (MVP)

- No NFT marketplace (buy/sell/list).
- No fungible game token.
- No promise of “1 NFT = 1 real tree”.
- No exact GPS coordinates for planted trees.
- No complex economics or governance.

---

## Target Users

- Builders, collectors, and impact-oriented users.
- Users willing to perform small daily on-chain actions.
- Users interested in verifiable, transparent impact.

---

## Core Gameplay Loop

1. User mints a Plant NFT.
2. User performs a daily `water()` action (1 tx/day).
3. Plant accumulates growth points.
4. After 7 successful days, the plant becomes a "Tree".
5. The Tree enters the Impact Pool.
6. Impact is redeemed weekly in batches.

---

## Plant Stages

- Stage 0: Seed
- Stage 1: Sprout
- Stage 2: Plant
- Stage 3: Bloom
- Stage 4: Tree (Graduated)

Tree is reached after 7 valid daily water actions.

---

## Actions

### Water

- Callable once per day (block-based cooldown).
- Grants +1 growth point.
- Required to progress.

### Fertilize (Optional, MVP+)

- Limited usage.
- Can recover missed progress.
- Not required for Tree.

---

## Traits (Assigned at Mint)

Each plant has 4 immutable traits:

- Pot: clay | stone | recycled
- Background: forest | desert | mountain | city | beach
- Flower: rose | sunflower | orchid | tulip | lavender | cactus-bloom
- Companion: bee | butterfly | bird | none

Traits affect visuals only.

---

## Impact Model

- Each Tree generates 1 Impact Credit.
- Impact Credits enter a global Impact Pool.
- Redemptions occur weekly based on real-world capacity.
- Redemptions are recorded on-chain with batch proofs.

---

## Costs

- Gameplay actions require only network fees.
- No in-game fees for water or fertilize.
- Optional future donation mechanisms are out of scope for MVP.

---

## Success Metrics

- Number of minted plants.
- Daily active users.
- Average watering streak.
- Trees graduated per week.
- Successful weekly batch records.

---

## Risks & Mitigations

- Spam: block-based cooldowns.
- Over-promising impact: batch-based redemptions only.
- Renderer failure: fallback stage images.
- Fee volatility: display estimated fees before signing.

---

## Deliverables

- Public monorepo (contracts + web).
- Deployed contracts (testnet + mainnet).
- Functional UI with wallet connection.
- Weekly batch ledger on-chain.
