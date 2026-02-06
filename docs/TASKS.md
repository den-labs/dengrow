# DenGrow — Task Backlog

**Last Updated:** 2026-02-05

---

## Milestone 0 — Monorepo Setup ✅ COMPLETE

- [x] Create pnpm-workspace.yaml
- [x] Move front-end → apps/web
- [x] Move clarity → packages/contracts
- [x] Remove package-lock.json
- [x] Update root scripts

**DoD:** pnpm workspace commands work.

---

## Milestone 1 — Core On-Chain Gameplay ✅ COMPLETE

- [x] Implement upgradeable architecture
  - [x] plant-storage.clar (data layer - immutable)
  - [x] plant-game-v1.clar (logic layer - versionable)
  - [x] plant-nft-v2.clar (NFT with storage integration)
- [x] Store plant state by token-id:
  - [x] stage (Seed → Sprout → Plant → Bloom → Tree)
  - [x] growth points / successful days
  - [x] last water block (cooldown)
- [x] Implement water(token-id) with:
  - [x] ownership check (only token owner can water)
  - [x] cooldown enforced (0 for testnet, 144 for mainnet)
  - [x] stage progression after 7 waters
- [x] Read-only endpoints: get-plant, can-water, get-stage
- [x] Emit events on stage changes and graduation
- [x] Testnet deployment complete
- [x] 103 tests passing

**Deployed Contracts (Testnet):**
- `ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ.plant-storage`
- `ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ.plant-game-v1`
- `ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ.plant-nft-v2`

---

## Milestone 2 — Web MVP ✅ COMPLETE

- [x] Wallet connect (Hiro Wallet)
- [x] Network selector (Testnet/Mainnet)
- [x] Mint UI with transaction feedback
- [x] My Plants page with plant cards
- [x] Plant detail page `/my-plants/[tokenId]`
- [x] Water button with cooldown state
- [x] Progress bar showing growth (0-7)
- [x] Stage badges (Seed/Sprout/Plant/Bloom/Tree)

**DoD:** User can mint and water plants from UI.

---

## Milestone 3 — Traits & Metadata ✅ COMPLETE

- [x] Define 5 trait categories:
  - Pot (7 options with rarity)
  - Background (7 options with rarity)
  - Flower (7 options with rarity)
  - Companion (6 options with rarity)
  - Species/Archetype (5 options with rarity)
- [x] Deterministic trait generation from token-id hash
- [x] Rarity weighting: common 50%, uncommon 30%, rare 15%, legendary 5%
- [x] Metadata API endpoint `/api/metadata/[tokenId]`
- [x] Dynamic SVG generation `/api/image/[tokenId]`
- [x] 5 unique plant archetypes with stage-specific visuals

**DoD:** Metadata validates on NFT viewers, same token always yields same traits.

---

## Milestone 4 — Impact Registry ✅ COMPLETE

- [x] impact-registry.clar contract with:
  - [x] total-graduated counter
  - [x] total-redeemed counter
  - [x] graduated-tokens map
  - [x] redemption-batches map with proof hash/URL
- [x] register-graduation called by plant-game-v1 on Tree stage
- [x] record-redemption admin function
- [x] Impact Dashboard UI at `/impact`
- [x] Pool stats display (graduated, redeemed, pool size)
- [x] Progress bar and "How It Works" section

**Deployed Contract (Testnet):**
- `ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ.impact-registry`

**Admin Scripts:**
- `pnpm deploy:impact-registry` - Deploy contract
- `pnpm register:graduated` - Register existing trees
- `pnpm redeem` - Record redemption batch

**DoD:** Weekly batch can be recorded and displayed on dashboard.

---

## Milestone 5 — Production Readiness 🟡 IN PROGRESS

- [x] Testnet deployment complete (all 4 contracts)
- [x] Contract addresses configured in web app
- [x] Basic error handling
- [x] Security checks (ownership, authorization)
- [ ] Mainnet deployment
- [ ] Rate limiting on metadata API (optional)

**DoD:** A fresh user can use the app on testnet.

---

## Milestone 6 — Product Packaging ❌ PENDING

- [ ] Root README with:
  - [ ] What DenGrow is
  - [ ] How to run locally
  - [ ] How to deploy contracts
  - [ ] Links to docs
- [ ] Demo script (1-2 min walkthrough)
- [ ] Screenshots + GIF
- [ ] Pitch copy for Stacks rewards
- [ ] License + contribution notes

**DoD:** Someone can evaluate and try it without asking questions.

---

## Milestone 7 — Growth Hooks ❌ FUTURE (Post-MVP)

- [ ] Leaderboard (most trees graduated)
- [ ] Weekly streak badges
- [ ] Social share card for each Tree
- [ ] Admin panel for redemption recording
- [ ] Limited events (seasonal traits)
- [ ] Sponsored batches (partners)

---

## Active Tasks

| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Mainnet deploy | - | Pending | Requires STX for fees |
| README update | - | Pending | M6 priority |
| Demo assets | - | Pending | Screenshots, GIF |

---

## Scripts Reference

```bash
# Development
pnpm dev                    # Start web app
pnpm --filter @dengrow/contracts test  # Run contract tests

# Testnet Operations
pnpm --filter @dengrow/contracts test:testnet        # Integration test
pnpm --filter @dengrow/contracts deploy:impact-registry  # Deploy impact contract
pnpm --filter @dengrow/contracts register:graduated   # Register existing trees
pnpm --filter @dengrow/contracts redeem -- --quantity N  # Record redemption
```
