# DenGrow Session Plan

**Generated:** 2026-02-06 (via /plan skill)

---

## Current State

### ✅ Completed (Recent Work)
- M6: Product packaging complete (README, demo script, screenshots, pitch)
- M4: Impact Registry deployed with dashboard UI
- M3: Traits & metadata system with 5 unique plant archetypes
- M2: Web MVP with wallet connect, mint, and watering UI
- M1: Core on-chain gameplay with upgradeable architecture
- Testnet deployment: All 4 contracts deployed and integrated
- 120 passing contract tests (18 new tier tests)
- 3-tier paid minting: Basic (1 STX) / Premium (2 STX) / Impact (3 STX)
- Tier display on PlantCard + detail page via useGetMintTier hook
- Post-graduation UI with pool stats and CTAs
- Automated screenshot capture with Playwright
- Graduation status now visible on plant detail page

### 🚧 In Progress
- M5: Production readiness - testnet complete, mainnet pending

### ⚠️ Blockers (Pre-Mainnet)
- **Impact Partner Contact** - Jardin Botanico Quindio (call 3153349307)
- **Initial Treasury Funding** - $30-50 USD for first redemptions
- **Mainnet Deployment** - Blocked on partner + funding

### 🔧 Technical State
- Branch: `main` (3 commits ahead of origin/main)
- 120 contract tests passing, web build clean
- No build errors or test failures
- Ready to push

---

## Project Context

### Type
Blockchain Gaming (Web3 NFT + On-Chain State)

### Stack
- **Frontend**: Next.js 14 (App Router), React 18, Chakra UI 2, Tailwind CSS
- **Blockchain**: Stacks (Clarity 2.0 smart contracts)
- **Libraries**: @stacks/connect v8, @stacks/transactions v7
- **Testing**: Vitest (contracts), Playwright (E2E)
- **Package Manager**: pnpm 9 + Turbo
- **Deployment**: Testnet active, mainnet pending

### Architecture
- Monorepo: `apps/web` + `packages/contracts`
- Layered smart contracts: storage → logic → NFT → registry
- API routes: `/api/metadata/[tokenId]`, `/api/image/[tokenId]`
- Network-aware: testnet/mainnet with different cooldowns

---

## Next Steps (Prioritized)

### Priority 1: Critical (Unblock Development)

#### 1.1 Commit Recent Work - S
- **Why**: Clean working tree before next feature work
- **Acceptance**: Git status clean, changes pushed to origin
- **Files**: `pnpm-lock.yaml`, `docs/assets/plant-detail-graduated.png`
- **Command**: Use `/commit` skill or `./.denlabs/commit.sh dengrow`

#### 1.2 Resolve Impact Policy Decisions - L
- **Why**: Blocks mainnet deployment and launch planning
- **Acceptance**: All 6 decisions in IMPACT_POLICY.md marked as "DECIDED"
- **Dependencies**: Team alignment required (not a solo task)
- **Risk**: Cannot launch to mainnet without clarity on:
  - Post-graduation UX
  - Redemption process owner
  - Tree planting partner
  - Batch schedule and size
  - User verification method
  - User reward structure

---

### Priority 2: High (Mainnet Prep)

#### 2.1 Fund Initial Redemption Pool - M
- **Why**: Need capital for first 10-20 tree redemptions
- **Acceptance**: Treasury wallet has sufficient STX/USD equivalent
- **Estimated**: ~$20 USD for 20 trees via One Tree Planted
- **Dependencies**: 1.2 (partner selection)
- **Notes**: Consider grant funding or sponsor

#### 2.2 Mainnet Deployment - M
- **Why**: Final milestone before public launch
- **Acceptance**: All 4 contracts deployed to mainnet, addresses updated in web app
- **Dependencies**: 1.2 (policy decisions), 2.1 (funding)
- **Contracts**: plant-storage, plant-game-v1, plant-nft-v2, impact-registry
- **Risk**: Irreversible deployment, test thoroughly on testnet first

#### 2.3 Create Redemption Communication Plan - S
- **Why**: Users need to know when/how redemptions happen
- **Acceptance**: Written plan for announcing batches (social media, on-site)
- **Dependencies**: 1.2 (schedule decision)
- **Format**: Twitter template, email draft, dashboard message

---

### Priority 3: Medium (UX Enhancements)

#### 3.1 Add "What's Next" UI After Graduation - M
- **Why**: Users currently see no guidance after Tree stage
- **Acceptance**: Clear messaging on plant detail page when graduated
- **Content**:
  - "Your tree is in the Impact Pool!"
  - "Next redemption: [date]"
  - "Track progress on Impact Dashboard"
  - Option to mint again
- **Dependencies**: 1.2 (post-graduation UX decision)
- **Files**: `apps/web/src/app/my-plants/[tokenId]/page.tsx`

#### 3.2 Add Individual Token Tracking to Impact Dashboard - M
- **Why**: Users can't verify if *their* specific tree was redeemed
- **Acceptance**: User can search by token ID and see redemption status
- **Technical**: Extend `graduated-tokens` map to include batch-id
- **Contract**: May require new read-only function in impact-registry
- **Risk**: On-chain storage cost for map updates

#### 3.3 Improve Error Messaging for Failed Transactions - S
- **Why**: Current errors are generic (e.g., "Transaction failed")
- **Acceptance**: Specific errors like "Cooldown not met", "Not owner", "Insufficient balance"
- **Files**: `apps/web/src/hooks/useWaterPlant.ts`, error handling utilities
- **Pattern**: Parse contract error codes from @stacks/transactions

---

### Priority 4: Low (Future Features, M7+)

#### 4.1 Leaderboard UI - L
- **Why**: Social proof and competition drive engagement
- **Acceptance**: Public page showing top tree growers (by total graduated count)
- **Technical**: Query blockchain for all graduation events, aggregate by address
- **Dependencies**: 1.2 (user reward decision)
- **Status**: Deferred to M7

#### 4.2 Achievement Badge NFT System - L
- **Why**: Reward users for milestones (e.g., first tree, 10 trees, etc.)
- **Acceptance**: New SIP-009 contract for badges, minting logic integrated
- **Dependencies**: 1.2 (user reward decision)
- **Status**: Deferred to M7, optional

#### 4.3 Rate Limiting on Metadata API - M
- **Why**: Prevent abuse of `/api/metadata/[tokenId]` endpoint
- **Acceptance**: Max 100 requests/min per IP, graceful 429 errors
- **Technical**: Use Vercel edge config or Redis
- **Status**: Optional, implement if abuse detected

#### 4.4 Sponsored Batch Feature - L
- **Why**: Allow partners to fund specific redemption batches
- **Acceptance**: Partner branding on batch, dedicated proof page
- **Dependencies**: Partnership contracts, legal review
- **Status**: Deferred to post-launch

---

## Technical Decisions Made

### Monorepo Structure (M0)
- **Decision**: pnpm workspaces with Turbo
- **Rationale**: Simplifies contract + web development, shared configs
- **Trade-off**: Slightly more complex setup than separate repos

### Upgradeable Architecture (M1)
- **Decision**: Separate storage, logic, and NFT layers
- **Rationale**: Allows game logic updates without losing NFT state
- **Trade-off**: More contracts to deploy and manage

### Testnet Cooldown = 0 Blocks (M1)
- **Decision**: No cooldown on testnet for faster testing
- **Rationale**: Mainnet will use 144 blocks (~24 hours)
- **Risk**: Must ensure cooldown logic works correctly before mainnet

### Deterministic Traits (M3)
- **Decision**: Hash token-id to generate traits (not random)
- **Rationale**: Same token always has same traits, on-chain verifiable
- **Trade-off**: No true randomness, predictable for sequential mints

### Impact Pool Model (M4)
- **Decision**: Batch redemptions instead of 1:1 instant
- **Rationale**: Reduces transaction costs, allows batch verification
- **Trade-off**: Users wait for pool to reach minimum size

### Playwright for Screenshots (M6)
- **Decision**: Automated browser testing for visual documentation
- **Rationale**: Keeps screenshots up-to-date as UI evolves
- **Trade-off**: Maintenance overhead for test scripts

---

## Environment Notes

### Testnet (Current Default)
- Network: `testnet`
- Deployer: `ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ`
- Contracts deployed: All 4 (storage, game-v1, nft-v2, impact-registry)
- API: Hiro Platform (requires API key in `.env`)

### Mainnet (Pending)
- Network: `mainnet`
- Deployer: TBD (requires funded wallet)
- Contracts: Not yet deployed
- Cooldown: 144 blocks (~24 hours)

### Required Environment Variables
```bash
# apps/web/.env
NEXT_PUBLIC_STACKS_NETWORK=testnet  # or mainnet
NEXT_PUBLIC_PLATFORM_HIRO_API_KEY=your-key-here
```

---

## Testing Strategy

### Smart Contracts
- **Framework**: Vitest + Clarinet SDK
- **Coverage**: 103 tests passing, all core functions covered
- **Run**: `pnpm --filter @dengrow/contracts test`
- **Reports**: `pnpm --filter @dengrow/contracts test:reports` (coverage + gas costs)

### Web App
- **Linting**: `pnpm --filter @dengrow/web lint` (ESLint + Prettier)
- **Type-check**: `next build` (fails on TypeScript errors)
- **E2E**: Playwright at root level (`pnpm screenshots`)
- **Manual**: Load extension in browser, test wallet flows

### Pre-Commit Checklist
1. Run contract tests: `pnpm test:contracts`
2. Lint web app: `pnpm --filter @dengrow/web lint`
3. Build web app: `pnpm --filter @dengrow/web build`
4. Check git status: No unexpected changes
5. Use `/commit` skill for conventional commits

---

## Open Questions

### User Experience
- Should graduated users get a notification when their tree is redeemed?
- How to handle users who graduate multiple trees in one week?
- Should we show estimated wait time on plant detail page?

### Technical
- Do we need rate limiting on metadata API before mainnet?
- Should we implement pagination on Impact Dashboard (future scale)?
- How to handle contract upgrades if game logic needs changes post-mainnet?

### Business
- What happens if we run out of redemption funds?
- Should we accept donations at mint to fund trees?
- How to measure success (MAU? Trees graduated? Trees redeemed?)?

---

## Notes for Next Session

### If Working on Priority 1 (Critical)
- Start with 1.1 (commit current work) to clean slate
- For 1.2 (policy decisions), prepare summary doc for team review
- Don't proceed to mainnet without resolving blockers

### If Working on Priority 2 (Mainnet Prep)
- Verify all testnet contracts are working perfectly first
- Test wallet flows end-to-end before deploying to mainnet
- Have rollback plan if mainnet deployment fails

### If Working on Priority 3 (UX)
- Focus on 3.1 (post-graduation messaging) first - highest user impact
- Check IMPACT_POLICY.md decisions before implementing UX changes
- Get user feedback on messaging before finalizing

### Key Files to Know
- Contract tests: `packages/contracts/tests/*.test.ts`
- Web app entry: `apps/web/src/app/page.tsx`
- Plant detail: `apps/web/src/app/my-plants/[tokenId]/page.tsx`
- Impact dashboard: `apps/web/src/app/impact/page.tsx`
- API routes: `apps/web/src/app/api/{metadata,image}/[tokenId]/route.ts`

### Documentation References
- Architecture: `README.md` (root)
- Deployment guide: `docs/DEPLOYMENT.md`
- Impact policy: `docs/IMPACT_POLICY.md`
- Task backlog: `docs/TASKS.md`
- Demo script: `docs/DEMO_SCRIPT.md`

---

## Quick Commands Reference

```bash
# Development
pnpm dev                              # Start web app
pnpm --filter @dengrow/web build      # Production build
pnpm --filter @dengrow/contracts test # Contract tests

# Testnet Operations
pnpm --filter @dengrow/contracts deploy:impact-registry
pnpm --filter @dengrow/contracts register:graduated
pnpm --filter @dengrow/contracts redeem -- --quantity 10

# Screenshots
pnpm screenshots                      # Generate demo screenshots

# Git Workflow
git status                            # Check state
/commit                               # Use commit skill (recommended)
./.denlabs/commit.sh dengrow          # Alternative commit script
```

---

**Last Updated:** 2026-02-07
**Next Review:** After completing Priority 1 tasks or major milestone

---

## Session Plan - 2026-02-08 (Closed)

### Session Accomplishments
- ✅ **2.1 Pricing tiers**: Full contract + frontend + tests (`92e7fdc`, `c63a704`)
  - `mint-with-tier(recipient, tier)` with on-chain STX payment (1/2/3 STX)
  - Admin guard on free `mint`, `ERR_INVALID_TIER (u302)`
  - Tier stored in `extension-data`, queryable via `get-mint-tier`
  - 18 new contract tests (120 total, all passing)
  - Tier selection UI on `/my-plants` with 3 clickable cards
  - `useGetMintTier` hook for querying tier from contract
  - Tier badges on PlantCard + plant detail page (header, image, On-Chain Data)
- ✅ Post-graduation UI enhanced (`ce23e7a`)

### Project Maturity
- **M0-M4, M6**: ✅ Complete (100%)
- **M5**: 🟡 90% — pricing tiers done, mainnet blocked on partner/funding
- **M7**: Future (leaderboard, badges)

---

### Next Steps (Prioritized)

#### Priority 1: Critical (Non-Code — Unblock Mainnet)

| # | Task | Effort | Status |
|---|------|--------|--------|
| 1.1 | Contact Jardin Botanico (call 3153349307) | M | MANUAL |
| 1.2 | Bootstrap treasury wallet ($30-50) | S | Blocked by 1.1 |

#### Priority 2: High (Code — Mainnet Preparation)

| # | Task | Effort | Status |
|---|------|--------|--------|
| ~~2.1~~ | ~~Pricing tiers UI~~ | ~~L~~ | ✅ Done (`92e7fdc` + `c63a704`) |
| 2.2 | Add water tip feature (+0.1 STX optional) | M | Ready |
| ~~2.3~~ | ~~Post-graduation UI~~ | ~~M~~ | ✅ Done (`ce23e7a`) |
| 2.4 | Mainnet contract deployment | M | Blocked (1.1 + 1.2) |
| 2.5 | Add tier pricing to landing page (`app/page.tsx`) | S | Ready |
| 2.6 | Add tier to metadata API (`/api/metadata/[tokenId]`) | S | Ready |

#### Priority 3: Medium (UX Polish)

| # | Task | Effort | Dependencies |
|---|------|--------|-------------|
| 3.1 | Improve contract error messages | S | None |
| 3.2 | Add batch proof detail page `/impact/batch/[id]` | M | None |
| 3.3 | Loading states & optimistic UI for TX | S | None |
| 3.4 | Add tier visual to generated SVG images | M | None |
| 3.5 | Add tier explanation to Impact page | S | None |

#### Priority 4: Low (Post-Launch / M7)

| # | Task | Effort |
|---|------|--------|
| 4.1 | Leaderboard page | L |
| 4.2 | Achievement badge NFTs | L |
| 4.3 | Sponsored batch feature | L |

---

### Recommended Next Task

**Quick win**: **2.5 Landing page pricing** — show tier cards on home page
**Quick win**: **2.6 Metadata API** — include tier as NFT attribute for marketplaces
**Feature**: **2.2 Water tip** — optional +0.1 STX tip when watering
**If doing ops**: Call Jardin Botanico (1.1) to unblock mainnet path.

### Key Files
- Tier config: `apps/web/src/lib/nft/operations.ts` (MINT_TIERS, mintPlantNFTWithTier)
- Tier hook: `apps/web/src/hooks/useGetMintTier.ts`
- Mint page: `apps/web/src/app/my-plants/page.tsx` (tier selection UI)
- Plant detail: `apps/web/src/app/my-plants/[tokenId]/page.tsx`
- Contract: `packages/contracts/contracts/plant-nft.clar`
- Contract tests: `packages/contracts/tests/plant-nft.test.ts`
- Landing page: `apps/web/src/app/page.tsx`
- Metadata API: `apps/web/src/app/api/metadata/[tokenId]/route.ts`

---

**Last Updated:** 2026-02-08
**Next Review:** After completing 2.2 or 2.5, or after partner call

---

## Session Plan - 2026-02-07 18:00

### Current State
- ✅ **Completed**: All 6 Impact Policy decisions finalized (see IMPACT_POLICY.md v2.0)
- ✅ **Completed**: Testnet redemption guide documented (TESTNET_REDEMPTION_GUIDE.md)
- ✅ **Completed**: Economic model validated ($2 revenue/user covers $2 tree cost)
- ✅ **Completed**: Redemption flow tested end-to-end on testnet (batch #3 successful)
- 🚧 **In Progress**: New test scripts and proof documents uncommitted
- 🎯 **Focus**: Verify web UI, then move to mainnet prep

### Recent Work Summary (Last 5 commits)
```
cb0fcc1 - docs(test): add redemption flow test report for 2026-02-07
fc418fe - test(proofs): add batch-002 testnet proof document
9c2c2e0 - feat(scripts): add testnet redemption verification tools
0f1c55a - docs: finalize impact policy decisions and add testnet redemption guide
f9d0dcc - docs(planning): add complete economic model and implementation plan
```

### ⚠️ Blockers Status Update

**RESOLVED (2026-02-07):**
- ✅ Impact Partner Selection → Local finca in Quindío (Jardín Botánico)
- ✅ Redemption Schedule → Bi-weekly pilot, then monthly
- ✅ Initial Treasury Funding → $30-50 bootstrap for first 15-25 trees
- ✅ Policy Decisions → All 6 decisions documented in IMPACT_POLICY.md v2.0

**NEW BLOCKER:**
- 🔴 Partner Contact Required → Need to call Jardín Botánico (3153349307) to finalize partnership

---

## Next Steps (Prioritized) — UPDATED 2026-02-07 18:30

### Priority 1: Critical (Ready for Action)

#### 1.2b Verify Web UI Display - S (NEW)
- **Why**: Confirm Impact Dashboard displays batch #3 correctly
- **Acceptance**: UI shows updated stats and batch history
- **Actions**:
  - [ ] Start web app: `pnpm dev`
  - [ ] Visit http://localhost:3000/impact
  - [ ] Verify pool stats: Total Graduated (8), Redeemed (8), Pool (0), Batches (3)
  - [ ] Verify batch #3 appears in redemption history
  - [ ] Check proof URL link functionality
  - [ ] Test plant detail pages for graduated status
- **Dependencies**: 1.2 complete (done)
- **Effort**: 10-15 min
- **Note**: Last verification before considering redemption flow production-ready

### Priority 1: Critical (Ready for Action - Unchanged)

#### 1.1 Contact Jardín Botánico Quindío - M
- **Why**: Finalize tree planting partnership before mainnet launch
- **Acceptance**: Partnership agreement confirmed, $2/tree pricing locked
- **Actions**:
  - [ ] Call: 3153349307
  - [ ] Email: investigaciones@jardinbotanicoquindio.org
  - [ ] Negotiate: $2/tree + photo proof process
  - [ ] Set up: WhatsApp communication channel
- **Dependencies**: None (UNBLOCKED NOW)
- **Effort**: 30-60 min call + follow-up
- **Notes**: See IMPACT_POLICY.md section 3 for details

#### ~~1.2 Test Redemption Flow on Testnet~~ - ✅ COMPLETE
- **Status**: ✅ Passed all tests (2026-02-07)
- **Results**:
  - ✅ Graduated 5 test plants (tokens #4-8)
  - ✅ Created mock proof document (batch-003)
  - ✅ Executed redemption script successfully
  - ✅ Verified on-chain state updates (pool: 5→0, batches: 2→3)
  - ✅ Transaction confirmed on explorer
  - ⚠️ UI testing pending (manual verification needed)
  - ✅ Documented in `docs/test-reports/2026-02-07-redemption-flow.md`
- **Key Findings**:
  - Plants graduate after 7 waters (not 28)
  - Manual registration required via `pnpm register:graduated`
  - Testnet performance excellent (~5 sec per TX)
- **New Files Created**:
  - `packages/contracts/scripts/fast-graduate.ts`
  - `packages/contracts/test-proofs/batch-003.md`
  - `docs/test-reports/2026-02-07-redemption-flow.md`

#### 1.3 Bootstrap Treasury Wallet - S
- **Why**: Need funds ready for first real redemptions
- **Acceptance**: $30-50 USD allocated for tree planting
- **Actions**:
  - [ ] Decide funding method (personal/grant/sponsor)
  - [ ] Set up payment method for finca (bank transfer/crypto)
  - [ ] Allocate funds to treasury wallet
  - [ ] Document wallet address in deployment docs
- **Dependencies**: 1.1 (partner confirmation)
- **Effort**: <30 min

---

### Priority 2: High (Mainnet Preparation)

#### 2.1 Implement Pricing Tiers UI - L
- **Why**: Revenue model depends on 3-tier pricing ($1/$2/$3)
- **Acceptance**: Mint page shows 3 options, users can select tier
- **Design**:
  ```
  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
  │ Basic - 1 STX   │ │ Premium - 2 STX │ │ Impact - 3 STX  │
  │ Plant your tree │ │ + Priority      │ │ + 2x donation   │
  └─────────────────┘ └─────────────────┘ └─────────────────┘
  ```
- **Dependencies**: 1.2 (testnet validation complete)
- **Files**: `apps/web/src/app/page.tsx`, mint component
- **Technical**: Update `mint()` contract call to accept variable payment

#### 2.2 Add Water Tip Feature - M
- **Why**: Generates 10% of total revenue ($0.20/user avg)
- **Acceptance**: Optional "Water + Plant" button (+0.1 STX tip)
- **Design**:
  ```
  [ Water Plant ] or [ 💧 Water + Plant 🌱 (+0.1 STX) ]
  ```
- **Dependencies**: None (independent feature)
- **Files**: `apps/web/src/app/my-plants/[tokenId]/page.tsx`, `useWaterPlant` hook
- **Technical**: Add optional tip parameter to water function

#### 2.3 Mainnet Contract Deployment - M
- **Why**: Final technical milestone before public launch
- **Acceptance**: All 4 contracts deployed to mainnet, addresses updated
- **Actions**:
  - [ ] Fund mainnet deployer wallet (need ~5 STX for gas)
  - [ ] Deploy contracts in order: storage → game-v1 → nft-v2 → impact-registry
  - [ ] Verify on explorer
  - [ ] Update contract addresses in `apps/web/src/constants/contracts.ts`
  - [ ] Test mint + water on mainnet
- **Dependencies**: 1.2 (testnet flow validated), 2.1 (pricing implemented)
- **Risk**: Irreversible deployment, test thoroughly first
- **Files**: `packages/contracts/deployments/`, deployment scripts

#### 2.4 Create Post-Graduation UI - M
- **Why**: Users currently have no guidance after Tree stage
- **Acceptance**: Clear "What's Next" section on graduated plant page
- **Content**:
  ```
  🎉 Your plant graduated to Tree stage!

  Your tree is now in the Impact Pool and will be redeemed soon.

  [Track Impact Dashboard →]  [Mint Another Plant →]

  You've graduated X trees total
  ```
- **Dependencies**: 1.2 (testnet validation)
- **Files**: `apps/web/src/app/my-plants/[tokenId]/page.tsx`
- **Design**: See UI_MOCKUPS.md for reference

---

### Priority 3: Medium (UX Enhancements)

#### 3.1 Improve Contract Error Messages - S
- **Why**: Generic errors frustrate users ("Transaction failed")
- **Acceptance**: Specific errors like "Cooldown not met (8 hours remaining)"
- **Examples**:
  - ERR-NOT-OWNER → "You don't own this plant"
  - ERR-COOLDOWN → "Water again in X hours"
  - ERR-INSUFFICIENT-BALANCE → "Not enough STX (need X.XX)"
- **Files**: `apps/web/src/hooks/useWaterPlant.ts`, error utilities
- **Technical**: Parse error codes from @stacks/transactions

#### 3.2 Add Batch Proof Detail Page - M
- **Why**: Users can't currently view redemption proof from UI
- **Acceptance**: `/impact/batch/[id]` shows batch details + proof iframe
- **Content**:
  - Batch ID, date, quantity
  - Proof URL (embedded or link)
  - Transaction hash (link to explorer)
  - Photos from finca (if included in proof)
- **Files**: Create `apps/web/src/app/impact/batch/[id]/page.tsx`
- **Dependencies**: None (can implement anytime)

#### 3.3 Add Loading States and Optimistic UI - S
- **Why**: Stacks transactions take ~10 min to confirm
- **Acceptance**: Show "Watering..." spinner, disable button during tx
- **Patterns**:
  - Pending tx: "⏳ Watering... (confirming on-chain)"
  - Success: "✅ Plant watered!"
  - Failure: "❌ Transaction failed: [reason]"
- **Files**: All transaction hooks (useWaterPlant, useMintPlant, etc.)
- **Technical**: Use @stacks/connect transaction status tracking

---

### Priority 4: Low (Post-Launch Features)

#### 4.1 Leaderboard Page - L
- **Why**: Competitive feature drives engagement (M7 goal)
- **Acceptance**: `/leaderboard` shows top growers by total graduated trees
- **Technical**: Query blockchain for graduation events, aggregate by address
- **Status**: Deferred to M7 (post-mainnet)

#### 4.2 Achievement Badge NFT System - L
- **Why**: Reward milestones (first tree, 10 trees, 100 trees)
- **Acceptance**: New SIP-009 contract for badges, auto-mint on milestones
- **Status**: Deferred to M7 (optional)

#### 4.3 Sponsored Batch Feature - L
- **Why**: Allow partners to fund specific redemption batches
- **Acceptance**: Partner branding on batch, dedicated proof page
- **Status**: Deferred to post-launch, requires partnership contracts

---

## Implementation Sequence (Recommended)

**This Week (Feb 7-14):**
1. ⏳ Call Jardín Botánico (1.1) → TODAY/TOMORROW
2. ✅ Test redemption flow (1.2) → COMPLETE (2026-02-07)
3. 🆕 Verify web UI (1.2b) → Complete today
4. ⏳ Bootstrap treasury (1.3) → After partner confirmation

**Next Week (Feb 15-21):**
4. 🚧 Implement pricing tiers (2.1) → 2-3 days
5. 🚧 Add water tip feature (2.2) → 1 day
6. 🚧 Post-graduation UI (2.4) → 1 day

**Week of Feb 22:**
7. 🎯 Mainnet deployment (2.3) → CRITICAL MILESTONE
8. ✅ Test mainnet flows → Mint, water, graduate
9. 📣 Soft launch announcement

**Post-Launch:**
- Monitor user feedback
- Fix bugs quickly
- Iterate on UX (Priority 3 items)
- Plan M7 features (leaderboards, badges)

---

## Technical Debt & Maintenance

### Code Quality
- [ ] Add TypeScript strict mode to web app
- [ ] Increase test coverage for edge cases
- [ ] Add E2E tests for full user journey
- [ ] Audit contract gas costs on mainnet

### Documentation
- [x] IMPACT_POLICY.md finalized
- [x] TESTNET_REDEMPTION_GUIDE.md complete
- [ ] Operational runbook for redemptions
- [ ] User FAQ page
- [ ] Developer setup guide improvements

### Infrastructure
- [ ] Set up monitoring/alerts for contract events
- [ ] Rate limiting on metadata API (if needed)
- [ ] IPFS pinning service for proofs
- [ ] Backup/recovery procedures

---

## Success Metrics (Post-Launch)

### Month 1 Goals
- 50-100 plants minted
- 10-20 trees graduated
- 1-2 successful redemption batches
- Partner relationship stable
- No critical bugs

### Month 3 Goals
- 200+ plants minted
- 50+ trees graduated
- Monthly redemption cadence
- Revenue covers costs ($2+ per user)
- Consider M7 features (leaderboard)

---

**Last Updated:** 2026-02-07
**Next Review:** After completing Priority 1 tasks or major milestone

