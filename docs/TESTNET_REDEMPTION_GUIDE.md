# Testnet Redemption Flow - Complete Guide

**Purpose:** Test the entire redemption process end-to-end on testnet before mainnet launch

**Last Updated:** 2026-02-07

---

## Overview

This guide walks through the COMPLETE redemption flow on testnet, including:
1. ✅ Graduating test plants
2. ✅ Checking the impact pool
3. ✅ Simulating partner proof collection
4. ✅ Executing redemption on-chain
5. ✅ Verifying UI updates
6. ✅ Testing proof display

**Estimated Time:** 30-45 minutes

---

## Prerequisites

### Environment Setup

```bash
# 1. Navigate to contracts package
cd packages/contracts

# 2. Verify testnet deployment
clarinet deployments list

# 3. Check available scripts
cat package.json | grep redeem
```

**Expected output:**
```json
"redeem": "node scripts/redeem.js",
"register:graduated": "node scripts/register-graduated.js"
```

### Testnet Wallet

- **Deployer Address:** `ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ`
- **Have:** Private key in `.env` or Clarinet config
- **Need:** STX for gas fees (~0.01 STX)

---

## Step 1: Prepare Test Data (Graduate Plants)

### Option A: Use Existing Graduated Plants

```bash
# Check current pool status
pnpm --filter @dengrow/contracts call get-pool-stats

# Expected output:
# {
#   total-graduated: u42,
#   total-redeemed: u0,
#   pool-size: u42
# }
```

If pool has plants (> 0), **skip to Step 2**.

---

### Option B: Graduate New Test Plants

If pool is empty, you need to mint and graduate test plants:

#### B1. Mint Test Plants (Web UI)

```bash
# Start web app
pnpm --filter @dengrow/web dev

# Open browser
open http://localhost:3000
```

**Actions:**
1. Connect wallet (Hiro or Leather)
2. Switch to Testnet
3. Mint 3-5 plants
4. Note token IDs (e.g., #45, #46, #47)

---

#### B2. Fast-Track to Tree Stage (Contract Call)

**Since testnet has 0 block cooldown, you can water 7 times instantly:**

```typescript
// Create test script: packages/contracts/scripts/fast-graduate.ts

import { Cl, cvToValue } from '@stacks/transactions';
import { callContract } from './utils';

async function fastGraduate(tokenId: number) {
  console.log(`Fast-graduating token ${tokenId}...`);

  // Water 7 times (instant on testnet)
  for (let i = 1; i <= 7; i++) {
    console.log(`  Water ${i}/7...`);
    await callContract({
      contract: 'plant-game-v1',
      function: 'water',
      args: [Cl.uint(tokenId)]
    });
  }

  console.log(`✅ Token ${tokenId} graduated!`);
}

// Graduate multiple plants
const tokenIds = [45, 46, 47]; // Replace with your token IDs
for (const id of tokenIds) {
  await fastGraduate(id);
}
```

**Run:**
```bash
tsx scripts/fast-graduate.ts
```

---

#### B3. Verify Graduation

```bash
# Check if plants graduated to Tree stage
pnpm --filter @dengrow/contracts call get-stage -- 45
# Expected: u4 (STAGE-TREE)

# Check pool size increased
pnpm --filter @dengrow/contracts call get-pool-stats
# Expected: pool-size increased by 3
```

---

## Step 2: Check Current Pool Status

### Via Contract Read-Only Call

```bash
cd packages/contracts

# Get pool stats
pnpm call get-pool-stats

# Expected output:
{
  total-graduated: u45,
  total-redeemed: u0,
  pool-size: u45
}
```

### Via Web UI

```bash
# Ensure web app is running
pnpm --filter @dengrow/web dev

# Visit impact dashboard
open http://localhost:3000/impact
```

**What to check:**
- "Total Graduated" shows correct number
- "Total Redeemed" shows 0 (before first redemption)
- "Current Pool" shows trees waiting
- No batches in history yet

**Screenshot this** for before/after comparison.

---

## Step 3: Simulate Partner Proof Collection

### Real-World Scenario Simulation

In production, this step would be:
1. Contact finca: "Please plant 10 trees"
2. Wait for planting (1-3 days)
3. Receive photos/videos via WhatsApp
4. Upload to IPFS/cloud storage

### Testnet Simulation

Create mock proof document:

```bash
# Create proof folder
mkdir -p packages/contracts/test-proofs

# Create mock certificate
cat > packages/contracts/test-proofs/batch-001.md << 'EOF'
# Redemption Batch #001

**Date:** 2026-02-07
**Location:** Finca El Recuerdo, Montenegro, Quindío, Colombia
**Trees Planted:** 10
**Species:** Yarumo, Guadua, Nogal Cafetero

## Photos

[Photo 1: Planting site]
[Photo 2: Seedlings]
[Photo 3: Farmer José with trees]

## GPS Coordinates
- Latitude: 4.5631° N
- Longitude: -75.7516° W

## Verification
- Planted by: José Ramírez
- Contact: +57 310 123 4567
- Verified by: DenGrow Team

---
Generated: 2026-02-07 10:30:00 COT
EOF
```

### Upload Proof (Choose One)

#### Option A: Public IPFS (Recommended)

```bash
# Install IPFS CLI if needed
# npm install -g ipfs

# Add to IPFS
ipfs add packages/contracts/test-proofs/batch-001.md

# Output example:
# QmXoYpzfZfF9qCxHjTGVwW4xJDpF3rMnLkSe2gT8vB...

# Get public URL
echo "https://ipfs.io/ipfs/QmXoYpzf..."
```

#### Option B: GitHub Gist (Quick & Easy)

1. Go to https://gist.github.com/
2. Paste content of `batch-001.md`
3. Create public gist
4. Copy raw URL: `https://gist.githubusercontent.com/.../batch-001.md`

#### Option C: Google Drive (Simple)

1. Upload to Drive, set sharing to "Anyone with link"
2. Get shareable link
3. Use: `https://drive.google.com/file/d/.../view`

**Save the proof URL** for next step.

---

## Step 4: Execute Redemption On-Chain

### Check Redemption Script

```bash
# View script
cat packages/contracts/scripts/redeem.js
# or
cat packages/contracts/scripts/redeem.ts
```

**Expected parameters:**
- `--quantity`: Number of trees to redeem
- `--proof-url`: URL to proof document
- `--proof-hash`: SHA256 of proof (optional, can be auto-generated)

---

### Run Redemption

```bash
cd packages/contracts

# Redeem 10 trees with proof URL
pnpm redeem -- \
  --quantity 10 \
  --proof-url "https://gist.githubusercontent.com/.../batch-001.md"

# Alternative with explicit hash
pnpm redeem -- \
  --quantity 10 \
  --proof-url "https://ipfs.io/ipfs/QmXoYpzf..." \
  --proof-hash "0x1a2b3c4d..."
```

**Expected Output:**
```
🌳 DenGrow Redemption
─────────────────────
Network: testnet
Contract: ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ.impact-registry

Redeeming 10 trees...
Proof URL: https://gist.githubusercontent.com/.../batch-001.md
Proof Hash: 0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p...

Tx Broadcasting...
✅ Transaction confirmed!

Tx ID: 0xabcd1234...
Block: 123456
Batch ID: u1

View on Explorer:
https://explorer.hiro.so/txid/0xabcd1234...?chain=testnet
```

**Screenshot the terminal output.**

---

### Verify Transaction on Explorer

1. Open the explorer link
2. Verify:
   - ✅ Status: Success
   - ✅ Contract: `impact-registry`
   - ✅ Function: `record-redemption`
   - ✅ Args: quantity (u10), proof-url, proof-hash
   - ✅ Block confirmed

---

## Step 5: Verify On-Chain State Updated

### Check Pool Stats Again

```bash
pnpm --filter @dengrow/contracts call get-pool-stats
```

**Expected changes:**
```diff
{
- total-graduated: u45,
+ total-graduated: u45, (unchanged)
- total-redeemed: u0,
+ total-redeemed: u10, (increased!)
- pool-size: u45
+ pool-size: u35 (decreased by 10)
}
```

---

### Check Batch Details

```bash
# Get batch info (batch-id: u1)
pnpm --filter @dengrow/contracts call get-batch-info -- 1

# Expected output:
{
  batch-id: u1,
  quantity: u10,
  proof-url: "https://gist.../batch-001.md",
  proof-hash: 0x1a2b3c4d...,
  timestamp: u1707292200,
  redeemed-by: ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ
}
```

---

## Step 6: Verify UI Updates

### Impact Dashboard

```bash
# Ensure web app running
pnpm --filter @dengrow/web dev

# Visit impact page
open http://localhost:3000/impact
```

**What should update:**

#### Before Redemption (Screenshot)
```
Total Graduated: 45
Total Redeemed: 0
Current Pool: 45
Batches: (empty)
```

#### After Redemption (Screenshot)
```
Total Graduated: 45
Total Redeemed: 10 ✅ (updated!)
Current Pool: 35 ✅ (updated!)

Redemption History:
┌─────────────────────────────────────┐
│ Batch #1 - Feb 7, 2026       🆕     │
│ ✅ 10 trees redeemed                │
│ [View Proof →]                      │
└─────────────────────────────────────┘
```

---

### Proof Detail Page

Click "View Proof" button:

**Expected:**
- Proof URL loads correctly
- Shows batch details:
  - Batch ID: #1
  - Quantity: 10 trees
  - Date: Feb 7, 2026
  - Transaction hash (links to explorer)
  - Proof document content

**If proof page doesn't exist yet:**
- Note this as TODO for implementation
- For now, clicking proof URL should open in new tab

---

### Plant Detail Page (Graduated Plant)

```bash
# Visit one of your graduated plants
open http://localhost:3000/my-plants/45
```

**Expected:**
- Stage shows: "Tree (Graduated)"
- Status shows: "Redeemed" or "In Pool" (depending on implementation)
- May show: "Your tree was redeemed in Batch #1" (if individual tracking implemented)

---

## Step 7: Test Second Redemption (Optional)

### Graduate More Plants

If you want to test multiple batches:

```bash
# Mint and graduate 5 more plants
# (Repeat Step 1)

# Check pool increased
pnpm call get-pool-stats
# pool-size should be: u40 (35 + 5 new)
```

### Execute Second Redemption

```bash
# Create batch-002 proof
# Upload to IPFS/Gist

# Redeem
pnpm redeem -- \
  --quantity 5 \
  --proof-url "https://gist.../batch-002.md"
```

### Verify

```bash
# Pool stats
pnpm call get-pool-stats
# Expected: pool-size = u35 (40 - 5)

# Batch info
pnpm call get-batch-info -- 2
# Should return batch #2 details

# UI should show 2 batches in history
```

---

## Step 8: Test Edge Cases

### Case 1: Redeem More Than Pool Size

```bash
# If pool has 35 trees, try to redeem 40
pnpm redeem -- --quantity 40 --proof-url "..."

# Expected: Transaction should FAIL
# Error: "Insufficient trees in pool" or similar
```

---

### Case 2: Redeem 0 Trees

```bash
pnpm redeem -- --quantity 0 --proof-url "..."

# Expected: Transaction should FAIL
# Error: "Quantity must be > 0"
```

---

### Case 3: Invalid Proof URL

```bash
pnpm redeem -- --quantity 5 --proof-url ""

# Expected: Should fail validation
# or record empty string (check contract logic)
```

---

### Case 4: Non-Admin Trying to Redeem

If your contract has admin checks:

```bash
# Try from different wallet (not deployer)
# Should FAIL with ERR-NOT-AUTHORIZED
```

---

## Step 9: Document Findings

### Create Test Report

```bash
cat > packages/contracts/test-reports/redemption-flow-test.md << 'EOF'
# Redemption Flow Test Report

**Date:** 2026-02-07
**Tester:** [Your Name]
**Network:** Testnet

## Results

### ✅ Passing Tests
- [x] Graduate plants to Tree stage
- [x] Pool stats update correctly
- [x] Redemption transaction succeeds
- [x] On-chain state updates (pool-size, total-redeemed)
- [x] Batch details recorded correctly
- [x] Impact dashboard shows updated stats
- [x] Batch history displays correctly

### ⚠️ Issues Found
- [ ] Issue 1: [Description]
- [ ] Issue 2: [Description]

### 🔧 TODOs for Mainnet
- [ ] Implement proof detail page
- [ ] Add individual token tracking
- [ ] Improve error messages
- [ ] Add loading states in UI
- [ ] Add confirmation modal before redemption

## Screenshots
- Before redemption: [link]
- After redemption: [link]
- Explorer tx: [link]

## Notes
[Any additional observations]
EOF
```

---

## Troubleshooting

### Problem: Script not found

```bash
# Check if script exists
ls packages/contracts/scripts/redeem.*

# If missing, check package.json
cat packages/contracts/package.json | grep redeem
```

**Solution:** Script may need to be created. Check deployed contracts repo or admin tools.

---

### Problem: "Insufficient STX balance"

```bash
# Get testnet STX from faucet
# Visit: https://explorer.hiro.so/sandbox/faucet?chain=testnet

# Request STX for deployer address
```

---

### Problem: Transaction fails

```bash
# Check error message in explorer
# Common issues:
# - Contract not found (wrong address)
# - Function not found (wrong contract version)
# - Authorization failed (not deployer)
# - Invalid arguments
```

**Solution:** Check contract deployment and function signatures.

---

### Problem: UI doesn't update

```bash
# Clear browser cache
# Hard reload: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

# Check browser console for errors
# Verify API calls to contract
```

---

### Problem: Can't find graduated plants

```bash
# Query all your plants
pnpm call get-plant -- 1
pnpm call get-plant -- 2
# ... continue until you find Trees (stage = u4)

# Or query your NFTs via API
curl https://api.testnet.hiro.so/extended/v1/tokens/nft/holdings?principal=ST23...
```

---

## Success Criteria

**Redemption flow is validated when:**

- ✅ Can execute redemption transaction successfully
- ✅ On-chain state updates correctly (pool decreases, total-redeemed increases)
- ✅ Batch details stored with proof URL and hash
- ✅ UI reflects changes (Impact Dashboard shows batch)
- ✅ Proof is accessible via URL
- ✅ Transaction visible on block explorer
- ✅ Edge cases handled gracefully (fail with clear errors)

---

## Next Steps After Validation

1. **Document the process** → Create operational runbook
2. **Train redemption owner** → Walk through manual process
3. **Test on mainnet** → Do ONE small redemption first (1-2 trees)
4. **Iterate** → Fix any issues found
5. **Scale** → Increase redemption frequency/volume

---

## Operational Runbook (For Production)

After testnet validation, use this checklist for real redemptions:

```
[ ] 1. Check pool size (contract call or dashboard)
[ ] 2. Contact finca partner (WhatsApp/phone)
[ ] 3. Confirm tree count and species
[ ] 4. Wait for planting (1-3 days)
[ ] 5. Receive proof (photos/videos)
[ ] 6. Upload proof to IPFS
[ ] 7. Generate proof hash
[ ] 8. Execute redemption script
[ ] 9. Verify transaction confirmed
[ ] 10. Announce on Twitter/Discord
[ ] 11. Update operational log
```

**Estimated time per redemption:** 30-60 minutes (excluding planting wait time)

---

## Questions to Answer During Testing

- [ ] How long does redemption tx take to confirm? (~10 min)
- [ ] What gas cost? (~0.001-0.01 STX)
- [ ] Does UI update immediately or need refresh?
- [ ] Are error messages clear enough?
- [ ] Is proof URL accessible from UI?
- [ ] Can we track which specific tokens were redeemed?
- [ ] Does the flow feel smooth end-to-end?

---

**Last Updated:** 2026-02-07
**Status:** Ready for testing
**Owner:** [Assign redemption owner]
