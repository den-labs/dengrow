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
- 103 passing contract tests with full coverage
- Automated screenshot capture with Playwright
- Graduation status now visible on plant detail page

### 🚧 In Progress
- Playwright and tsx added to dependencies (pnpm-lock.yaml modified)
- New screenshot asset: `plant-detail-graduated.png` (untracked)
- M5: Production readiness - testnet complete, mainnet pending

### ⚠️ Blockers (Pre-Mainnet)
- **Impact Partner Selection** - One Tree Planted recommended but not confirmed
- **Redemption Schedule** - Every Monday proposed but not finalized
- **Initial Treasury Funding** - No allocation for first redemptions yet
- **Policy Decisions** - 6 key decisions in IMPACT_POLICY.md need team approval

### 🔧 Technical State
- Branch: `main` (46 commits ahead of origin/main)
- Unstaged changes: `pnpm-lock.yaml` (Playwright + tsx additions)
- Untracked: `docs/assets/plant-detail-graduated.png`
- No build errors or test failures
- Ready for commit + push

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

**Last Updated:** 2026-02-06
**Next Review:** After completing Priority 1 tasks or major milestone

