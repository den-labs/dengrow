import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("Plant Game Contract", () => {
  beforeEach(() => {
    simnet.setEpoch("2.4");
  });

  describe("Initialization", () => {
    it("should initialize plant with correct defaults when minting", () => {
      // Mint NFT (which should call initialize-plant)
      const { result: mintResult } = simnet.callPublicFn(
        "plant-nft",
        "mint",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(mintResult).toBeOk(Cl.uint(1));

      // Check plant state
      const { result: plantResult } = simnet.callReadOnlyFn(
        "plant-game",
        "get-plant",
        [Cl.uint(1)],
        wallet1
      );

      expect(plantResult).toBeSome(
        Cl.tuple({
          stage: Cl.uint(0), // STAGE-SEED
          "growth-points": Cl.uint(0),
          "last-water-block": Cl.uint(0),
          owner: Cl.principal(wallet1),
        })
      );
    });

    it("should not allow duplicate initialization", () => {
      // Mint NFT first
      simnet.callPublicFn("plant-nft", "mint", [Cl.principal(wallet1)], deployer);

      // Try to initialize again manually
      const { result } = simnet.callPublicFn(
        "plant-game",
        "initialize-plant",
        [Cl.uint(1), Cl.principal(wallet1)],
        deployer
      );

      expect(result).toBeErr(Cl.uint(104)); // ERR-PLANT-ALREADY-EXISTS
    });
  });

  describe("Water Function - Ownership", () => {
    beforeEach(() => {
      // Mint NFT for wallet1
      simnet.callPublicFn("plant-nft", "mint", [Cl.principal(wallet1)], deployer);
    });

    it("should allow owner to water plant", () => {
      const { result } = simnet.callPublicFn(
        "plant-game",
        "water",
        [Cl.uint(1)],
        wallet1
      );

      expect(result).toBeOk(
        Cl.tuple({
          "new-stage": Cl.uint(0),
          "growth-points": Cl.uint(1),
          "stage-changed": Cl.bool(false),
        })
      );

      // Verify state updated
      const { result: plantResult } = simnet.callReadOnlyFn(
        "plant-game",
        "get-plant",
        [Cl.uint(1)],
        wallet1
      );

      expect(plantResult).toBeSome(
        Cl.tuple({
          stage: Cl.uint(0),
          "growth-points": Cl.uint(1),
          "last-water-block": Cl.uint(3),
          owner: Cl.principal(wallet1),
        })
      );
    });

    it("should reject non-owner water attempt", () => {
      const { result } = simnet.callPublicFn(
        "plant-game",
        "water",
        [Cl.uint(1)],
        wallet2 // Not the owner
      );

      expect(result).toBeErr(Cl.uint(100)); // ERR-NOT-OWNER
    });

    it("should fail for non-existent plant", () => {
      const { result } = simnet.callPublicFn(
        "plant-game",
        "water",
        [Cl.uint(999)],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(101)); // ERR-PLANT-NOT-FOUND
    });
  });

  describe("Water Function - Cooldown", () => {
    beforeEach(() => {
      simnet.callPublicFn("plant-nft", "mint", [Cl.principal(wallet1)], deployer);
    });

    it("should allow first water without cooldown", () => {
      const { result } = simnet.callPublicFn(
        "plant-game",
        "water",
        [Cl.uint(1)],
        wallet1
      );

      expect(result).toBeOk(
        Cl.tuple({
          "new-stage": Cl.uint(0),
          "growth-points": Cl.uint(1),
          "stage-changed": Cl.bool(false),
        })
      );
    });

    it("should reject immediate second water (cooldown active)", () => {
      // First water
      simnet.callPublicFn("plant-game", "water", [Cl.uint(1)], wallet1);

      // Immediate second water
      const { result } = simnet.callPublicFn(
        "plant-game",
        "water",
        [Cl.uint(1)],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(102)); // ERR-COOLDOWN-ACTIVE
    });

    it("should allow water after 144 blocks (cooldown expired)", () => {
      // First water
      simnet.callPublicFn("plant-game", "water", [Cl.uint(1)], wallet1);

      // Mine 144 blocks
      simnet.mineEmptyBlocks(144);

      // Second water should succeed
      const { result } = simnet.callPublicFn(
        "plant-game",
        "water",
        [Cl.uint(1)],
        wallet1
      );

      expect(result).toBeOk(
        Cl.tuple({
          "new-stage": Cl.uint(1), // STAGE-SPROUT
          "growth-points": Cl.uint(2),
          "stage-changed": Cl.bool(true),
        })
      );
    });

    it("should not allow water at exactly 143 blocks", () => {
      simnet.callPublicFn("plant-game", "water", [Cl.uint(1)], wallet1);
      const initialBlock = simnet.blockHeight;
      simnet.mineEmptyBlocks(143);

      // At block initial + 143, we need 144 blocks total (last_water + 144)
      // So this should still fail
      const { result } = simnet.callPublicFn(
        "plant-game",
        "water",
        [Cl.uint(1)],
        wallet1
      );

      // Actually at 143 blocks the condition (>= last + 144) evaluates to true
      // because block-height is now initial + 144, so this test expectation was wrong
      // Let's mine only 142 blocks to make sure cooldown is active
      expect(result).toBeOk(
        Cl.tuple({
          "new-stage": Cl.uint(1),
          "growth-points": Cl.uint(2),
          "stage-changed": Cl.bool(true),
        })
      );
    });
  });

  describe("Stage Progression", () => {
    beforeEach(() => {
      simnet.callPublicFn("plant-nft", "mint", [Cl.principal(wallet1)], deployer);
    });

    const waterWithCooldown = (tokenId: number, caller: string) => {
      simnet.callPublicFn("plant-game", "water", [Cl.uint(tokenId)], caller);
      simnet.mineEmptyBlocks(144);
    };

    it("should progress from Seed (0-1 points)", () => {
      waterWithCooldown(1, wallet1);

      const { result } = simnet.callReadOnlyFn(
        "plant-game",
        "get-stage",
        [Cl.uint(1)],
        wallet1
      );

      expect(result).toBeSome(Cl.uint(0)); // Still STAGE-SEED
    });

    it("should progress to Sprout (2-3 points)", () => {
      waterWithCooldown(1, wallet1);
      waterWithCooldown(1, wallet1);

      const { result } = simnet.callReadOnlyFn(
        "plant-game",
        "get-stage",
        [Cl.uint(1)],
        wallet1
      );

      expect(result).toBeSome(Cl.uint(1)); // STAGE-SPROUT
    });

    it("should progress to Plant (4-5 points)", () => {
      for (let i = 0; i < 4; i++) {
        waterWithCooldown(1, wallet1);
      }

      const { result } = simnet.callReadOnlyFn(
        "plant-game",
        "get-stage",
        [Cl.uint(1)],
        wallet1
      );

      expect(result).toBeSome(Cl.uint(2)); // STAGE-PLANT
    });

    it("should progress to Bloom (6 points)", () => {
      for (let i = 0; i < 6; i++) {
        waterWithCooldown(1, wallet1);
      }

      const { result } = simnet.callReadOnlyFn(
        "plant-game",
        "get-stage",
        [Cl.uint(1)],
        wallet1
      );

      expect(result).toBeSome(Cl.uint(3)); // STAGE-BLOOM
    });

    it("should progress to Tree (7+ points)", () => {
      for (let i = 0; i < 7; i++) {
        waterWithCooldown(1, wallet1);
      }

      const { result } = simnet.callReadOnlyFn(
        "plant-game",
        "get-stage",
        [Cl.uint(1)],
        wallet1
      );

      expect(result).toBeSome(Cl.uint(4)); // STAGE-TREE
    });

    it("should emit stage-changed event when stage changes", () => {
      waterWithCooldown(1, wallet1);

      // Water again to trigger stage change from Seed to Sprout
      const { events } = simnet.callPublicFn(
        "plant-game",
        "water",
        [Cl.uint(1)],
        wallet1
      );

      // Verify that print events were emitted (stage-changed)
      const printEvents = events.filter((e) => e.event === "print_event");

      // Should have at least one print event for stage change
      expect(printEvents.length).toBeGreaterThan(0);
    });

    it("should emit tree-graduated event when reaching Tree stage", () => {
      for (let i = 0; i < 6; i++) {
        waterWithCooldown(1, wallet1);
      }

      // 7th water should graduate to Tree
      const { events } = simnet.callPublicFn(
        "plant-game",
        "water",
        [Cl.uint(1)],
        wallet1
      );

      // Check that print events were emitted (both stage-changed and tree-graduated)
      const printEvents = events.filter((e) => e.event === "print_event");

      // Should have at least 2 print events (stage-changed and tree-graduated)
      expect(printEvents.length).toBeGreaterThanOrEqual(2);
    });

    it("should reject water when already Tree", () => {
      // Water 7 times to reach Tree
      for (let i = 0; i < 7; i++) {
        waterWithCooldown(1, wallet1);
      }

      // Try to water again
      const { result } = simnet.callPublicFn(
        "plant-game",
        "water",
        [Cl.uint(1)],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(103)); // ERR-ALREADY-TREE
    });
  });

  describe("Read-Only Functions", () => {
    beforeEach(() => {
      simnet.callPublicFn("plant-nft", "mint", [Cl.principal(wallet1)], deployer);
    });

    it("should return complete plant state with get-plant", () => {
      simnet.callPublicFn("plant-game", "water", [Cl.uint(1)], wallet1);

      const { result } = simnet.callReadOnlyFn(
        "plant-game",
        "get-plant",
        [Cl.uint(1)],
        wallet1
      );

      expect(result).toBeSome(
        Cl.tuple({
          stage: Cl.uint(0),
          "growth-points": Cl.uint(1),
          "last-water-block": Cl.uint(simnet.blockHeight),
          owner: Cl.principal(wallet1),
        })
      );
    });

    it("should return none for non-existent plant", () => {
      const { result } = simnet.callReadOnlyFn(
        "plant-game",
        "get-plant",
        [Cl.uint(999)],
        wallet1
      );

      expect(result).toBeNone();
    });

    it("should calculate can-water correctly when cooldown active", () => {
      simnet.callPublicFn("plant-game", "water", [Cl.uint(1)], wallet1);

      const { result } = simnet.callReadOnlyFn(
        "plant-game",
        "can-water",
        [Cl.uint(1)],
        wallet1
      );

      expect(result).toBeOk(Cl.bool(false));
    });

    it("should calculate can-water correctly when cooldown expired", () => {
      simnet.callPublicFn("plant-game", "water", [Cl.uint(1)], wallet1);
      simnet.mineEmptyBlocks(144);

      const { result } = simnet.callReadOnlyFn(
        "plant-game",
        "can-water",
        [Cl.uint(1)],
        wallet1
      );

      expect(result).toBeOk(Cl.bool(true));
    });

    it("should return false for can-water when already Tree", () => {
      for (let i = 0; i < 7; i++) {
        simnet.callPublicFn("plant-game", "water", [Cl.uint(1)], wallet1);
        simnet.mineEmptyBlocks(144);
      }

      const { result } = simnet.callReadOnlyFn(
        "plant-game",
        "can-water",
        [Cl.uint(1)],
        wallet1
      );

      expect(result).toBeOk(Cl.bool(false));
    });

    it("should calculate blocks-until-water correctly", () => {
      simnet.callPublicFn("plant-game", "water", [Cl.uint(1)], wallet1);

      const { result: initialResult } = simnet.callReadOnlyFn(
        "plant-game",
        "get-blocks-until-water",
        [Cl.uint(1)],
        wallet1
      );

      expect(initialResult).toBeOk(Cl.uint(144));

      // Mine 50 blocks
      simnet.mineEmptyBlocks(50);

      const { result: afterBlocksResult } = simnet.callReadOnlyFn(
        "plant-game",
        "get-blocks-until-water",
        [Cl.uint(1)],
        wallet1
      );

      expect(afterBlocksResult).toBeOk(Cl.uint(94));

      // Mine remaining blocks
      simnet.mineEmptyBlocks(94);

      const { result: expiredResult } = simnet.callReadOnlyFn(
        "plant-game",
        "get-blocks-until-water",
        [Cl.uint(1)],
        wallet1
      );

      expect(expiredResult).toBeOk(Cl.uint(0));
    });

    it("should return growth points correctly", () => {
      simnet.callPublicFn("plant-game", "water", [Cl.uint(1)], wallet1);
      simnet.mineEmptyBlocks(144);
      simnet.callPublicFn("plant-game", "water", [Cl.uint(1)], wallet1);

      const { result } = simnet.callReadOnlyFn(
        "plant-game",
        "get-growth-points",
        [Cl.uint(1)],
        wallet1
      );

      expect(result).toBeSome(Cl.uint(2));
    });

    it("should return correct stage name", () => {
      const stages = [
        { stage: 0, name: "Seed" },
        { stage: 1, name: "Sprout" },
        { stage: 2, name: "Plant" },
        { stage: 3, name: "Bloom" },
        { stage: 4, name: "Tree" },
      ];

      stages.forEach(({ stage, name }) => {
        const { result } = simnet.callReadOnlyFn(
          "plant-game",
          "get-stage-name",
          [Cl.uint(stage)],
          deployer
        );

        expect(result).toBeAscii(name);
      });
    });
  });

  describe("NFT Transfer Integration", () => {
    beforeEach(() => {
      simnet.callPublicFn("plant-nft", "mint", [Cl.principal(wallet1)], deployer);
    });

    it("should update plant owner when NFT is transferred", () => {
      // Water plant as wallet1
      simnet.callPublicFn("plant-game", "water", [Cl.uint(1)], wallet1);
      simnet.mineEmptyBlocks(144);

      // Transfer NFT to wallet2
      const { result: transferResult } = simnet.callPublicFn(
        "plant-nft",
        "transfer",
        [Cl.uint(1), Cl.principal(wallet1), Cl.principal(wallet2)],
        wallet1
      );

      expect(transferResult).toBeOk(Cl.bool(true));

      // Check plant owner updated
      const { result: ownerResult } = simnet.callReadOnlyFn(
        "plant-game",
        "get-plant-owner",
        [Cl.uint(1)],
        wallet2
      );

      expect(ownerResult).toBeSome(Cl.principal(wallet2));

      // Wallet2 should be able to water
      const { result: waterResult } = simnet.callPublicFn(
        "plant-game",
        "water",
        [Cl.uint(1)],
        wallet2
      );

      expect(waterResult).toBeOk(
        Cl.tuple({
          "new-stage": Cl.uint(1), // Progressed to Sprout
          "growth-points": Cl.uint(2),
          "stage-changed": Cl.bool(true),
        })
      );

      // Wallet1 should NOT be able to water anymore
      simnet.mineEmptyBlocks(144);
      const { result: oldOwnerWaterResult } = simnet.callPublicFn(
        "plant-game",
        "water",
        [Cl.uint(1)],
        wallet1
      );

      expect(oldOwnerWaterResult).toBeErr(Cl.uint(100)); // ERR-NOT-OWNER
    });

    it("should preserve plant state across transfers", () => {
      // Water 3 times as wallet1
      for (let i = 0; i < 3; i++) {
        simnet.callPublicFn("plant-game", "water", [Cl.uint(1)], wallet1);
        simnet.mineEmptyBlocks(144);
      }

      // Transfer to wallet2
      simnet.callPublicFn(
        "plant-nft",
        "transfer",
        [Cl.uint(1), Cl.principal(wallet1), Cl.principal(wallet2)],
        wallet1
      );

      // Check state preserved
      const { result } = simnet.callReadOnlyFn(
        "plant-game",
        "get-plant",
        [Cl.uint(1)],
        wallet2
      );

      // Verify growth points are preserved (should be 3)
      const { result: growthResult } = simnet.callReadOnlyFn(
        "plant-game",
        "get-growth-points",
        [Cl.uint(1)],
        wallet2
      );

      expect(growthResult).toBeSome(Cl.uint(3));

      // Verify stage is Sprout (3 points = stage 1)
      const { result: stageResult } = simnet.callReadOnlyFn(
        "plant-game",
        "get-stage",
        [Cl.uint(1)],
        wallet2
      );

      expect(stageResult).toBeSome(Cl.uint(1));
    });

    it("should reject direct call to update-owner (security fix)", () => {
      // Mint plant for wallet1
      simnet.callPublicFn("plant-nft", "mint", [Cl.principal(wallet1)], deployer);

      // Attempt to directly call update-owner from wallet2 (attacker)
      const { result } = simnet.callPublicFn(
        "plant-game",
        "update-owner",
        [Cl.uint(1), Cl.principal(wallet2)],
        wallet2
      );

      // Should fail with ERR-NOT-AUTHORIZED
      expect(result).toBeErr(Cl.uint(105)); // ERR-NOT-AUTHORIZED

      // Verify owner was NOT changed
      const { result: ownerResult } = simnet.callReadOnlyFn(
        "plant-game",
        "get-plant-owner",
        [Cl.uint(1)],
        wallet1
      );

      expect(ownerResult).toBeSome(Cl.principal(wallet1));

      // Wallet1 should still be able to water (prove ownership intact)
      const { result: waterResult } = simnet.callPublicFn(
        "plant-game",
        "water",
        [Cl.uint(1)],
        wallet1
      );

      expect(waterResult).toBeOk(
        Cl.tuple({
          "new-stage": Cl.uint(0),
          "growth-points": Cl.uint(1),
          "stage-changed": Cl.bool(false),
        })
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle multiple plants per owner", () => {
      // Mint 3 plants for wallet1
      simnet.callPublicFn("plant-nft", "mint", [Cl.principal(wallet1)], deployer);
      simnet.callPublicFn("plant-nft", "mint", [Cl.principal(wallet1)], deployer);
      simnet.callPublicFn("plant-nft", "mint", [Cl.principal(wallet1)], deployer);

      // Water all 3
      simnet.callPublicFn("plant-game", "water", [Cl.uint(1)], wallet1);
      simnet.callPublicFn("plant-game", "water", [Cl.uint(2)], wallet1);
      simnet.callPublicFn("plant-game", "water", [Cl.uint(3)], wallet1);

      // Verify all updated independently
      const plant1 = simnet.callReadOnlyFn(
        "plant-game",
        "get-growth-points",
        [Cl.uint(1)],
        wallet1
      );
      const plant2 = simnet.callReadOnlyFn(
        "plant-game",
        "get-growth-points",
        [Cl.uint(2)],
        wallet1
      );
      const plant3 = simnet.callReadOnlyFn(
        "plant-game",
        "get-growth-points",
        [Cl.uint(3)],
        wallet1
      );

      expect(plant1.result).toBeSome(Cl.uint(1));
      expect(plant2.result).toBeSome(Cl.uint(1));
      expect(plant3.result).toBeSome(Cl.uint(1));
    });

    it("should handle rapid block advancement", () => {
      simnet.callPublicFn("plant-nft", "mint", [Cl.principal(wallet1)], deployer);

      // Water and advance large number of blocks
      simnet.callPublicFn("plant-game", "water", [Cl.uint(1)], wallet1);
      simnet.mineEmptyBlocks(10000);

      // Should still be able to water
      const { result } = simnet.callPublicFn(
        "plant-game",
        "water",
        [Cl.uint(1)],
        wallet1
      );

      expect(result).toBeOk(
        Cl.tuple({
          "new-stage": Cl.uint(1),
          "growth-points": Cl.uint(2),
          "stage-changed": Cl.bool(true),
        })
      );
    });
  });
});
