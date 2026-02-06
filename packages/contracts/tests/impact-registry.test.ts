import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("Impact Registry Contract", () => {
  beforeEach(() => {
    simnet.setEpoch("2.4");
  });

  describe("Authorization", () => {
    it("should allow admin to authorize a registrar", () => {
      const { result } = simnet.callPublicFn(
        "impact-registry",
        "authorize-registrar",
        [Cl.principal(`${deployer}.plant-game-v1`)],
        deployer
      );

      expect(result).toBeOk(Cl.bool(true));
    });

    it("should reject non-admin from authorizing registrar", () => {
      const { result } = simnet.callPublicFn(
        "impact-registry",
        "authorize-registrar",
        [Cl.principal(`${deployer}.plant-game-v1`)],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(100)); // ERR-ADMIN-ONLY
    });

    it("should allow admin to revoke registrar", () => {
      // First authorize
      simnet.callPublicFn(
        "impact-registry",
        "authorize-registrar",
        [Cl.principal(`${deployer}.plant-game-v1`)],
        deployer
      );

      // Then revoke
      const { result } = simnet.callPublicFn(
        "impact-registry",
        "revoke-registrar",
        [Cl.principal(`${deployer}.plant-game-v1`)],
        deployer
      );

      expect(result).toBeOk(Cl.bool(true));
    });

    it("should check registrar status correctly", () => {
      // Initially not a registrar
      let { result } = simnet.callReadOnlyFn(
        "impact-registry",
        "is-registrar",
        [Cl.principal(`${deployer}.plant-game-v1`)],
        deployer
      );
      expect(result).toBeBool(false);

      // Authorize
      simnet.callPublicFn(
        "impact-registry",
        "authorize-registrar",
        [Cl.principal(`${deployer}.plant-game-v1`)],
        deployer
      );

      // Now should be a registrar
      ({ result } = simnet.callReadOnlyFn(
        "impact-registry",
        "is-registrar",
        [Cl.principal(`${deployer}.plant-game-v1`)],
        deployer
      ));
      expect(result).toBeBool(true);
    });
  });

  describe("Graduation Registration", () => {
    it("should allow admin to register graduation", () => {
      const { result } = simnet.callPublicFn(
        "impact-registry",
        "register-graduation",
        [Cl.uint(1), Cl.principal(wallet1)],
        deployer
      );

      expect(result).toBeOk(
        Cl.tuple({
          "token-id": Cl.uint(1),
          "graduated-at": Cl.uint(simnet.blockHeight),
          "total-in-pool": Cl.uint(1),
        })
      );
    });

    it("should reject duplicate graduation", () => {
      // First graduation
      simnet.callPublicFn(
        "impact-registry",
        "register-graduation",
        [Cl.uint(1), Cl.principal(wallet1)],
        deployer
      );

      // Try to graduate same token again
      const { result } = simnet.callPublicFn(
        "impact-registry",
        "register-graduation",
        [Cl.uint(1), Cl.principal(wallet1)],
        deployer
      );

      expect(result).toBeErr(Cl.uint(102)); // ERR-ALREADY-GRADUATED
    });

    it("should reject unauthorized caller", () => {
      const { result } = simnet.callPublicFn(
        "impact-registry",
        "register-graduation",
        [Cl.uint(1), Cl.principal(wallet1)],
        wallet1 // Not admin or authorized registrar
      );

      expect(result).toBeErr(Cl.uint(101)); // ERR-UNAUTHORIZED
    });

    it("should increment total-graduated counter", () => {
      // Register 3 graduations
      simnet.callPublicFn(
        "impact-registry",
        "register-graduation",
        [Cl.uint(1), Cl.principal(wallet1)],
        deployer
      );
      simnet.callPublicFn(
        "impact-registry",
        "register-graduation",
        [Cl.uint(2), Cl.principal(wallet1)],
        deployer
      );
      simnet.callPublicFn(
        "impact-registry",
        "register-graduation",
        [Cl.uint(3), Cl.principal(wallet2)],
        deployer
      );

      const { result } = simnet.callReadOnlyFn(
        "impact-registry",
        "get-pool-stats",
        [],
        deployer
      );

      expect(result).toBeTuple({
        "total-graduated": Cl.uint(3),
        "total-redeemed": Cl.uint(0),
        "current-pool-size": Cl.uint(3),
        "total-batches": Cl.uint(0),
      });
    });
  });

  describe("Graduation Queries", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "impact-registry",
        "register-graduation",
        [Cl.uint(1), Cl.principal(wallet1)],
        deployer
      );
    });

    it("should return graduation info for graduated token", () => {
      const { result } = simnet.callReadOnlyFn(
        "impact-registry",
        "get-graduation",
        [Cl.uint(1)],
        deployer
      );

      expect(result).toBeSome(
        Cl.tuple({
          "graduated-at": Cl.uint(simnet.blockHeight),
          owner: Cl.principal(wallet1),
          redeemed: Cl.bool(false),
        })
      );
    });

    it("should return none for non-graduated token", () => {
      const { result } = simnet.callReadOnlyFn(
        "impact-registry",
        "get-graduation",
        [Cl.uint(999)],
        deployer
      );

      expect(result).toBeNone();
    });

    it("should check is-graduated correctly", () => {
      const graduated = simnet.callReadOnlyFn(
        "impact-registry",
        "is-graduated",
        [Cl.uint(1)],
        deployer
      );
      expect(graduated.result).toBeBool(true);

      const notGraduated = simnet.callReadOnlyFn(
        "impact-registry",
        "is-graduated",
        [Cl.uint(999)],
        deployer
      );
      expect(notGraduated.result).toBeBool(false);
    });
  });

  describe("Batch Redemption", () => {
    beforeEach(() => {
      // Register 5 graduations for redemption testing
      for (let i = 1; i <= 5; i++) {
        simnet.callPublicFn(
          "impact-registry",
          "register-graduation",
          [Cl.uint(i), Cl.principal(wallet1)],
          deployer
        );
      }
    });

    it("should allow admin to record redemption batch", () => {
      const proofHash = Cl.bufferFromHex(
        "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
      );
      const proofUrl = "https://example.com/proof/batch-1.pdf";

      const { result } = simnet.callPublicFn(
        "impact-registry",
        "record-redemption",
        [Cl.uint(3), proofHash, Cl.stringAscii(proofUrl)],
        deployer
      );

      expect(result).toBeOk(
        Cl.tuple({
          "batch-id": Cl.uint(1),
          quantity: Cl.uint(3),
          "remaining-in-pool": Cl.uint(2),
        })
      );
    });

    it("should reject non-admin from recording redemption", () => {
      const proofHash = Cl.bufferFromHex(
        "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
      );

      const { result } = simnet.callPublicFn(
        "impact-registry",
        "record-redemption",
        [Cl.uint(3), proofHash, Cl.stringAscii("https://example.com/proof.pdf")],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(100)); // ERR-ADMIN-ONLY
    });

    it("should reject redemption exceeding pool size", () => {
      const proofHash = Cl.bufferFromHex(
        "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
      );

      const { result } = simnet.callPublicFn(
        "impact-registry",
        "record-redemption",
        [Cl.uint(10), proofHash, Cl.stringAscii("https://example.com/proof.pdf")],
        deployer
      );

      expect(result).toBeErr(Cl.uint(104)); // ERR-INVALID-BATCH
    });

    it("should reject zero quantity redemption", () => {
      const proofHash = Cl.bufferFromHex(
        "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
      );

      const { result } = simnet.callPublicFn(
        "impact-registry",
        "record-redemption",
        [Cl.uint(0), proofHash, Cl.stringAscii("https://example.com/proof.pdf")],
        deployer
      );

      expect(result).toBeErr(Cl.uint(104)); // ERR-INVALID-BATCH
    });

    it("should update pool stats after redemption", () => {
      const proofHash = Cl.bufferFromHex(
        "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
      );

      simnet.callPublicFn(
        "impact-registry",
        "record-redemption",
        [Cl.uint(2), proofHash, Cl.stringAscii("https://example.com/proof1.pdf")],
        deployer
      );

      const { result } = simnet.callReadOnlyFn(
        "impact-registry",
        "get-pool-stats",
        [],
        deployer
      );

      expect(result).toBeTuple({
        "total-graduated": Cl.uint(5),
        "total-redeemed": Cl.uint(2),
        "current-pool-size": Cl.uint(3),
        "total-batches": Cl.uint(1),
      });
    });

    it("should increment batch ID for each redemption", () => {
      const proofHash = Cl.bufferFromHex(
        "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
      );

      // First batch
      const { result: batch1 } = simnet.callPublicFn(
        "impact-registry",
        "record-redemption",
        [Cl.uint(1), proofHash, Cl.stringAscii("https://example.com/proof1.pdf")],
        deployer
      );
      expect(batch1).toBeOk(
        Cl.tuple({
          "batch-id": Cl.uint(1),
          quantity: Cl.uint(1),
          "remaining-in-pool": Cl.uint(4),
        })
      );

      // Second batch
      const { result: batch2 } = simnet.callPublicFn(
        "impact-registry",
        "record-redemption",
        [Cl.uint(2), proofHash, Cl.stringAscii("https://example.com/proof2.pdf")],
        deployer
      );
      expect(batch2).toBeOk(
        Cl.tuple({
          "batch-id": Cl.uint(2),
          quantity: Cl.uint(2),
          "remaining-in-pool": Cl.uint(2),
        })
      );
    });
  });

  describe("Batch Queries", () => {
    beforeEach(() => {
      // Register graduations
      for (let i = 1; i <= 5; i++) {
        simnet.callPublicFn(
          "impact-registry",
          "register-graduation",
          [Cl.uint(i), Cl.principal(wallet1)],
          deployer
        );
      }

      // Record a batch
      const proofHash = Cl.bufferFromHex(
        "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
      );
      simnet.callPublicFn(
        "impact-registry",
        "record-redemption",
        [Cl.uint(3), proofHash, Cl.stringAscii("https://example.com/proof.pdf")],
        deployer
      );
    });

    it("should return batch info for existing batch", () => {
      const { result } = simnet.callReadOnlyFn(
        "impact-registry",
        "get-batch",
        [Cl.uint(1)],
        deployer
      );

      expect(result).toBeSome(
        Cl.tuple({
          quantity: Cl.uint(3),
          timestamp: Cl.uint(simnet.blockHeight),
          "proof-hash": Cl.bufferFromHex(
            "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
          ),
          "proof-url": Cl.stringAscii("https://example.com/proof.pdf"),
          "recorded-by": Cl.principal(deployer),
        })
      );
    });

    it("should return none for non-existent batch", () => {
      const { result } = simnet.callReadOnlyFn(
        "impact-registry",
        "get-batch",
        [Cl.uint(999)],
        deployer
      );

      expect(result).toBeNone();
    });

    it("should return correct latest batch ID", () => {
      const { result } = simnet.callReadOnlyFn(
        "impact-registry",
        "get-latest-batch-id",
        [],
        deployer
      );

      expect(result).toBeUint(1);
    });
  });

  describe("Pool Statistics", () => {
    it("should return correct initial pool stats", () => {
      const { result } = simnet.callReadOnlyFn(
        "impact-registry",
        "get-pool-stats",
        [],
        deployer
      );

      expect(result).toBeTuple({
        "total-graduated": Cl.uint(0),
        "total-redeemed": Cl.uint(0),
        "current-pool-size": Cl.uint(0),
        "total-batches": Cl.uint(0),
      });
    });

    it("should track pool size correctly across operations", () => {
      // Graduate 10 plants
      for (let i = 1; i <= 10; i++) {
        simnet.callPublicFn(
          "impact-registry",
          "register-graduation",
          [Cl.uint(i), Cl.principal(wallet1)],
          deployer
        );
      }

      let { result } = simnet.callReadOnlyFn(
        "impact-registry",
        "get-pool-stats",
        [],
        deployer
      );
      expect(result).toBeTuple({
        "total-graduated": Cl.uint(10),
        "total-redeemed": Cl.uint(0),
        "current-pool-size": Cl.uint(10),
        "total-batches": Cl.uint(0),
      });

      // Redeem 4
      const proofHash = Cl.bufferFromHex(
        "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
      );
      simnet.callPublicFn(
        "impact-registry",
        "record-redemption",
        [Cl.uint(4), proofHash, Cl.stringAscii("https://example.com/proof1.pdf")],
        deployer
      );

      ({ result } = simnet.callReadOnlyFn(
        "impact-registry",
        "get-pool-stats",
        [],
        deployer
      ));
      expect(result).toBeTuple({
        "total-graduated": Cl.uint(10),
        "total-redeemed": Cl.uint(4),
        "current-pool-size": Cl.uint(6),
        "total-batches": Cl.uint(1),
      });

      // Redeem 3 more
      simnet.callPublicFn(
        "impact-registry",
        "record-redemption",
        [Cl.uint(3), proofHash, Cl.stringAscii("https://example.com/proof2.pdf")],
        deployer
      );

      ({ result } = simnet.callReadOnlyFn(
        "impact-registry",
        "get-pool-stats",
        [],
        deployer
      ));
      expect(result).toBeTuple({
        "total-graduated": Cl.uint(10),
        "total-redeemed": Cl.uint(7),
        "current-pool-size": Cl.uint(3),
        "total-batches": Cl.uint(2),
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle redemption of entire pool", () => {
      // Graduate 5 plants
      for (let i = 1; i <= 5; i++) {
        simnet.callPublicFn(
          "impact-registry",
          "register-graduation",
          [Cl.uint(i), Cl.principal(wallet1)],
          deployer
        );
      }

      // Redeem all 5
      const proofHash = Cl.bufferFromHex(
        "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
      );
      const { result } = simnet.callPublicFn(
        "impact-registry",
        "record-redemption",
        [Cl.uint(5), proofHash, Cl.stringAscii("https://example.com/proof.pdf")],
        deployer
      );

      expect(result).toBeOk(
        Cl.tuple({
          "batch-id": Cl.uint(1),
          quantity: Cl.uint(5),
          "remaining-in-pool": Cl.uint(0),
        })
      );

      // Pool should be empty
      const { result: stats } = simnet.callReadOnlyFn(
        "impact-registry",
        "get-pool-stats",
        [],
        deployer
      );
      expect(stats).toBeTuple({
        "total-graduated": Cl.uint(5),
        "total-redeemed": Cl.uint(5),
        "current-pool-size": Cl.uint(0),
        "total-batches": Cl.uint(1),
      });
    });

    it("should reject redemption when pool is empty", () => {
      const proofHash = Cl.bufferFromHex(
        "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
      );

      const { result } = simnet.callPublicFn(
        "impact-registry",
        "record-redemption",
        [Cl.uint(1), proofHash, Cl.stringAscii("https://example.com/proof.pdf")],
        deployer
      );

      expect(result).toBeErr(Cl.uint(104)); // ERR-INVALID-BATCH
    });

    it("should handle large token IDs", () => {
      const largeTokenId = 999999999;

      const { result } = simnet.callPublicFn(
        "impact-registry",
        "register-graduation",
        [Cl.uint(largeTokenId), Cl.principal(wallet1)],
        deployer
      );

      expect(result).toBeOk(
        Cl.tuple({
          "token-id": Cl.uint(largeTokenId),
          "graduated-at": Cl.uint(simnet.blockHeight),
          "total-in-pool": Cl.uint(1),
        })
      );
    });
  });
});
