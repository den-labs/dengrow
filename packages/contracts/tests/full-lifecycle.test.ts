/**
 * =============================================================================
 * Full Lifecycle Test — Happy Path
 * =============================================================================
 * Covers the complete plant lifecycle in one sequential flow:
 *   1. Paid mint (mint-with-tier)
 *   2. Water x7 with stage verification
 *   3. Auto-graduation to impact registry
 *   4. Achievement badge claims
 *   5. NFT transfer + ownership update
 *   6. Non-owner rejection
 *
 * Uses simnet contracts (NOT testnet versioned ones).
 * Single describe block, sequential it blocks sharing state (singleFork mode).
 * =============================================================================
 */

import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("Full Lifecycle — Mint → Water → Graduate → Badges → Transfer", () => {
  let tokenId: number;

  beforeEach(() => {
    simnet.setEpoch("2.4");

    // Authorize plant-nft and plant-game-v1 in storage
    simnet.callPublicFn(
      "plant-storage",
      "authorize-contract",
      [Cl.principal(`${deployer}.plant-nft`)],
      deployer
    );
    simnet.callPublicFn(
      "plant-storage",
      "authorize-contract",
      [Cl.principal(`${deployer}.plant-game-v1`)],
      deployer
    );

    // Authorize plant-game-v1 as registrar in impact-registry
    simnet.callPublicFn(
      "impact-registry",
      "authorize-registrar",
      [Cl.principal(`${deployer}.plant-game-v1`)],
      deployer
    );
  });

  it("Step 1: Paid mint — wallet_1 mints with tier 1 (1 STX)", () => {
    const balanceBefore =
      simnet.getAssetsMap().get("STX")!.get(wallet1)!;
    const deployerBalanceBefore =
      simnet.getAssetsMap().get("STX")!.get(deployer)!;

    const { result } = simnet.callPublicFn(
      "plant-nft",
      "mint-with-tier",
      [Cl.principal(wallet1), Cl.uint(1)],
      wallet1
    );

    expect(result).toBeOk(Cl.uint(1));
    tokenId = 1;

    // Verify STX was deducted from wallet1
    const balanceAfter =
      simnet.getAssetsMap().get("STX")!.get(wallet1)!;
    expect(balanceBefore - balanceAfter).toBe(1_000_000n);

    // Verify STX was received by deployer
    const deployerBalanceAfter =
      simnet.getAssetsMap().get("STX")!.get(deployer)!;
    expect(deployerBalanceAfter - deployerBalanceBefore).toBe(1_000_000n);

    // Verify tier stored
    const { result: tierResult } = simnet.callReadOnlyFn(
      "plant-nft",
      "get-mint-tier",
      [Cl.uint(tokenId)],
      deployer
    );
    expect(tierResult).toBeSome(Cl.uint(1));

    // Verify plant initialized in storage
    const { result: plantResult } = simnet.callReadOnlyFn(
      "plant-storage",
      "get-plant",
      [Cl.uint(tokenId)],
      wallet1
    );
    expect(plantResult).toBeSome(
      Cl.tuple({
        stage: Cl.uint(0),
        "growth-points": Cl.uint(0),
        "last-water-block": Cl.uint(0),
        owner: Cl.principal(wallet1),
      })
    );
  });

  it("Step 2: Water x7 — full stage progression to Tree", () => {
    // Mint first
    simnet.callPublicFn(
      "plant-nft",
      "mint-with-tier",
      [Cl.principal(wallet1), Cl.uint(1)],
      wallet1
    );
    tokenId = 1;

    // Water 1: growth-points=1, stage=0 (Seed)
    const { result: w1 } = simnet.callPublicFn(
      "plant-game-v1",
      "water",
      [Cl.uint(tokenId)],
      wallet1
    );
    expect(w1).toBeOk(
      Cl.tuple({
        "new-stage": Cl.uint(0),
        "growth-points": Cl.uint(1),
        "stage-changed": Cl.bool(false),
      })
    );

    // Water 2: growth-points=2, stage=1 (Sprout)
    const { result: w2 } = simnet.callPublicFn(
      "plant-game-v1",
      "water",
      [Cl.uint(tokenId)],
      wallet1
    );
    expect(w2).toBeOk(
      Cl.tuple({
        "new-stage": Cl.uint(1),
        "growth-points": Cl.uint(2),
        "stage-changed": Cl.bool(true),
      })
    );

    // Water 3: growth-points=3, stage=1 (still Sprout)
    simnet.callPublicFn("plant-game-v1", "water", [Cl.uint(tokenId)], wallet1);

    // Water 4: growth-points=4, stage=2 (Plant)
    const { result: w4 } = simnet.callPublicFn(
      "plant-game-v1",
      "water",
      [Cl.uint(tokenId)],
      wallet1
    );
    expect(w4).toBeOk(
      Cl.tuple({
        "new-stage": Cl.uint(2),
        "growth-points": Cl.uint(4),
        "stage-changed": Cl.bool(true),
      })
    );

    // Water 5: growth-points=5, stage=2 (still Plant)
    simnet.callPublicFn("plant-game-v1", "water", [Cl.uint(tokenId)], wallet1);

    // Water 6: growth-points=6, stage=3 (Bloom)
    const { result: w6 } = simnet.callPublicFn(
      "plant-game-v1",
      "water",
      [Cl.uint(tokenId)],
      wallet1
    );
    expect(w6).toBeOk(
      Cl.tuple({
        "new-stage": Cl.uint(3),
        "growth-points": Cl.uint(6),
        "stage-changed": Cl.bool(true),
      })
    );

    // Water 7: growth-points=7, stage=4 (Tree) — auto-graduation triggered
    const { result: w7, events } = simnet.callPublicFn(
      "plant-game-v1",
      "water",
      [Cl.uint(tokenId)],
      wallet1
    );
    expect(w7).toBeOk(
      Cl.tuple({
        "new-stage": Cl.uint(4),
        "growth-points": Cl.uint(7),
        "stage-changed": Cl.bool(true),
      })
    );

    // Should have graduation event
    const printEvents = events.filter((e) => e.event === "print_event");
    expect(printEvents.length).toBeGreaterThanOrEqual(2);
  });

  it("Step 3: Verify graduation in impact registry", () => {
    // Mint + grow to tree
    simnet.callPublicFn(
      "plant-nft",
      "mint-with-tier",
      [Cl.principal(wallet1), Cl.uint(1)],
      wallet1
    );
    tokenId = 1;
    for (let i = 0; i < 7; i++) {
      simnet.callPublicFn(
        "plant-game-v1",
        "water",
        [Cl.uint(tokenId)],
        wallet1
      );
    }

    // Pool stats should show 1 graduated
    const { result: poolStats } = simnet.callReadOnlyFn(
      "impact-registry",
      "get-pool-stats",
      [],
      deployer
    );
    expect(poolStats).toBeTuple({
      "total-graduated": Cl.uint(1),
      "total-redeemed": Cl.uint(0),
      "current-pool-size": Cl.uint(1),
      "total-batches": Cl.uint(0),
    });

    // Token should be marked as graduated
    const { result: isGraduated } = simnet.callReadOnlyFn(
      "impact-registry",
      "is-graduated",
      [Cl.uint(tokenId)],
      deployer
    );
    expect(isGraduated).toBeBool(true);

    // Can't water a Tree
    const { result: waterTreeResult } = simnet.callPublicFn(
      "plant-game-v1",
      "water",
      [Cl.uint(tokenId)],
      wallet1
    );
    expect(waterTreeResult).toBeErr(Cl.uint(103)); // ERR-ALREADY-TREE
  });

  it("Step 4: Badge claims — first-seed, first-tree, early-adopter", () => {
    // Mint + grow to tree
    simnet.callPublicFn(
      "plant-nft",
      "mint-with-tier",
      [Cl.principal(wallet1), Cl.uint(1)],
      wallet1
    );
    tokenId = 1;
    for (let i = 0; i < 7; i++) {
      simnet.callPublicFn(
        "plant-game-v1",
        "water",
        [Cl.uint(tokenId)],
        wallet1
      );
    }

    // Claim First Seed badge (badge-id 1)
    const { result: seedBadge } = simnet.callPublicFn(
      "achievement-badges",
      "claim-first-seed",
      [Cl.uint(tokenId)],
      wallet1
    );
    expect(seedBadge).toBeOk(
      Cl.tuple({
        "badge-id": Cl.uint(1),
        "earned-at": Cl.uint(simnet.blockHeight),
      })
    );

    // Claim First Tree badge (badge-id 2)
    const { result: treeBadge } = simnet.callPublicFn(
      "achievement-badges",
      "claim-first-tree",
      [Cl.uint(tokenId)],
      wallet1
    );
    expect(treeBadge).toBeOk(
      Cl.tuple({
        "badge-id": Cl.uint(2),
        "earned-at": Cl.uint(simnet.blockHeight),
      })
    );

    // Claim Early Adopter badge (badge-id 4, token-id <= 100)
    const { result: earlyBadge } = simnet.callPublicFn(
      "achievement-badges",
      "claim-early-adopter",
      [Cl.uint(tokenId)],
      wallet1
    );
    expect(earlyBadge).toBeOk(
      Cl.tuple({
        "badge-id": Cl.uint(4),
        "earned-at": Cl.uint(simnet.blockHeight),
      })
    );

    // Verify badge count
    const { result: badgeCount } = simnet.callReadOnlyFn(
      "achievement-badges",
      "get-badge-count",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(badgeCount).toBeUint(3);

    // Verify global badge count
    const { result: totalBadges } = simnet.callReadOnlyFn(
      "achievement-badges",
      "get-total-badges-claimed",
      [],
      deployer
    );
    expect(totalBadges).toBeUint(3);

    // Duplicate claims should fail
    const { result: dupSeed } = simnet.callPublicFn(
      "achievement-badges",
      "claim-first-seed",
      [Cl.uint(tokenId)],
      wallet1
    );
    expect(dupSeed).toBeErr(Cl.uint(200)); // ERR-ALREADY-CLAIMED
  });

  it("Step 5: Transfer NFT — wallet_1 → wallet_2", () => {
    // Mint plant for wallet1
    simnet.callPublicFn(
      "plant-nft",
      "mint-with-tier",
      [Cl.principal(wallet1), Cl.uint(1)],
      wallet1
    );
    tokenId = 1;

    // Water once so plant has some state
    simnet.callPublicFn(
      "plant-game-v1",
      "water",
      [Cl.uint(tokenId)],
      wallet1
    );

    // Transfer NFT
    const { result: transferResult } = simnet.callPublicFn(
      "plant-nft",
      "transfer",
      [Cl.uint(tokenId), Cl.principal(wallet1), Cl.principal(wallet2)],
      wallet1
    );
    expect(transferResult).toBeOk(Cl.bool(true));

    // Verify NFT owner changed
    const { result: nftOwner } = simnet.callReadOnlyFn(
      "plant-nft",
      "get-owner",
      [Cl.uint(tokenId)],
      deployer
    );
    expect(nftOwner).toBeOk(Cl.some(Cl.principal(wallet2)));

    // Verify plant owner updated in storage
    const { result: storageOwner } = simnet.callReadOnlyFn(
      "plant-storage",
      "get-plant-owner",
      [Cl.uint(tokenId)],
      deployer
    );
    expect(storageOwner).toBeSome(Cl.principal(wallet2));

    // Wallet2 should be able to water
    const { result: newOwnerWater } = simnet.callPublicFn(
      "plant-game-v1",
      "water",
      [Cl.uint(tokenId)],
      wallet2
    );
    expect(newOwnerWater).toBeOk(
      Cl.tuple({
        "new-stage": Cl.uint(1), // Sprout (2 points now)
        "growth-points": Cl.uint(2),
        "stage-changed": Cl.bool(true),
      })
    );
  });

  it("Step 6: Non-owner rejection — wallet_1 can't water after transfer", () => {
    // Mint and transfer to wallet2
    simnet.callPublicFn(
      "plant-nft",
      "mint-with-tier",
      [Cl.principal(wallet1), Cl.uint(1)],
      wallet1
    );
    tokenId = 1;

    simnet.callPublicFn(
      "plant-nft",
      "transfer",
      [Cl.uint(tokenId), Cl.principal(wallet1), Cl.principal(wallet2)],
      wallet1
    );

    // wallet_1 tries to water — should fail
    const { result } = simnet.callPublicFn(
      "plant-game-v1",
      "water",
      [Cl.uint(tokenId)],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(100)); // ERR-NOT-OWNER

    // wallet_1 tries to transfer back — should fail
    // tx-sender == sender passes the asserts!, but nft-transfer? fails
    // with native err u2 (sender is not the actual NFT owner)
    const { result: transferResult } = simnet.callPublicFn(
      "plant-nft",
      "transfer",
      [Cl.uint(tokenId), Cl.principal(wallet1), Cl.principal(wallet1)],
      wallet1
    );
    expect(transferResult).toBeErr(Cl.uint(2));
  });
});
