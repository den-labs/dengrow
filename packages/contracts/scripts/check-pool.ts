/**
 * Check Impact Pool Stats on Testnet
 */
import { fetchCallReadOnlyFunction, cvToValue } from "@stacks/transactions";
import { STACKS_TESTNET } from "@stacks/network";

const DEPLOYER = "ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ";
const network = STACKS_TESTNET;

async function checkPoolStats() {
  console.log("🌳 DenGrow - Testnet Pool Status");
  console.log("═".repeat(50));

  try {
    const result = await fetchCallReadOnlyFunction({
      network,
      contractAddress: DEPLOYER,
      contractName: "impact-registry",
      functionName: "get-pool-stats",
      functionArgs: [],
      senderAddress: DEPLOYER,
    });

    const stats = cvToValue(result);

    const graduated = BigInt(stats["total-graduated"].value);
    const redeemed = BigInt(stats["total-redeemed"].value);
    const poolSize = BigInt(stats["current-pool-size"].value);
    const batches = BigInt(stats["total-batches"].value);

    console.log("\n📊 Current Stats:");
    console.log(`   Total Graduated: ${graduated}`);
    console.log(`   Total Redeemed:  ${redeemed}`);
    console.log(`   Current Pool:    ${poolSize}`);
    console.log(`   Total Batches:   ${batches}`);
    console.log();

    if (poolSize > 0n) {
      console.log(`✅ Pool has ${poolSize} tree(s) ready for redemption!`);
    } else {
      console.log("⚠️  Pool is empty. Need to graduate plants first.");
    }
    console.log();

    return { graduated, redeemed, poolSize, batches };
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkPoolStats();
