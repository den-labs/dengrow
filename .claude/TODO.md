# DenGrow Session Plan

**Generated:** 2026-02-06 (via /plan skill)
**Latest Update:** 2026-02-09

---

## Session Plan - 2026-02-09

### Current State
- ✅ **All milestones M0-M4, M6 complete** (100%)
- ✅ **M5 at ~90%** — pricing tiers done, testnet validated, mainnet blocked on ops
- ✅ **120 contract tests passing** (5 test files, 3.66s)
- ✅ **Web build clean** (Next.js production build succeeds)
- ✅ **Working tree clean** — `main` branch, up to date with `origin/main`

### Recent Accomplishments (Since Last Plan)
- `92e7fdc` — 3-tier paid minting (Basic 1 STX / Premium 2 STX / Impact 3 STX)
- `c63a704` — Tier display on PlantCard + detail page with `useGetMintTier` hook
- `ce23e7a` — Post-graduation UI enhanced with pool stats and CTAs
- Impact policy finalized (6/6 decisions), redemption flow tested on testnet

### Blockers (Non-Code)
- **Partner Contact**: Call Jardin Botanico Quindio (3153349307) to finalize partnership
- **Treasury Bootstrap**: $30-50 USD for first tree redemptions
- **Mainnet Deployment**: Blocked on partner + funding

---

### GitHub Issues & Milestones (synced 2026-02-09)

#### M5: Production Readiness (5 closed, 3 open)

| Issue | Task | Effort | Status |
|-------|------|--------|--------|
| ~~#1~~ | ~~3-tier paid minting~~ | ~~L~~ | ✅ Closed |
| ~~#2~~ | ~~Post-graduation UI~~ | ~~M~~ | ✅ Closed |
| ~~#3~~ | ~~Tier pricing on landing page~~ | ~~S~~ | ✅ Closed |
| ~~#4~~ | ~~Tier in metadata API~~ | ~~S~~ | ✅ Closed |
| ~~#5~~ | ~~Contract error messages~~ | ~~S~~ | ✅ Closed |
| [#6](https://github.com/den-labs/dengrow/issues/6) | Water tip feature (+0.1 STX) | M | Open |
| [#7](https://github.com/den-labs/dengrow/issues/7) | Tier visual in SVG images | M | Open |
| [#8](https://github.com/den-labs/dengrow/issues/8) | Mainnet contract deployment | M | Blocked (partner+funding) |

#### M5.5: UX Polish (3 open)

| Issue | Task | Effort | Status |
|-------|------|--------|--------|
| [#10](https://github.com/den-labs/dengrow/issues/10) | Loading states & optimistic UI | S | Open |
| [#11](https://github.com/den-labs/dengrow/issues/11) | Tier explanation on Impact page | S | Open |
| [#12](https://github.com/den-labs/dengrow/issues/12) | Batch proof detail page | M | Open |

#### M7: Growth Hooks (3 open)

| Issue | Task | Effort | Status |
|-------|------|--------|--------|
| [#13](https://github.com/den-labs/dengrow/issues/13) | Leaderboard page | L | Open |
| [#14](https://github.com/den-labs/dengrow/issues/14) | Achievement badge NFTs | L | Open |
| [#15](https://github.com/den-labs/dengrow/issues/15) | Sponsored batch feature | L | Open |

#### Non-Code Blockers (no issue — manual ops)

| Task | Effort | Status |
|------|--------|--------|
| Contact Jardin Botanico (3153349307) | M | MANUAL |
| Bootstrap treasury wallet ($30-50) | S | Blocked by partner |

---

### Recommended Next Actions

**Code ready now:**
- **#6** Water tip (+0.1 STX) — revenue stream (M)
- **#7** Tier in SVG — visual distinction (M)
- **#10** Loading states — UX feedback (S)
- **#11** Tier explanation on Impact page (S)

**Blocked on ops:**
- **#8** Mainnet deployment — call Jardin Botanico first

### Key Files
- Tier config: `apps/web/src/lib/nft/operations.ts`
- Tier hook: `apps/web/src/hooks/useGetMintTier.ts`
- Mint page: `apps/web/src/app/my-plants/page.tsx`
- Plant detail: `apps/web/src/app/my-plants/[tokenId]/page.tsx`
- Landing page: `apps/web/src/app/page.tsx`
- Metadata API: `apps/web/src/app/api/metadata/[tokenId]/route.ts`
- Image API: `apps/web/src/app/api/image/[tokenId]/route.ts`
- Contract: `packages/contracts/contracts/plant-nft.clar`

---

**Last Updated:** 2026-02-09
**GitHub:** https://github.com/den-labs/dengrow/milestones
**Next Review:** After completing #6 or #7, or after partner call

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

