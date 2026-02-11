import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

const proofHash = Cl.bufferFromHex(
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
);
const proofUrl = "https://dengrow.app/proof/batch-1";

/**
 * Helper: deposit STX into treasury from a given sender.
 */
function deposit(amount: number, sender: string) {
  return simnet.callPublicFn(
    "dengrow-treasury",
    "deposit",
    [Cl.uint(amount)],
    sender
  );
}

/**
 * Helper: register N graduations in impact-registry so redemptions work.
 */
function registerGraduations(count: number) {
  for (let i = 1; i <= count; i++) {
    simnet.callPublicFn(
      "impact-registry",
      "register-graduation",
      [Cl.uint(i), Cl.principal(wallet1)],
      deployer
    );
  }
}

describe("DenGrow Treasury Contract", () => {
  beforeEach(() => {
    simnet.setEpoch("2.4");
  });

  // ========================================================================
  // ADMIN AUTH
  // ========================================================================
  describe("Admin Authorization", () => {
    it("should reject non-admin from set-partner", () => {
      const { result } = simnet.callPublicFn(
        "dengrow-treasury",
        "set-partner",
        [Cl.principal(wallet2)],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(100)); // ERR-ADMIN-ONLY
    });

    it("should reject non-admin from set-price-per-tree", () => {
      const { result } = simnet.callPublicFn(
        "dengrow-treasury",
        "set-price-per-tree",
        [Cl.uint(1000000)],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(100));
    });

    it("should reject non-admin from redeem-with-payout", () => {
      // First set partner so the unwrap passes, then non-admin is caught
      simnet.callPublicFn(
        "dengrow-treasury",
        "set-partner",
        [Cl.principal(wallet2)],
        deployer
      );
      const { result } = simnet.callPublicFn(
        "dengrow-treasury",
        "redeem-with-payout",
        [Cl.uint(1), proofHash, Cl.stringAscii(proofUrl)],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(100));
    });

    it("should reject non-admin from withdraw", () => {
      const { result } = simnet.callPublicFn(
        "dengrow-treasury",
        "withdraw",
        [Cl.uint(1000000), Cl.principal(wallet1)],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(100));
    });
  });

  // ========================================================================
  // PARTNER MANAGEMENT
  // ========================================================================
  describe("Partner Management", () => {
    it("should allow admin to set partner", () => {
      const { result } = simnet.callPublicFn(
        "dengrow-treasury",
        "set-partner",
        [Cl.principal(wallet2)],
        deployer
      );
      expect(result).toBeOk(Cl.principal(wallet2));
    });

    it("should allow admin to change partner", () => {
      simnet.callPublicFn(
        "dengrow-treasury",
        "set-partner",
        [Cl.principal(wallet1)],
        deployer
      );
      const { result } = simnet.callPublicFn(
        "dengrow-treasury",
        "set-partner",
        [Cl.principal(wallet2)],
        deployer
      );
      expect(result).toBeOk(Cl.principal(wallet2));

      const { result: partner } = simnet.callReadOnlyFn(
        "dengrow-treasury",
        "get-partner",
        [],
        deployer
      );
      expect(partner).toBeSome(Cl.principal(wallet2));
    });

    it("should fail redeem-with-payout when no partner set (u102)", () => {
      registerGraduations(1);
      deposit(1000000, deployer);

      const { result } = simnet.callPublicFn(
        "dengrow-treasury",
        "redeem-with-payout",
        [Cl.uint(1), proofHash, Cl.stringAscii(proofUrl)],
        deployer
      );
      expect(result).toBeErr(Cl.uint(102)); // ERR-NO-PARTNER-SET
    });

    it("should return none when no partner set", () => {
      const { result } = simnet.callReadOnlyFn(
        "dengrow-treasury",
        "get-partner",
        [],
        deployer
      );
      expect(result).toBeNone();
    });
  });

  // ========================================================================
  // DEPOSITS
  // ========================================================================
  describe("Deposits", () => {
    it("should accept deposit and track in contract balance", () => {
      const { result } = deposit(2000000, deployer);
      expect(result).toBeOk(Cl.uint(2000000));

      const { result: balance } = simnet.callReadOnlyFn(
        "dengrow-treasury",
        "get-treasury-balance",
        [],
        deployer
      );
      expect(balance).toBeUint(2000000);
    });

    it("should allow anyone to deposit", () => {
      const { result } = deposit(1000000, wallet1);
      expect(result).toBeOk(Cl.uint(1000000));
    });

    it("should reject zero deposit (u101)", () => {
      const { result } = deposit(0, deployer);
      expect(result).toBeErr(Cl.uint(101)); // ERR-INVALID-AMOUNT
    });

    it("should accumulate multiple deposits", () => {
      deposit(1000000, deployer);
      deposit(2000000, wallet1);

      const { result: stats } = simnet.callReadOnlyFn(
        "dengrow-treasury",
        "get-treasury-stats",
        [],
        deployer
      );

      // Check balance and total-deposited
      const parsed: any = Cl.deserialize(Cl.serialize(stats));
      const { result: balance } = simnet.callReadOnlyFn(
        "dengrow-treasury",
        "get-treasury-balance",
        [],
        deployer
      );
      expect(balance).toBeUint(3000000);
    });
  });

  // ========================================================================
  // PRICE CONFIGURATION
  // ========================================================================
  describe("Price Configuration", () => {
    it("should default to 500000 (0.5 STX)", () => {
      const { result } = simnet.callReadOnlyFn(
        "dengrow-treasury",
        "get-price-per-tree",
        [],
        deployer
      );
      expect(result).toBeUint(500000);
    });

    it("should allow admin to change price", () => {
      const { result } = simnet.callPublicFn(
        "dengrow-treasury",
        "set-price-per-tree",
        [Cl.uint(750000)],
        deployer
      );
      expect(result).toBeOk(Cl.uint(750000));

      const { result: price } = simnet.callReadOnlyFn(
        "dengrow-treasury",
        "get-price-per-tree",
        [],
        deployer
      );
      expect(price).toBeUint(750000);
    });

    it("should reject zero price (u104)", () => {
      const { result } = simnet.callPublicFn(
        "dengrow-treasury",
        "set-price-per-tree",
        [Cl.uint(0)],
        deployer
      );
      expect(result).toBeErr(Cl.uint(104)); // ERR-INVALID-PRICE
    });
  });

  // ========================================================================
  // REDEMPTION WITH PAYOUT
  // ========================================================================
  describe("Redemption with Payout", () => {
    beforeEach(() => {
      // Setup: register graduations, set partner, deposit funds
      registerGraduations(5);
      simnet.callPublicFn(
        "dengrow-treasury",
        "set-partner",
        [Cl.principal(wallet2)],
        deployer
      );
      deposit(5000000, deployer); // 5 STX
    });

    it("should redeem and pay partner correctly", () => {
      const partnerBefore =
        simnet.getAssetsMap().get("STX")?.get(wallet2) ?? 0n;

      const { result } = simnet.callPublicFn(
        "dengrow-treasury",
        "redeem-with-payout",
        [Cl.uint(2), proofHash, Cl.stringAscii(proofUrl)],
        deployer
      );

      expect(result).toBeOk(
        Cl.tuple({
          quantity: Cl.uint(2),
          payout: Cl.uint(1000000), // 2 * 500000
          partner: Cl.principal(wallet2),
          "treasury-remaining": Cl.uint(4000000),
        })
      );

      // Verify partner received payout
      const partnerAfter =
        simnet.getAssetsMap().get("STX")?.get(wallet2) ?? 0n;
      expect(partnerAfter - partnerBefore).toBe(1000000n);

      // Verify treasury balance decreased
      const { result: balance } = simnet.callReadOnlyFn(
        "dengrow-treasury",
        "get-treasury-balance",
        [],
        deployer
      );
      expect(balance).toBeUint(4000000);
    });

    it("should create batch in impact-registry", () => {
      simnet.callPublicFn(
        "dengrow-treasury",
        "redeem-with-payout",
        [Cl.uint(3), proofHash, Cl.stringAscii(proofUrl)],
        deployer
      );

      // Verify impact-registry recorded the batch
      const { result: stats } = simnet.callReadOnlyFn(
        "impact-registry",
        "get-pool-stats",
        [],
        deployer
      );
      expect(stats).toBeTuple({
        "total-graduated": Cl.uint(5),
        "total-redeemed": Cl.uint(3),
        "current-pool-size": Cl.uint(2),
        "total-batches": Cl.uint(1),
      });
    });

    it("should fail with insufficient funds (u103)", () => {
      // Try to redeem more than treasury can pay
      // 5 STX in treasury, 500k/tree, so max 10 trees by funds
      // But only 5 graduated, so try redeeming 5 = 2.5 STX payout (should work)
      // Withdraw most funds first to make it fail
      simnet.callPublicFn(
        "dengrow-treasury",
        "withdraw",
        [Cl.uint(4800000), Cl.principal(deployer)],
        deployer
      );

      // Now treasury has 200k, need 500k for 1 tree
      const { result } = simnet.callPublicFn(
        "dengrow-treasury",
        "redeem-with-payout",
        [Cl.uint(1), proofHash, Cl.stringAscii(proofUrl)],
        deployer
      );
      expect(result).toBeErr(Cl.uint(103)); // ERR-INSUFFICIENT-FUNDS
    });

    it("should fail with zero quantity (u106)", () => {
      const { result } = simnet.callPublicFn(
        "dengrow-treasury",
        "redeem-with-payout",
        [Cl.uint(0), proofHash, Cl.stringAscii(proofUrl)],
        deployer
      );
      expect(result).toBeErr(Cl.uint(106)); // ERR-ZERO-QUANTITY
    });

    it("should update treasury stats after redemption", () => {
      simnet.callPublicFn(
        "dengrow-treasury",
        "redeem-with-payout",
        [Cl.uint(2), proofHash, Cl.stringAscii(proofUrl)],
        deployer
      );

      const { result: stats } = simnet.callReadOnlyFn(
        "dengrow-treasury",
        "get-treasury-stats",
        [],
        deployer
      );

      expect(stats).toBeTuple({
        balance: Cl.uint(4000000),
        partner: Cl.some(Cl.principal(wallet2)),
        "price-per-tree": Cl.uint(500000),
        "total-deposited": Cl.uint(5000000),
        "total-paid-out": Cl.uint(1000000),
        "total-withdrawn": Cl.uint(0),
        "total-redemptions": Cl.uint(1),
      });
    });
  });

  // ========================================================================
  // END-TO-END STX FLOW
  // ========================================================================
  describe("End-to-End STX Flow", () => {
    it("should complete full cycle: deposit → redeem → verify balances", () => {
      // 1. Register graduation (simulates a tree reaching stage 4)
      registerGraduations(1);

      // 2. Set partner
      simnet.callPublicFn(
        "dengrow-treasury",
        "set-partner",
        [Cl.principal(wallet2)],
        deployer
      );

      // 3. Admin deposits 1 STX (simulating mint revenue)
      deposit(1000000, deployer);

      const partnerBefore =
        simnet.getAssetsMap().get("STX")?.get(wallet2) ?? 0n;

      // 4. Redeem 1 tree
      const { result } = simnet.callPublicFn(
        "dengrow-treasury",
        "redeem-with-payout",
        [Cl.uint(1), proofHash, Cl.stringAscii(proofUrl)],
        deployer
      );
      expect(result).toBeOk(
        Cl.tuple({
          quantity: Cl.uint(1),
          payout: Cl.uint(500000), // 0.5 STX
          partner: Cl.principal(wallet2),
          "treasury-remaining": Cl.uint(500000),
        })
      );

      // 5. Verify: partner got 0.5 STX
      const partnerAfter =
        simnet.getAssetsMap().get("STX")?.get(wallet2) ?? 0n;
      expect(partnerAfter - partnerBefore).toBe(500000n);

      // 6. Verify: treasury kept 0.5 STX
      const { result: balance } = simnet.callReadOnlyFn(
        "dengrow-treasury",
        "get-treasury-balance",
        [],
        deployer
      );
      expect(balance).toBeUint(500000);

      // 7. Verify: impact-registry batch was created
      const { result: poolStats } = simnet.callReadOnlyFn(
        "impact-registry",
        "get-pool-stats",
        [],
        deployer
      );
      expect(poolStats).toBeTuple({
        "total-graduated": Cl.uint(1),
        "total-redeemed": Cl.uint(1),
        "current-pool-size": Cl.uint(0),
        "total-batches": Cl.uint(1),
      });
    });
  });

  // ========================================================================
  // EMERGENCY WITHDRAW
  // ========================================================================
  describe("Emergency Withdraw", () => {
    it("should allow admin to withdraw funds", () => {
      deposit(3000000, deployer);

      const { result } = simnet.callPublicFn(
        "dengrow-treasury",
        "withdraw",
        [Cl.uint(1000000), Cl.principal(wallet1)],
        deployer
      );
      expect(result).toBeOk(Cl.uint(1000000));

      const { result: balance } = simnet.callReadOnlyFn(
        "dengrow-treasury",
        "get-treasury-balance",
        [],
        deployer
      );
      expect(balance).toBeUint(2000000);
    });

    it("should reject withdrawing more than balance (u103)", () => {
      deposit(1000000, deployer);

      const { result } = simnet.callPublicFn(
        "dengrow-treasury",
        "withdraw",
        [Cl.uint(2000000), Cl.principal(wallet1)],
        deployer
      );
      expect(result).toBeErr(Cl.uint(103)); // ERR-INSUFFICIENT-FUNDS
    });

    it("should reject zero withdrawal (u101)", () => {
      const { result } = simnet.callPublicFn(
        "dengrow-treasury",
        "withdraw",
        [Cl.uint(0), Cl.principal(wallet1)],
        deployer
      );
      expect(result).toBeErr(Cl.uint(101)); // ERR-INVALID-AMOUNT
    });

    it("should track total withdrawn in stats", () => {
      deposit(2000000, deployer);
      simnet.callPublicFn(
        "dengrow-treasury",
        "withdraw",
        [Cl.uint(500000), Cl.principal(wallet1)],
        deployer
      );

      const { result: stats } = simnet.callReadOnlyFn(
        "dengrow-treasury",
        "get-treasury-stats",
        [],
        deployer
      );

      expect(stats).toBeTuple({
        balance: Cl.uint(1500000),
        partner: Cl.none(),
        "price-per-tree": Cl.uint(500000),
        "total-deposited": Cl.uint(2000000),
        "total-paid-out": Cl.uint(0),
        "total-withdrawn": Cl.uint(500000),
        "total-redemptions": Cl.uint(0),
      });
    });
  });

  // ========================================================================
  // READ-ONLY FUNCTIONS
  // ========================================================================
  describe("Read-Only Functions", () => {
    it("should return correct initial treasury stats", () => {
      const { result } = simnet.callReadOnlyFn(
        "dengrow-treasury",
        "get-treasury-stats",
        [],
        deployer
      );

      expect(result).toBeTuple({
        balance: Cl.uint(0),
        partner: Cl.none(),
        "price-per-tree": Cl.uint(500000),
        "total-deposited": Cl.uint(0),
        "total-paid-out": Cl.uint(0),
        "total-withdrawn": Cl.uint(0),
        "total-redemptions": Cl.uint(0),
      });
    });

    it("should return zero for initial treasury balance", () => {
      const { result } = simnet.callReadOnlyFn(
        "dengrow-treasury",
        "get-treasury-balance",
        [],
        deployer
      );
      expect(result).toBeUint(0);
    });
  });
});
