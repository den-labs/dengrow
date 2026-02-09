import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

const authorizeContracts = () => {
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
  simnet.callPublicFn(
    "impact-registry",
    "authorize-registrar",
    [Cl.principal(`${deployer}.plant-game-v1`)],
    deployer
  );
};

describe("Plant NFT Contract — Pricing Tiers", () => {
  beforeEach(() => {
    simnet.setEpoch("2.4");
    authorizeContracts();
  });

  describe("Admin-only free mint", () => {
    it("should allow deployer to call free mint", () => {
      const { result } = simnet.callPublicFn(
        "plant-nft",
        "mint",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(result).toBeOk(Cl.uint(1));
    });

    it("should reject non-admin calling free mint", () => {
      const { result } = simnet.callPublicFn(
        "plant-nft",
        "mint",
        [Cl.principal(wallet1)],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(100)); // ERR_OWNER_ONLY
    });
  });

  describe("Tier price queries", () => {
    it("should return 1 STX for basic tier (u1)", () => {
      const { result } = simnet.callReadOnlyFn(
        "plant-nft",
        "get-tier-price",
        [Cl.uint(1)],
        deployer
      );
      expect(result).toBeSome(Cl.uint(1_000_000));
    });

    it("should return 2 STX for premium tier (u2)", () => {
      const { result } = simnet.callReadOnlyFn(
        "plant-nft",
        "get-tier-price",
        [Cl.uint(2)],
        deployer
      );
      expect(result).toBeSome(Cl.uint(2_000_000));
    });

    it("should return 3 STX for impact tier (u3)", () => {
      const { result } = simnet.callReadOnlyFn(
        "plant-nft",
        "get-tier-price",
        [Cl.uint(3)],
        deployer
      );
      expect(result).toBeSome(Cl.uint(3_000_000));
    });

    it("should return none for invalid tier (u0)", () => {
      const { result } = simnet.callReadOnlyFn(
        "plant-nft",
        "get-tier-price",
        [Cl.uint(0)],
        deployer
      );
      expect(result).toBeNone();
    });

    it("should return none for invalid tier (u4)", () => {
      const { result } = simnet.callReadOnlyFn(
        "plant-nft",
        "get-tier-price",
        [Cl.uint(4)],
        deployer
      );
      expect(result).toBeNone();
    });
  });

  describe("Paid mint with tier", () => {
    it("should mint with basic tier (1 STX)", () => {
      const { result } = simnet.callPublicFn(
        "plant-nft",
        "mint-with-tier",
        [Cl.principal(wallet1), Cl.uint(1)],
        wallet1
      );
      expect(result).toBeOk(Cl.uint(1));
    });

    it("should mint with premium tier (2 STX)", () => {
      const { result } = simnet.callPublicFn(
        "plant-nft",
        "mint-with-tier",
        [Cl.principal(wallet1), Cl.uint(2)],
        wallet1
      );
      expect(result).toBeOk(Cl.uint(1));
    });

    it("should mint with impact tier (3 STX)", () => {
      const { result } = simnet.callPublicFn(
        "plant-nft",
        "mint-with-tier",
        [Cl.principal(wallet1), Cl.uint(3)],
        wallet1
      );
      expect(result).toBeOk(Cl.uint(1));
    });

    it("should reject invalid tier (u0)", () => {
      const { result } = simnet.callPublicFn(
        "plant-nft",
        "mint-with-tier",
        [Cl.principal(wallet1), Cl.uint(0)],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(302)); // ERR_INVALID_TIER
    });

    it("should reject invalid tier (u4)", () => {
      const { result } = simnet.callPublicFn(
        "plant-nft",
        "mint-with-tier",
        [Cl.principal(wallet1), Cl.uint(4)],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(302)); // ERR_INVALID_TIER
    });
  });

  describe("STX transfer on paid mint", () => {
    it("should transfer correct amount to deployer for basic tier", () => {
      const balanceBefore = simnet.getAssetsMap().get("STX")!.get(deployer)!;

      simnet.callPublicFn(
        "plant-nft",
        "mint-with-tier",
        [Cl.principal(wallet1), Cl.uint(1)],
        wallet1
      );

      const balanceAfter = simnet.getAssetsMap().get("STX")!.get(deployer)!;
      expect(balanceAfter - balanceBefore).toBe(1_000_000n);
    });

    it("should transfer correct amount to deployer for premium tier", () => {
      const balanceBefore = simnet.getAssetsMap().get("STX")!.get(deployer)!;

      simnet.callPublicFn(
        "plant-nft",
        "mint-with-tier",
        [Cl.principal(wallet1), Cl.uint(2)],
        wallet1
      );

      const balanceAfter = simnet.getAssetsMap().get("STX")!.get(deployer)!;
      expect(balanceAfter - balanceBefore).toBe(2_000_000n);
    });

    it("should transfer correct amount to deployer for impact tier", () => {
      const balanceBefore = simnet.getAssetsMap().get("STX")!.get(deployer)!;

      simnet.callPublicFn(
        "plant-nft",
        "mint-with-tier",
        [Cl.principal(wallet1), Cl.uint(3)],
        wallet1
      );

      const balanceAfter = simnet.getAssetsMap().get("STX")!.get(deployer)!;
      expect(balanceAfter - balanceBefore).toBe(3_000_000n);
    });
  });

  describe("Tier storage", () => {
    it("should store tier for paid mint", () => {
      simnet.callPublicFn(
        "plant-nft",
        "mint-with-tier",
        [Cl.principal(wallet1), Cl.uint(2)],
        wallet1
      );

      const { result } = simnet.callReadOnlyFn(
        "plant-nft",
        "get-mint-tier",
        [Cl.uint(1)],
        deployer
      );
      expect(result).toBeSome(Cl.uint(2));
    });

    it("should return none for admin-minted (no tier)", () => {
      simnet.callPublicFn(
        "plant-nft",
        "mint",
        [Cl.principal(wallet1)],
        deployer
      );

      const { result } = simnet.callReadOnlyFn(
        "plant-nft",
        "get-mint-tier",
        [Cl.uint(1)],
        deployer
      );
      expect(result).toBeNone();
    });
  });

  describe("Sequential minting", () => {
    it("should increment token IDs across mixed mint types", () => {
      // Admin mint → token 1
      const { result: r1 } = simnet.callPublicFn(
        "plant-nft",
        "mint",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(r1).toBeOk(Cl.uint(1));

      // Paid mint → token 2
      const { result: r2 } = simnet.callPublicFn(
        "plant-nft",
        "mint-with-tier",
        [Cl.principal(wallet2), Cl.uint(1)],
        wallet2
      );
      expect(r2).toBeOk(Cl.uint(2));

      // Another paid mint → token 3
      const { result: r3 } = simnet.callPublicFn(
        "plant-nft",
        "mint-with-tier",
        [Cl.principal(wallet1), Cl.uint(3)],
        wallet1
      );
      expect(r3).toBeOk(Cl.uint(3));
    });
  });
});
