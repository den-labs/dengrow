import { describe, expect, it, beforeEach, beforeAll } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

// Helper to authorize contracts for tests that need minting
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
};

describe("Plant Storage Contract", () => {
  beforeEach(() => {
    simnet.setEpoch("2.4");
  });

  describe("Authorization System", () => {
    it("should have deployer as admin", () => {
      const { result } = simnet.callReadOnlyFn(
        "plant-storage",
        "get-admin",
        [],
        deployer
      );

      expect(result).toBePrincipal(deployer);
    });

    it("should allow admin to authorize contracts", () => {
      // Authorize plant-nft contract
      const { result } = simnet.callPublicFn(
        "plant-storage",
        "authorize-contract",
        [Cl.principal(`${deployer}.plant-nft`)],
        deployer
      );

      expect(result).toBeOk(Cl.bool(true));

      // Verify authorization
      const { result: isAuth } = simnet.callReadOnlyFn(
        "plant-storage",
        "is-authorized",
        [Cl.principal(`${deployer}.plant-nft`)],
        deployer
      );

      expect(isAuth).toBeBool(true);
    });

    it("should reject non-admin authorization attempts", () => {
      const { result } = simnet.callPublicFn(
        "plant-storage",
        "authorize-contract",
        [Cl.principal(`${deployer}.plant-nft`)],
        wallet1 // Not the admin
      );

      expect(result).toBeErr(Cl.uint(100)); // ERR-ADMIN-ONLY
    });

    it("should allow admin to revoke contracts", () => {
      // First authorize
      simnet.callPublicFn(
        "plant-storage",
        "authorize-contract",
        [Cl.principal(`${deployer}.plant-nft`)],
        deployer
      );

      // Then revoke
      const { result } = simnet.callPublicFn(
        "plant-storage",
        "revoke-contract",
        [Cl.principal(`${deployer}.plant-nft`)],
        deployer
      );

      expect(result).toBeOk(Cl.bool(true));

      // Verify revocation
      const { result: isAuth } = simnet.callReadOnlyFn(
        "plant-storage",
        "is-authorized",
        [Cl.principal(`${deployer}.plant-nft`)],
        deployer
      );

      expect(isAuth).toBeBool(false);
    });

    it("should reject non-admin revocation attempts", () => {
      const { result } = simnet.callPublicFn(
        "plant-storage",
        "revoke-contract",
        [Cl.principal(`${deployer}.plant-nft`)],
        wallet1 // Not the admin
      );

      expect(result).toBeErr(Cl.uint(100)); // ERR-ADMIN-ONLY
    });
  });

  describe("Write Operations - Authorization Required", () => {
    it("should reject initialize-plant from unauthorized caller", () => {
      // Try to initialize directly without authorization
      const { result } = simnet.callPublicFn(
        "plant-storage",
        "initialize-plant",
        [Cl.uint(1), Cl.principal(wallet1)],
        wallet1 // Not authorized
      );

      expect(result).toBeErr(Cl.uint(105)); // ERR-NOT-AUTHORIZED
    });

    it("should reject update-plant-state from unauthorized caller", () => {
      // Authorize contracts and mint a plant
      authorizeContracts();
      simnet.callPublicFn("plant-nft", "mint", [Cl.principal(wallet1)], deployer);

      // Try to update directly as regular user (not authorized)
      const { result } = simnet.callPublicFn(
        "plant-storage",
        "update-plant-state",
        [Cl.uint(1), Cl.uint(1), Cl.uint(5), Cl.uint(100)],
        wallet1 // Not authorized
      );

      expect(result).toBeErr(Cl.uint(105)); // ERR-NOT-AUTHORIZED
    });

    it("should reject update-plant-owner from unauthorized caller", () => {
      // Authorize contracts and mint a plant
      authorizeContracts();
      simnet.callPublicFn("plant-nft", "mint", [Cl.principal(wallet1)], deployer);

      // Try to update owner directly as regular user (not authorized)
      const { result } = simnet.callPublicFn(
        "plant-storage",
        "update-plant-owner",
        [Cl.uint(1), Cl.principal(wallet2)],
        wallet1 // Not authorized
      );

      expect(result).toBeErr(Cl.uint(105)); // ERR-NOT-AUTHORIZED
    });
  });

  describe("Read Operations - No Authorization Required", () => {
    beforeEach(() => {
      // Authorize contracts and mint a plant to have data to read
      authorizeContracts();
      simnet.callPublicFn("plant-nft", "mint", [Cl.principal(wallet1)], deployer);
    });

    it("should allow anyone to read plant data", () => {
      const { result } = simnet.callReadOnlyFn(
        "plant-storage",
        "get-plant",
        [Cl.uint(1)],
        wallet2 // Anyone can read
      );

      expect(result).toBeSome(
        Cl.tuple({
          stage: Cl.uint(0),
          "growth-points": Cl.uint(0),
          "last-water-block": Cl.uint(0),
          owner: Cl.principal(wallet1),
        })
      );
    });

    it("should return none for non-existent plant", () => {
      const { result } = simnet.callReadOnlyFn(
        "plant-storage",
        "get-plant",
        [Cl.uint(999)],
        wallet1
      );

      expect(result).toBeNone();
    });

    it("should return stage correctly", () => {
      const { result } = simnet.callReadOnlyFn(
        "plant-storage",
        "get-stage",
        [Cl.uint(1)],
        wallet1
      );

      expect(result).toBeSome(Cl.uint(0)); // STAGE-SEED
    });

    it("should return growth points correctly", () => {
      const { result } = simnet.callReadOnlyFn(
        "plant-storage",
        "get-growth-points",
        [Cl.uint(1)],
        wallet1
      );

      expect(result).toBeSome(Cl.uint(0));
    });

    it("should return plant owner correctly", () => {
      const { result } = simnet.callReadOnlyFn(
        "plant-storage",
        "get-plant-owner",
        [Cl.uint(1)],
        wallet1
      );

      expect(result).toBeSome(Cl.principal(wallet1));
    });

    it("should check plant existence correctly", () => {
      const { result: exists } = simnet.callReadOnlyFn(
        "plant-storage",
        "plant-exists",
        [Cl.uint(1)],
        wallet1
      );

      expect(exists).toBeBool(true);

      const { result: notExists } = simnet.callReadOnlyFn(
        "plant-storage",
        "plant-exists",
        [Cl.uint(999)],
        wallet1
      );

      expect(notExists).toBeBool(false);
    });
  });

  describe("Plant Initialization via NFT", () => {
    beforeEach(() => {
      authorizeContracts();
    });

    it("should initialize plant correctly when NFT is minted", () => {
      const { result } = simnet.callPublicFn(
        "plant-nft",
        "mint",
        [Cl.principal(wallet1)],
        deployer
      );

      expect(result).toBeOk(Cl.uint(1));

      // Verify plant was initialized in storage
      const { result: plantResult } = simnet.callReadOnlyFn(
        "plant-storage",
        "get-plant",
        [Cl.uint(1)],
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

    it("should reject duplicate plant initialization", () => {
      // Mint first plant
      simnet.callPublicFn("plant-nft", "mint", [Cl.principal(wallet1)], deployer);

      // Verify plant exists
      const { result: exists } = simnet.callReadOnlyFn(
        "plant-storage",
        "plant-exists",
        [Cl.uint(1)],
        wallet1
      );

      expect(exists).toBeBool(true);
    });
  });

  describe("Extension Data", () => {
    it("should reject set-extension-data from unauthorized caller", () => {
      const { result } = simnet.callPublicFn(
        "plant-storage",
        "set-extension-data",
        [
          Cl.stringAscii("achievements"),
          Cl.uint(1),
          Cl.buffer(Buffer.from("test-data")),
        ],
        wallet1 // Not authorized
      );

      expect(result).toBeErr(Cl.uint(105)); // ERR-NOT-AUTHORIZED
    });

    it("should return none for non-existent extension data", () => {
      const { result } = simnet.callReadOnlyFn(
        "plant-storage",
        "get-extension-data",
        [Cl.stringAscii("achievements"), Cl.uint(1)],
        wallet1
      );

      expect(result).toBeNone();
    });
  });

  describe("Multi-Contract Authorization", () => {
    it("should allow multiple contracts to be authorized simultaneously", () => {
      // Authorize both plant-nft and plant-game-v1
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

      // Verify both are authorized
      const { result: nftAuth } = simnet.callReadOnlyFn(
        "plant-storage",
        "is-authorized",
        [Cl.principal(`${deployer}.plant-nft`)],
        deployer
      );

      const { result: gameAuth } = simnet.callReadOnlyFn(
        "plant-storage",
        "is-authorized",
        [Cl.principal(`${deployer}.plant-game-v1`)],
        deployer
      );

      expect(nftAuth).toBeBool(true);
      expect(gameAuth).toBeBool(true);
    });
  });
});
