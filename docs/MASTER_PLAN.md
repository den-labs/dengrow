## DenGrow — Master Task Plan (End-to-End)

### Milestone 0 — Repo Baseline (DONE)

- [x] Monorepo structure: `apps/web`, `packages/contracts`
- [x] Marketplace removed
- [x] Docs added: PRD, ROADMAP, TASKS
- [x] Fix dev build blockers (`pino-pretty`)
- [x] Rename `funny-dog` → `plant-nft`
- [x] Contract tests passing

**DoD:** `pnpm dev` runs, `pnpm test:contracts` passes, `git status` clean.

---

## Milestone 1 — Core On-Chain Gameplay (Contracts)

**Goal:** A plant can be minted and “watered” daily with verifiable on-chain state.

### 1.1 Plant Game Contract (NEW)

- [ ] Add `plant-game` contract
- [ ] Store plant state by token-id:
  - stage (Seed → Sprout → Plant → Bloom → Tree)
  - growth points / successful days
  - last water block (cooldown)

- [ ] Implement `water(token-id)` with:
  - ownership check (only token owner can water)
  - cooldown enforced (block-based “daily”)
  - stage progression after required days

- [ ] Read-only endpoints:
  - `get-plant(token-id)`
  - `can-water(token-id)` (optional but recommended)

- [ ] Emit event/log when stage changes (especially Tree graduation)

**DoD:** Mint → Water updates state; second water before cooldown fails; after 7 valid waters stage becomes Tree.

### 1.2 Deployment Wiring

- [ ] Add contract to `Clarinet.toml`
- [ ] Add to deployment plans (devnet/simnet)
- [ ] Ensure `pnpm test:contracts` includes plant-game tests

**DoD:** `pnpm test:contracts` passes in CI/local.

---

## Milestone 2 — Web MVP (Playable Loop)

**Goal:** A user can mint and water from the UI.

### 2.1 Wallet + Network UX

- [ ] Wallet connect stable (testnet)
- [ ] Network selector works (Testnet default)
- [ ] Clear UX states:
  - disconnected
  - connecting
  - wrong network
  - transaction pending/confirmed/failed

**DoD:** A user can connect and see their address reliably.

### 2.2 Mint Flow

- [ ] “Mint Plant” action triggers `plant-nft::mint`
- [ ] On success: redirect to “My Plants” and show the new NFT

**DoD:** Mint is one click, and the minted plant appears.

### 2.3 My Plants + Plant Detail

- [ ] “My Plants” lists owned token IDs
- [ ] Each plant card shows:
  - stage badge (Seed/Sprout/…)
  - progress (e.g., 2/7)
  - “Water” button state (enabled/disabled)

- [ ] Plant detail page shows:
  - stage, streak, next watering eligibility
  - tx history placeholder (optional)

**DoD:** User can water from UI and see updated state after confirmation.

---

## Milestone 3 — Metadata + Visuals (Traits & Stages)

**Goal:** Plants feel unique and recognizable; metadata is valid.

### 3.1 Traits (4 traits)

- [ ] Define final trait sets (Pot, Background, Flower, Companion)
- [ ] Assign traits at mint (deterministic from token-id or seed)
- [ ] Store traits (on-chain or off-chain mapping; MVP can be off-chain deterministic)

**DoD:** Same token always yields same traits.

### 3.2 Metadata Endpoint

- [ ] Add `/api/metadata/[tokenId]` returning standard NFT JSON:
  - name, description
  - image
  - attributes array (traits + stage)

- [ ] `plant-nft::token-uri` points to metadata base URL (env-driven)

**DoD:** Metadata renders correctly in common NFT viewers.

### 3.3 Visual System

Choose one approach for MVP:

- **A) Fixed illustration per stage** (fastest)
- **B) “Generative” layering** (stage base + trait overlays)

Tasks:

- [ ] Create stage images (Seed/Sprout/Plant/Bloom/Tree)
- [ ] If layering: create transparent overlays for each trait
- [ ] Display correct image in UI and metadata

**DoD:** The plant image changes with stage, traits show in attributes.

---

## Milestone 4 — Impact Pool (Honest Batching)

**Goal:** Trees enter a global pool; weekly redemptions are recorded transparently.

### 4.1 Impact Registry Contract

- [ ] Add `impact-registry` contract with:
  - total trees graduated
  - total redeemed
  - weekly batch records (batch id, timestamp, quantity, proof hash)

- [ ] `record-redemption(...)` admin-only (MVP)
- [ ] Read-only endpoints for UI dashboard

**DoD:** Can record a batch and retrieve it on-chain.

### 4.2 UI: Impact Dashboard

- [ ] Show:
  - Trees in pool (graduated - redeemed)
  - Total redeemed
  - Latest batch entries

- [ ] Add `IMPACT_POLICY.md` link in UI

**DoD:** Dashboard is understandable and consistent.

### 4.3 Proof Format (MVP)

- [ ] Define “Batch Proof” format:
  - CSV or JSON with batch details
  - Photos/receipts links
  - Hash stored on-chain

**DoD:** A batch can be verified by anyone.

---

## Milestone 5 — Production Readiness (Testnet → Mainnet)

**Goal:** Deploy and demo publicly.

### 5.1 Deployments

- [ ] Testnet deploy all contracts
- [ ] Mainnet deploy (when ready)
- [ ] Save contract addresses in `apps/web/src/constants/contracts.ts`

**DoD:** A fresh user can use the app on testnet (and later mainnet).

### 5.2 Observability + Safety

- [ ] Basic error reporting/logging in web
- [ ] Rate limit metadata API (light)
- [ ] Security sanity checks:
  - ownership checks correct
  - no re-entrancy analog patterns (Clarity)
  - fail safely

**DoD:** No obvious foot-guns; app doesn’t brick users.

---

## Milestone 6 — “Product Final” Packaging (Launch Assets)

**Goal:** Make it shippable for rewards, demos, and users.

- [ ] README (root) with:
  - what DenGrow is
  - how to run locally
  - how to deploy contracts
  - links to PRD/Impact Policy

- [ ] Demo script (1–2 min walkthrough)
- [ ] Screenshots + short GIF
- [ ] “Pitch” copy for Talent/Stacks rewards
- [ ] License + contribution notes

**DoD:** Someone can evaluate and try it without asking you questions.

---

## Optional Milestone 7 — Growth Hooks (Post-MVP)

(Only after MVP is stable)

- [ ] Weekly streak badges
- [ ] Social share card for each Tree
- [ ] Limited events (seasonal traits)
- [ ] Sponsored batches (partners)

---

# Working Rules (so it never “gets lost”)

- Every task must have: **DoD** + **owner** + **status** (todo/doing/done)
- Keep `docs/TASKS.md` updated at the end of each session
- Main branch stays demoable
