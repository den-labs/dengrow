import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

/**
 * Helper: set up the full contract stack and mint + grow plants.
 * Authorizes contracts, mints NFTs, and waters plants to desired stage.
 */
function setupContracts() {
  simnet.setEpoch("2.4");

  // Authorize plant-nft and plant-game-v1 in storage
  simnet.callPublicFn("plant-storage", "authorize-contract",
    [Cl.principal(`${deployer}.plant-nft`)], deployer);
  simnet.callPublicFn("plant-storage", "authorize-contract",
    [Cl.principal(`${deployer}.plant-game-v1`)], deployer);

  // Authorize plant-game-v1 as registrar in impact-registry
  simnet.callPublicFn("impact-registry", "authorize-registrar",
    [Cl.principal(`${deployer}.plant-game-v1`)], deployer);
}

function mintPlant(recipient: string): number {
  const { result } = simnet.callPublicFn(
    "plant-nft", "mint", [Cl.principal(recipient)], deployer
  );
  const val: any = (result as any).value;
  return Number(val.value);
}

function waterPlant(tokenId: number, caller: string) {
  simnet.callPublicFn(
    "plant-game-v1", "water", [Cl.uint(tokenId)], caller
  );
}

function growToTree(tokenId: number, owner: string) {
  // 7 waterings = tree (0 cooldown on testnet)
  for (let i = 0; i < 7; i++) {
    waterPlant(tokenId, owner);
  }
}

describe("Achievement Badges Contract", () => {
  beforeEach(() => {
    setupContracts();
  });

  describe("Read-Only Functions", () => {
    it("should return badge names", () => {
      const { result: name1 } = simnet.callReadOnlyFn(
        "achievement-badges", "get-badge-name", [Cl.uint(1)], deployer
      );
      expect(name1).toBeAscii("First Seed");

      const { result: name2 } = simnet.callReadOnlyFn(
        "achievement-badges", "get-badge-name", [Cl.uint(2)], deployer
      );
      expect(name2).toBeAscii("First Tree");

      const { result: name3 } = simnet.callReadOnlyFn(
        "achievement-badges", "get-badge-name", [Cl.uint(3)], deployer
      );
      expect(name3).toBeAscii("Green Thumb");

      const { result: name4 } = simnet.callReadOnlyFn(
        "achievement-badges", "get-badge-name", [Cl.uint(4)], deployer
      );
      expect(name4).toBeAscii("Early Adopter");
    });

    it("should return total badge types", () => {
      const { result } = simnet.callReadOnlyFn(
        "achievement-badges", "get-total-badge-types", [], deployer
      );
      expect(result).toBeUint(4);
    });

    it("should return 0 total badges claimed initially", () => {
      const { result } = simnet.callReadOnlyFn(
        "achievement-badges", "get-total-badges-claimed", [], deployer
      );
      expect(result).toBeUint(0);
    });

    it("should return 0 badge count for new user", () => {
      const { result } = simnet.callReadOnlyFn(
        "achievement-badges", "get-badge-count", [Cl.principal(wallet1)], deployer
      );
      expect(result).toBeUint(0);
    });
  });

  describe("First Seed Badge", () => {
    it("should allow claiming with a valid plant", () => {
      const tokenId = mintPlant(wallet1);

      const { result } = simnet.callPublicFn(
        "achievement-badges", "claim-first-seed",
        [Cl.uint(tokenId)], wallet1
      );

      expect(result).toBeOk(
        Cl.tuple({
          "badge-id": Cl.uint(1),
          "earned-at": Cl.uint(simnet.blockHeight),
        })
      );
    });

    it("should reject if caller is not the plant owner", () => {
      const tokenId = mintPlant(wallet1);

      const { result } = simnet.callPublicFn(
        "achievement-badges", "claim-first-seed",
        [Cl.uint(tokenId)], wallet2
      );

      expect(result).toBeErr(Cl.uint(201)); // ERR-NOT-ELIGIBLE
    });

    it("should reject duplicate claims", () => {
      const tokenId = mintPlant(wallet1);

      simnet.callPublicFn(
        "achievement-badges", "claim-first-seed",
        [Cl.uint(tokenId)], wallet1
      );

      const { result } = simnet.callPublicFn(
        "achievement-badges", "claim-first-seed",
        [Cl.uint(tokenId)], wallet1
      );

      expect(result).toBeErr(Cl.uint(200)); // ERR-ALREADY-CLAIMED
    });

    it("should reject with non-existent plant", () => {
      const { result } = simnet.callPublicFn(
        "achievement-badges", "claim-first-seed",
        [Cl.uint(999)], wallet1
      );

      expect(result).toBeErr(Cl.uint(201)); // ERR-NOT-ELIGIBLE
    });
  });

  describe("First Tree Badge", () => {
    it("should allow claiming with a graduated tree", () => {
      const tokenId = mintPlant(wallet1);
      growToTree(tokenId, wallet1);

      const { result } = simnet.callPublicFn(
        "achievement-badges", "claim-first-tree",
        [Cl.uint(tokenId)], wallet1
      );

      expect(result).toBeOk(
        Cl.tuple({
          "badge-id": Cl.uint(2),
          "earned-at": Cl.uint(simnet.blockHeight),
        })
      );
    });

    it("should reject with a non-tree plant", () => {
      const tokenId = mintPlant(wallet1);
      // Only water 3 times (not enough for tree)
      waterPlant(tokenId, wallet1);
      waterPlant(tokenId, wallet1);
      waterPlant(tokenId, wallet1);

      const { result } = simnet.callPublicFn(
        "achievement-badges", "claim-first-tree",
        [Cl.uint(tokenId)], wallet1
      );

      expect(result).toBeErr(Cl.uint(201)); // ERR-NOT-ELIGIBLE
    });

    it("should reject if not the owner", () => {
      const tokenId = mintPlant(wallet1);
      growToTree(tokenId, wallet1);

      const { result } = simnet.callPublicFn(
        "achievement-badges", "claim-first-tree",
        [Cl.uint(tokenId)], wallet2
      );

      expect(result).toBeErr(Cl.uint(201)); // ERR-NOT-ELIGIBLE
    });
  });

  describe("Green Thumb Badge", () => {
    it("should allow claiming with 3 different trees", () => {
      const t1 = mintPlant(wallet1);
      const t2 = mintPlant(wallet1);
      const t3 = mintPlant(wallet1);

      growToTree(t1, wallet1);
      growToTree(t2, wallet1);
      growToTree(t3, wallet1);

      const { result } = simnet.callPublicFn(
        "achievement-badges", "claim-green-thumb",
        [Cl.uint(t1), Cl.uint(t2), Cl.uint(t3)], wallet1
      );

      expect(result).toBeOk(
        Cl.tuple({
          "badge-id": Cl.uint(3),
          "earned-at": Cl.uint(simnet.blockHeight),
        })
      );
    });

    it("should reject with duplicate token IDs", () => {
      const t1 = mintPlant(wallet1);
      growToTree(t1, wallet1);

      const { result } = simnet.callPublicFn(
        "achievement-badges", "claim-green-thumb",
        [Cl.uint(t1), Cl.uint(t1), Cl.uint(t1)], wallet1
      );

      expect(result).toBeErr(Cl.uint(201)); // ERR-NOT-ELIGIBLE
    });

    it("should reject if one plant is not a tree", () => {
      const t1 = mintPlant(wallet1);
      const t2 = mintPlant(wallet1);
      const t3 = mintPlant(wallet1);

      growToTree(t1, wallet1);
      growToTree(t2, wallet1);
      // t3 stays at seed

      const { result } = simnet.callPublicFn(
        "achievement-badges", "claim-green-thumb",
        [Cl.uint(t1), Cl.uint(t2), Cl.uint(t3)], wallet1
      );

      expect(result).toBeErr(Cl.uint(201)); // ERR-NOT-ELIGIBLE
    });

    it("should reject if one plant belongs to another owner", () => {
      const t1 = mintPlant(wallet1);
      const t2 = mintPlant(wallet1);
      const t3 = mintPlant(wallet2); // different owner

      growToTree(t1, wallet1);
      growToTree(t2, wallet1);
      growToTree(t3, wallet2);

      const { result } = simnet.callPublicFn(
        "achievement-badges", "claim-green-thumb",
        [Cl.uint(t1), Cl.uint(t2), Cl.uint(t3)], wallet1
      );

      expect(result).toBeErr(Cl.uint(201)); // ERR-NOT-ELIGIBLE
    });
  });

  describe("Early Adopter Badge", () => {
    it("should allow claiming with token-id <= 100", () => {
      const tokenId = mintPlant(wallet1); // token-id 1

      const { result } = simnet.callPublicFn(
        "achievement-badges", "claim-early-adopter",
        [Cl.uint(tokenId)], wallet1
      );

      expect(result).toBeOk(
        Cl.tuple({
          "badge-id": Cl.uint(4),
          "earned-at": Cl.uint(simnet.blockHeight),
        })
      );
    });

    it("should reject if not the plant owner", () => {
      const tokenId = mintPlant(wallet1);

      const { result } = simnet.callPublicFn(
        "achievement-badges", "claim-early-adopter",
        [Cl.uint(tokenId)], wallet2
      );

      expect(result).toBeErr(Cl.uint(201)); // ERR-NOT-ELIGIBLE
    });
  });

  describe("Badge Tracking", () => {
    it("should track badge count per user", () => {
      const t1 = mintPlant(wallet1);
      growToTree(t1, wallet1);

      // Claim first seed
      simnet.callPublicFn(
        "achievement-badges", "claim-first-seed",
        [Cl.uint(t1)], wallet1
      );

      let { result } = simnet.callReadOnlyFn(
        "achievement-badges", "get-badge-count",
        [Cl.principal(wallet1)], deployer
      );
      expect(result).toBeUint(1);

      // Claim first tree
      simnet.callPublicFn(
        "achievement-badges", "claim-first-tree",
        [Cl.uint(t1)], wallet1
      );

      ({ result } = simnet.callReadOnlyFn(
        "achievement-badges", "get-badge-count",
        [Cl.principal(wallet1)], deployer
      ));
      expect(result).toBeUint(2);
    });

    it("should track global badges claimed", () => {
      const t1 = mintPlant(wallet1);
      const t2 = mintPlant(wallet2);

      simnet.callPublicFn(
        "achievement-badges", "claim-first-seed",
        [Cl.uint(t1)], wallet1
      );
      simnet.callPublicFn(
        "achievement-badges", "claim-first-seed",
        [Cl.uint(t2)], wallet2
      );

      const { result } = simnet.callReadOnlyFn(
        "achievement-badges", "get-total-badges-claimed",
        [], deployer
      );
      expect(result).toBeUint(2);
    });

    it("should return badge details with has-badge-read", () => {
      const t1 = mintPlant(wallet1);

      // Not earned yet
      let { result } = simnet.callReadOnlyFn(
        "achievement-badges", "has-badge-read",
        [Cl.principal(wallet1), Cl.uint(1)], deployer
      );
      expect(result).toBeBool(false);

      // Earn it
      simnet.callPublicFn(
        "achievement-badges", "claim-first-seed",
        [Cl.uint(t1)], wallet1
      );

      // Now earned
      ({ result } = simnet.callReadOnlyFn(
        "achievement-badges", "has-badge-read",
        [Cl.principal(wallet1), Cl.uint(1)], deployer
      ));
      expect(result).toBeBool(true);
    });

    it("should return badge info via get-badge", () => {
      const t1 = mintPlant(wallet1);

      simnet.callPublicFn(
        "achievement-badges", "claim-first-seed",
        [Cl.uint(t1)], wallet1
      );

      const { result } = simnet.callReadOnlyFn(
        "achievement-badges", "get-badge",
        [Cl.principal(wallet1), Cl.uint(1)], deployer
      );

      expect(result).toBeSome(
        Cl.tuple({
          "earned-at": Cl.uint(simnet.blockHeight),
        })
      );
    });
  });
});
