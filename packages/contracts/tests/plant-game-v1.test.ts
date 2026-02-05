import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

// Helper to authorize contracts and mint a plant
const setupPlant = (owner: string) => {
  // Authorize contracts (idempotent - safe to call multiple times)
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
  // Mint NFT (this also initializes plant in storage)
  return simnet.callPublicFn("plant-nft", "mint", [Cl.principal(owner)], deployer);
};

describe("Plant Game V1 Contract", () => {
  beforeEach(() => {
    simnet.setEpoch("2.4");
  });

  describe("Water Function - Ownership", () => {
    beforeEach(() => {
      setupPlant(wallet1);
    });

    it("should allow owner to water plant", () => {
      const { result } = simnet.callPublicFn(
        "plant-game-v1",
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

    it("should reject non-owner water attempt", () => {
      const { result } = simnet.callPublicFn(
        "plant-game-v1",
        "water",
        [Cl.uint(1)],
        wallet2 // Not the owner
      );

      expect(result).toBeErr(Cl.uint(100)); // ERR-NOT-OWNER
    });

    it("should fail for non-existent plant", () => {
      const { result } = simnet.callPublicFn(
        "plant-game-v1",
        "water",
        [Cl.uint(999)],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(101)); // ERR-PLANT-NOT-FOUND
    });
  });

  describe("Water Function - Cooldown", () => {
    beforeEach(() => {
      setupPlant(wallet1);
    });

    it("should allow first water without cooldown", () => {
      const { result } = simnet.callPublicFn(
        "plant-game-v1",
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

    it("should allow immediate second water with u0 cooldown", () => {
      // With BLOCKS-PER-DAY = u0, cooldown passes immediately
      // Each simnet call advances the block, so second water is at block > last_water
      simnet.callPublicFn("plant-game-v1", "water", [Cl.uint(1)], wallet1);

      // Second water should succeed (cooldown check: block >= last_water + 0)
      const { result } = simnet.callPublicFn(
        "plant-game-v1",
        "water",
        [Cl.uint(1)],
        wallet1
      );

      expect(result).toBeOk(
        Cl.tuple({
          "new-stage": Cl.uint(1), // STAGE-SPROUT (2 points)
          "growth-points": Cl.uint(2),
          "stage-changed": Cl.bool(true),
        })
      );
    });

    it("should allow water after cooldown expires (u0 for testnet)", () => {
      // First water
      simnet.callPublicFn("plant-game-v1", "water", [Cl.uint(1)], wallet1);

      // Mine 1 block to advance past cooldown
      simnet.mineEmptyBlocks(1);

      // Second water should succeed
      const { result } = simnet.callPublicFn(
        "plant-game-v1",
        "water",
        [Cl.uint(1)],
        wallet1
      );

      expect(result).toBeOk(
        Cl.tuple({
          "new-stage": Cl.uint(1), // STAGE-SPROUT (2 points)
          "growth-points": Cl.uint(2),
          "stage-changed": Cl.bool(true),
        })
      );
    });
  });

  describe("Stage Progression", () => {
    beforeEach(() => {
      setupPlant(wallet1);
    });

    const waterWithCooldown = (tokenId: number, caller: string) => {
      simnet.callPublicFn("plant-game-v1", "water", [Cl.uint(tokenId)], caller);
      simnet.mineEmptyBlocks(1);
    };

    it("should stay at Seed with 1 point", () => {
      waterWithCooldown(1, wallet1);

      const { result } = simnet.callReadOnlyFn(
        "plant-game-v1",
        "get-stage",
        [Cl.uint(1)],
        wallet1
      );

      expect(result).toBeSome(Cl.uint(0)); // STAGE-SEED
    });

    it("should progress to Sprout with 2 points", () => {
      waterWithCooldown(1, wallet1);
      waterWithCooldown(1, wallet1);

      const { result } = simnet.callReadOnlyFn(
        "plant-game-v1",
        "get-stage",
        [Cl.uint(1)],
        wallet1
      );

      expect(result).toBeSome(Cl.uint(1)); // STAGE-SPROUT
    });

    it("should progress to Plant with 4 points", () => {
      for (let i = 0; i < 4; i++) {
        waterWithCooldown(1, wallet1);
      }

      const { result } = simnet.callReadOnlyFn(
        "plant-game-v1",
        "get-stage",
        [Cl.uint(1)],
        wallet1
      );

      expect(result).toBeSome(Cl.uint(2)); // STAGE-PLANT
    });

    it("should progress to Bloom with 6 points", () => {
      for (let i = 0; i < 6; i++) {
        waterWithCooldown(1, wallet1);
      }

      const { result } = simnet.callReadOnlyFn(
        "plant-game-v1",
        "get-stage",
        [Cl.uint(1)],
        wallet1
      );

      expect(result).toBeSome(Cl.uint(3)); // STAGE-BLOOM
    });

    it("should progress to Tree with 7 points", () => {
      for (let i = 0; i < 7; i++) {
        waterWithCooldown(1, wallet1);
      }

      const { result } = simnet.callReadOnlyFn(
        "plant-game-v1",
        "get-stage",
        [Cl.uint(1)],
        wallet1
      );

      expect(result).toBeSome(Cl.uint(4)); // STAGE-TREE
    });

    it("should reject water when already Tree", () => {
      // Water 7 times to reach Tree
      for (let i = 0; i < 7; i++) {
        waterWithCooldown(1, wallet1);
      }

      // Try to water again
      const { result } = simnet.callPublicFn(
        "plant-game-v1",
        "water",
        [Cl.uint(1)],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(103)); // ERR-ALREADY-TREE
    });

    it("should emit stage-changed event when stage changes", () => {
      waterWithCooldown(1, wallet1);

      // Water again to trigger stage change from Seed to Sprout
      const { events } = simnet.callPublicFn(
        "plant-game-v1",
        "water",
        [Cl.uint(1)],
        wallet1
      );

      const printEvents = events.filter((e) => e.event === "print_event");
      expect(printEvents.length).toBeGreaterThan(0);
    });

    it("should emit tree-graduated event when reaching Tree stage", () => {
      for (let i = 0; i < 6; i++) {
        waterWithCooldown(1, wallet1);
      }

      // 7th water should graduate to Tree
      const { events } = simnet.callPublicFn(
        "plant-game-v1",
        "water",
        [Cl.uint(1)],
        wallet1
      );

      const printEvents = events.filter((e) => e.event === "print_event");
      // Should have stage-changed and tree-graduated events
      expect(printEvents.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Update Owner - Security", () => {
    beforeEach(() => {
      setupPlant(wallet1);
    });

    it("should reject direct call to update-owner from regular user", () => {
      const { result } = simnet.callPublicFn(
        "plant-game-v1",
        "update-owner",
        [Cl.uint(1), Cl.principal(wallet2)],
        wallet2 // Attacker trying to steal ownership
      );

      expect(result).toBeErr(Cl.uint(105)); // ERR-NOT-AUTHORIZED
    });

    it("should reject direct call to update-owner from deployer", () => {
      const { result } = simnet.callPublicFn(
        "plant-game-v1",
        "update-owner",
        [Cl.uint(1), Cl.principal(wallet2)],
        deployer // Even deployer cannot call directly
      );

      expect(result).toBeErr(Cl.uint(105)); // ERR-NOT-AUTHORIZED
    });

    it("should update owner when called via NFT transfer", () => {
      // Transfer NFT (this calls update-owner through proper chain)
      const { result: transferResult } = simnet.callPublicFn(
        "plant-nft",
        "transfer",
        [Cl.uint(1), Cl.principal(wallet1), Cl.principal(wallet2)],
        wallet1
      );

      expect(transferResult).toBeOk(Cl.bool(true));

      // Verify owner was updated in storage
      const { result: ownerResult } = simnet.callReadOnlyFn(
        "plant-game-v1",
        "get-plant-owner",
        [Cl.uint(1)],
        wallet2
      );

      expect(ownerResult).toBeSome(Cl.principal(wallet2));
    });
  });

  describe("Read-Only Functions", () => {
    beforeEach(() => {
      setupPlant(wallet1);
    });

    it("should return complete plant state with get-plant", () => {
      simnet.callPublicFn("plant-game-v1", "water", [Cl.uint(1)], wallet1);

      const { result } = simnet.callReadOnlyFn(
        "plant-game-v1",
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
        "plant-game-v1",
        "get-plant",
        [Cl.uint(999)],
        wallet1
      );

      expect(result).toBeNone();
    });

    it("should return true for can-water immediately with u0 cooldown", () => {
      // With BLOCKS-PER-DAY = u0, can-water is always true (except for Tree)
      simnet.callPublicFn("plant-game-v1", "water", [Cl.uint(1)], wallet1);

      const { result } = simnet.callReadOnlyFn(
        "plant-game-v1",
        "can-water",
        [Cl.uint(1)],
        wallet1
      );

      expect(result).toBeOk(Cl.bool(true)); // True because cooldown is 0
    });

    it("should calculate can-water correctly when cooldown expired", () => {
      simnet.callPublicFn("plant-game-v1", "water", [Cl.uint(1)], wallet1);
      simnet.mineEmptyBlocks(1);

      const { result } = simnet.callReadOnlyFn(
        "plant-game-v1",
        "can-water",
        [Cl.uint(1)],
        wallet1
      );

      expect(result).toBeOk(Cl.bool(true));
    });

    it("should return false for can-water when already Tree", () => {
      for (let i = 0; i < 7; i++) {
        simnet.callPublicFn("plant-game-v1", "water", [Cl.uint(1)], wallet1);
        simnet.mineEmptyBlocks(1);
      }

      const { result } = simnet.callReadOnlyFn(
        "plant-game-v1",
        "can-water",
        [Cl.uint(1)],
        wallet1
      );

      expect(result).toBeOk(Cl.bool(false));
    });

    it("should calculate blocks-until-water correctly", () => {
      simnet.callPublicFn("plant-game-v1", "water", [Cl.uint(1)], wallet1);
      simnet.mineEmptyBlocks(1);

      const { result } = simnet.callReadOnlyFn(
        "plant-game-v1",
        "get-blocks-until-water",
        [Cl.uint(1)],
        wallet1
      );

      // With u0 cooldown, should be 0
      expect(result).toBeOk(Cl.uint(0));
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
          "plant-game-v1",
          "get-stage-name",
          [Cl.uint(stage)],
          deployer
        );

        expect(result).toBeAscii(name);
      });
    });

    it("should return cooldown blocks", () => {
      const { result } = simnet.callReadOnlyFn(
        "plant-game-v1",
        "get-cooldown-blocks",
        [],
        wallet1
      );

      expect(result).toBeUint(0); // u0 for testnet
    });

    it("should return version info", () => {
      const { result } = simnet.callReadOnlyFn(
        "plant-game-v1",
        "get-version",
        [],
        wallet1
      );

      expect(result).toBeTuple({
        version: Cl.stringAscii("1.0.0"),
        "cooldown-blocks": Cl.uint(0),
        stages: Cl.uint(5),
      });
    });
  });

  describe("NFT Transfer Integration", () => {
    beforeEach(() => {
      setupPlant(wallet1);
    });

    it("should update plant owner when NFT is transferred", () => {
      // Water plant as wallet1
      simnet.callPublicFn("plant-game-v1", "water", [Cl.uint(1)], wallet1);
      simnet.mineEmptyBlocks(1);

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
        "plant-game-v1",
        "get-plant-owner",
        [Cl.uint(1)],
        wallet2
      );

      expect(ownerResult).toBeSome(Cl.principal(wallet2));

      // Wallet2 should be able to water
      const { result: waterResult } = simnet.callPublicFn(
        "plant-game-v1",
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
      simnet.mineEmptyBlocks(1);
      const { result: oldOwnerWaterResult } = simnet.callPublicFn(
        "plant-game-v1",
        "water",
        [Cl.uint(1)],
        wallet1
      );

      expect(oldOwnerWaterResult).toBeErr(Cl.uint(100)); // ERR-NOT-OWNER
    });

    it("should preserve plant state across transfers", () => {
      // Water 3 times as wallet1
      for (let i = 0; i < 3; i++) {
        simnet.callPublicFn("plant-game-v1", "water", [Cl.uint(1)], wallet1);
        simnet.mineEmptyBlocks(1);
      }

      // Transfer to wallet2
      simnet.callPublicFn(
        "plant-nft",
        "transfer",
        [Cl.uint(1), Cl.principal(wallet1), Cl.principal(wallet2)],
        wallet1
      );

      // Verify growth points are preserved
      const { result: growthResult } = simnet.callReadOnlyFn(
        "plant-game-v1",
        "get-growth-points",
        [Cl.uint(1)],
        wallet2
      );

      expect(growthResult).toBeSome(Cl.uint(3));

      // Verify stage is Sprout (3 points)
      const { result: stageResult } = simnet.callReadOnlyFn(
        "plant-game-v1",
        "get-stage",
        [Cl.uint(1)],
        wallet2
      );

      expect(stageResult).toBeSome(Cl.uint(1)); // STAGE-SPROUT
    });
  });

  describe("Edge Cases", () => {
    it("should handle multiple plants per owner", () => {
      // Setup 3 plants for wallet1
      setupPlant(wallet1); // token-id 1
      simnet.callPublicFn("plant-nft", "mint", [Cl.principal(wallet1)], deployer); // token-id 2
      simnet.callPublicFn("plant-nft", "mint", [Cl.principal(wallet1)], deployer); // token-id 3

      // Water all 3
      simnet.callPublicFn("plant-game-v1", "water", [Cl.uint(1)], wallet1);
      simnet.callPublicFn("plant-game-v1", "water", [Cl.uint(2)], wallet1);
      simnet.callPublicFn("plant-game-v1", "water", [Cl.uint(3)], wallet1);

      // Verify all updated independently
      const plant1 = simnet.callReadOnlyFn(
        "plant-game-v1",
        "get-growth-points",
        [Cl.uint(1)],
        wallet1
      );
      const plant2 = simnet.callReadOnlyFn(
        "plant-game-v1",
        "get-growth-points",
        [Cl.uint(2)],
        wallet1
      );
      const plant3 = simnet.callReadOnlyFn(
        "plant-game-v1",
        "get-growth-points",
        [Cl.uint(3)],
        wallet1
      );

      expect(plant1.result).toBeSome(Cl.uint(1));
      expect(plant2.result).toBeSome(Cl.uint(1));
      expect(plant3.result).toBeSome(Cl.uint(1));
    });

    it("should handle rapid block advancement", () => {
      setupPlant(wallet1);

      // Water and advance large number of blocks
      simnet.callPublicFn("plant-game-v1", "water", [Cl.uint(1)], wallet1);
      simnet.mineEmptyBlocks(10000);

      // Should still be able to water
      const { result } = simnet.callPublicFn(
        "plant-game-v1",
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
  });
});
