/**
 * Get Redemption Batch Details from Testnet
 */
import { fetchCallReadOnlyFunction, cvToValue, Cl } from "@stacks/transactions";
import { STACKS_TESTNET } from "@stacks/network";

const DEPLOYER = "ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ";
const network = STACKS_TESTNET;

const batchId = process.argv[2] ? parseInt(process.argv[2]) : 1;

async function getBatchInfo() {
  console.log(`🌳 DenGrow - Batch #${batchId} Details`);
  console.log("═".repeat(50));

  try {
    const result = await fetchCallReadOnlyFunction({
      network,
      contractAddress: DEPLOYER,
      contractName: "impact-registry",
      functionName: "get-batch",
      functionArgs: [Cl.uint(batchId)],
      senderAddress: DEPLOYER,
    });

    const batchData = cvToValue(result);

    if (!batchData || !batchData.value) {
      console.log(`\n❌ Batch #${batchId} not found\n`);
      return;
    }

    const batch = batchData.value;

    console.log("\n📋 Batch Information:");
    console.log(`   Batch ID:     ${batchId}`);
    console.log(`   Quantity:     ${batch.quantity.value} trees`);
    console.log(`   Proof URL:    ${batch["proof-url"].value}`);
    console.log(`   Proof Hash:   0x${Buffer.from(batch["proof-hash"].value).toString('hex')}`);
    console.log(`   Timestamp:    ${batch.timestamp.value}`);
    console.log(`   Recorded By:  ${batch["recorded-by"].value}`);
    console.log();

    return batch;
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

getBatchInfo();
