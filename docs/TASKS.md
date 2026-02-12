# DenGrow — Task Backlog

**Last Updated:** 2026-02-12

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
- [x] 103 tests passing (now 187 with M7 additions)

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

- [x] Testnet deployment complete (all 7 contracts)
- [x] Contract addresses configured in web app
- [x] Basic error handling
- [x] Security checks (ownership, authorization)
- [ ] Mainnet deployment
- [ ] Rate limiting on metadata API (optional)

**DoD:** A fresh user can use the app on testnet.

---

## Milestone 6 — Product Packaging ✅ COMPLETE

- [x] Root README with:
  - [x] What DenGrow is
  - [x] How to run locally
  - [x] How to deploy contracts
  - [x] Links to docs
- [x] Demo script (1-2 min walkthrough) → `docs/DEMO_SCRIPT.md`
- [x] Screenshots → `docs/assets/` (automated with Playwright)
- [x] Pitch copy for Stacks rewards → `docs/PITCH.md`
- [x] License + contribution notes

**DoD:** Someone can evaluate and try it without asking questions.

---

## Milestone 7 — Growth Hooks ✅ COMPLETE

- [x] Leaderboard page (most trees graduated, XP ranking, pagination)
- [x] Achievement badges contract (`achievement-badges.clar`) with on-chain badge minting
- [x] Achievement badges UI at `/achievements` with badge grid and progress
- [x] Admin panel for redemption recording (in Impact Dashboard)
- [x] Sponsored batches (`dengrow-treasury.clar`) with on-chain attribution
- [x] Sponsor page at `/impact/sponsor` with form and stats
- [x] Treasury contract for Impact Pool fund management
- [ ] Weekly streak badges (badge types defined, claiming not yet automated)
- [ ] Social share card for each Tree
- [ ] Limited events (seasonal traits)

**New Contracts Deployed (Testnet):**
- `ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ.achievement-badges`
- `ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ.dengrow-treasury`

**Tests**: 187 total (103 core + 84 new for badges, treasury, and sponsorship)

---

## Milestone 8 — Visual Redesign ✅ COMPLETE

- [x] Design system foundation: Outfit font, DenGrow color palette (50-900), custom shadows
- [x] Tailwind config: extended colors, glow/card shadows, gradient backgrounds
- [x] Navbar: plant logo, backdrop-blur, improved wallet button
- [x] PlantCard: gradient placeholders, hover effects, stage-colored badges
- [x] Shared UI states: EmptyState component (wallet, loading, error, empty variants)
- [x] Footer component
- [x] Home page: hero section, tier cards, daily care loop
- [x] My Plants page: improved mint section, garden grid
- [x] Plant Detail page: 2-column layout, growth journey, traits grid
- [x] Leaderboard page: stats cards, styled table, pagination
- [x] Achievements page: badge grid, progress bar, "How Badges Work" section
- [x] Impact Dashboard: stats cards, admin panel, sponsor CTA
- [x] Batch Detail page: hero visual, proof section, sponsor card
- [x] Sponsor page: stats overview, styled form, "How Sponsorship Works"
- [x] Plant SVG favicon replacing default Next.js favicon

**PR**: #17 merged to main

---

## Active Tasks

| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Define Impact Partner | - | **BLOCKING** | One Tree Planted recommended |
| Set Redemption Schedule | - | **BLOCKING** | Every Monday proposed |
| Fund Initial Redemptions | - | **BLOCKING** | Treasury allocation needed |
| Mainnet deploy | - | Pending | Requires above decisions + STX |

---

## Pre-Mainnet Decisions Required

See `docs/IMPACT_POLICY.md` for full details.

| Decision | Options | Recommended | Status |
|----------|---------|-------------|--------|
| What happens after graduation? | Mint again, Badge, Leaderboard | Mint again + Leaderboard | TBD |
| Who performs redemptions? | Team, DAO, Oracle, Partner | Team (MVP) | TBD |
| Where are trees planted? | One Tree Planted, Ecosia, Local | One Tree Planted | TBD |
| When are redemptions? | Weekly, Monthly, On-demand | Weekly (Mondays) | TBD |
| Minimum batch size? | 5, 10, 20 trees | 10 trees | TBD |
| User reward for graduating? | Nothing, Badge, Leaderboard spot | Leaderboard (M7) | TBD |

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
