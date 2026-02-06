## DenGrow — Master Task Plan (End-to-End)

### Milestone 0 — Repo Baseline ✅ COMPLETE

- [x] Monorepo structure: `apps/web`, `packages/contracts`
- [x] Marketplace removed
- [x] Docs added: PRD, ROADMAP, TASKS
- [x] Fix dev build blockers (`pino-pretty`)
- [x] Rename `funny-dog` → `plant-nft`
- [x] Contract tests passing

**DoD:** `pnpm dev` runs, `pnpm test:contracts` passes, `git status` clean.

---

## Milestone 1 — Core On-Chain Gameplay ✅ COMPLETE

**Goal:** A plant can be minted and "watered" daily with verifiable on-chain state.

### 1.1 Plant Game Contract

- [x] Add `plant-game-v1` contract (upgradeable architecture)
- [x] Store plant state in `plant-storage` (data layer):
  - stage (Seed → Sprout → Plant → Bloom → Tree)
  - growth points / successful days
  - last water block (cooldown)

- [x] Implement `water(token-id)` with:
  - ownership check (only token owner can water)
  - cooldown enforced (block-based "daily")
  - stage progression after required days

- [x] Read-only endpoints:
  - `get-plant(token-id)`
  - `can-water(token-id)`
  - `get-stage(token-id)`

- [x] Emit event/log when stage changes (especially Tree graduation)

### 1.2 Deployment Wiring

- [x] Add contracts to `Clarinet.toml`
- [x] Testnet deployment (plant-storage, plant-game-v1, plant-nft-v2)
- [x] 103 tests passing

**Contracts deployed to testnet:**
- `ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ.plant-storage`
- `ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ.plant-game-v1`
- `ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ.plant-nft-v2`

---

## Milestone 2 — Web MVP (Playable Loop) ✅ COMPLETE

**Goal:** A user can mint and water from the UI.

### 2.1 Wallet + Network UX

- [x] Wallet connect stable (testnet)
- [x] Network selector works (Testnet default)
- [x] Clear UX states (disconnected, connecting, pending, confirmed)

### 2.2 Mint Flow

- [x] "Mint Plant" action triggers `plant-nft::mint`
- [x] On success: redirect to "My Plants" and show the new NFT

### 2.3 My Plants + Plant Detail

- [x] "My Plants" lists owned token IDs
- [x] Each plant card shows:
  - stage badge (Seed/Sprout/…)
  - progress bar (e.g., 2/7)
  - "Water" button state (enabled/disabled/graduated)

- [x] Plant detail page `/my-plants/[tokenId]` shows:
  - Dynamic SVG image
  - Stage, growth points, traits
  - Water button
  - On-chain data

---

## Milestone 3 — Metadata + Visuals ✅ COMPLETE

**Goal:** Plants feel unique and recognizable; metadata is valid.

### 3.1 Traits (5 traits)

- [x] Define final trait sets:
  - Pot (7 options: Terracotta, Ceramic, Golden, etc.)
  - Background (7 options: Sky Blue, Sunset, Aurora, etc.)
  - Flower (7 options: Daisy, Rose, Lotus, etc.)
  - Companion (6 options: None, Butterfly, Fairy, etc.)
  - Species/Archetype (5 options: Flowering, Rose Bush, Pine, Cactus, Bonsai)

- [x] Assign traits at mint (deterministic from token-id hash)
- [x] Rarity weighting: common 50%, uncommon 30%, rare 15%, legendary 5%

### 3.2 Metadata Endpoint

- [x] Add `/api/metadata/[tokenId]` returning standard NFT JSON
- [x] Includes: name, description, image URL, attributes array

### 3.3 Visual System (Generative SVG)

- [x] Created 5 plant archetypes with unique visuals
- [x] Each archetype has 5 stage variations (Seed → Tree)
- [x] Dynamic SVG generation at `/api/image/[tokenId]`
- [x] Traits affect: pot color, background gradient, flower emoji, companion

---

## Milestone 4 — Impact Pool ✅ COMPLETE

**Goal:** Trees enter a global pool; weekly redemptions are recorded transparently.

### 4.1 Impact Registry Contract

- [x] Add `impact-registry` contract with:
  - total trees graduated
  - total redeemed
  - weekly batch records (batch id, timestamp, quantity, proof hash)

- [x] `register-graduation(token-id, owner)` - called by game contract
- [x] `record-redemption(quantity, proof-hash, proof-url)` admin-only
- [x] Read-only endpoints: `get-pool-stats`, `get-batch`, `is-graduated`

**Contract deployed:**
- `ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ.impact-registry`

### 4.2 UI: Impact Dashboard

- [x] Show:
  - Trees in pool (graduated - redeemed)
  - Total graduated
  - Total redeemed
  - Redemption batches count
  - Progress bar

- [x] "How It Works" explainer section
- [ ] Add `IMPACT_POLICY.md` link in UI (optional)

### 4.3 Proof Format (MVP)

- [x] Batch records include:
  - quantity
  - proof-hash (SHA256)
  - proof-url (link to proof document)
  - timestamp (block height)
  - recorded-by (admin principal)

---

## Milestone 5 — Production Readiness 🟡 IN PROGRESS

**Goal:** Deploy and demo publicly.

### 5.1 Deployments

- [x] Testnet deploy all contracts
- [ ] Mainnet deploy (when ready)
- [x] Contract addresses configured in web app

### 5.2 Observability + Safety

- [x] Basic error handling in web
- [x] Ownership checks correct
- [x] Fail safely patterns
- [ ] Rate limit metadata API (optional)

**DoD:** A fresh user can use the app on testnet.

---

## Milestone 6 — "Product Final" Packaging 🟡 IN PROGRESS

**Goal:** Make it shippable for rewards, demos, and users.

- [x] README (root) with:
  - what DenGrow is
  - how to run locally
  - how to deploy contracts
  - links to PRD/Impact Policy

- [x] Demo script (1–2 min walkthrough) → `docs/DEMO_SCRIPT.md`
- [ ] Screenshots + short GIF (manual capture needed)
- [x] "Pitch" copy for Talent/Stacks rewards → `docs/PITCH.md`
- [x] License + contribution notes

**DoD:** Someone can evaluate and try it without asking you questions.

---

## Milestone 7 — Growth Hooks (Post-MVP) ❌ FUTURE

(Only after MVP is stable)

- [ ] Weekly streak badges
- [ ] Social share card for each Tree
- [ ] Leaderboard (most trees graduated)
- [ ] Limited events (seasonal traits)
- [ ] Sponsored batches (partners)
- [ ] Admin panel for redemption recording

---

# Summary

| Milestone | Status | Completion |
|-----------|--------|------------|
| M0 Repo Baseline | ✅ | 100% |
| M1 Core Gameplay | ✅ | 100% |
| M2 Web MVP | ✅ | 100% |
| M3 Metadata/Visuals | ✅ | 100% |
| M4 Impact Pool | ✅ | 100% |
| M5 Production | 🟡 | 80% |
| M6 Packaging | 🟡 | 90% |
| M7 Growth Hooks | ❌ | 0% |

**MVP Core Complete!** Ready for M5 completion (mainnet) and M6 (launch assets).

---

# Working Rules

- Every task must have: **DoD** + **owner** + **status**
- Keep `docs/TASKS.md` updated at the end of each session
- Main branch stays demoable
