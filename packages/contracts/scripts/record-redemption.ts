/**
 * =============================================================================
 * Record a Redemption Batch (Admin Only)
 * =============================================================================
 * Records that X trees from the Impact Pool have been "redeemed" for
 * real-world impact (e.g., actual trees planted).
 *
 * Usage:
 *   pnpm redeem -- --quantity 2 --proof-url "https://example.com/proof.pdf"
 * =============================================================================
 */

import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  uintCV,
  bufferCV,
  stringAsciiCV,
  fetchCallReadOnlyFunction,
  cvToString,
} from "@stacks/transactions";
import { STACKS_TESTNET } from "@stacks/network";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createHash } from "crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "..", ".env.testnet");
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const [key, value] = line.split("=");
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

// Configuration
const DEPLOYER = "ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ";
const network = STACKS_TESTNET;

const privateKey = process.env.STX_TESTNET_KEY;

if (!privateKey) {
  console.error("❌ STX_TESTNET_KEY not found");
  process.exit(1);
}

// Parse command line args
const args = process.argv.slice(2);
let quantity = 1;
let proofUrl = "https://dengrow.xyz/proof/batch-1";

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--quantity" && args[i + 1]) {
    quantity = parseInt(args[i + 1], 10);
  }
  if (args[i] === "--proof-url" && args[i + 1]) {
    proofUrl = args[i + 1];
  }
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForTransaction(txId: string, maxAttempts = 60) {
  console.log(`⏳ Waiting for transaction...`);

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(
        `https://api.testnet.hiro.so/extended/v1/tx/${txId}`
      );
      const data = await response.json();

      if (data.tx_status === "success") {
        console.log(`✅ Transaction confirmed!`);
        return true;
      } else if (data.tx_status === "abort_by_response") {
        console.error(`❌ Transaction aborted:`, data.tx_result);
        return false;
      }
    } catch (e) {
      // API might not have the tx yet
    }

    await sleep(5000);
    process.stdout.write(".");
  }

  console.error("\n❌ Transaction timeout");
  return false;
}

async function getPoolStats() {
  const result = await fetchCallReadOnlyFunction({
    contractAddress: DEPLOYER,
    contractName: "impact-registry",
    functionName: "get-pool-stats",
    functionArgs: [],
    senderAddress: DEPLOYER,
    network,
  });
  return cvToString(result);
}

async function main() {
  console.log("=".repeat(60));
  console.log("Record Redemption Batch");
  console.log("=".repeat(60));

  // Show current pool stats
  console.log("\n📊 Current pool stats:");
  console.log(await getPoolStats());

  // Generate proof hash from URL (in production, this would be the hash of the actual proof document)
  const proofHash = createHash("sha256").update(proofUrl).digest();

  console.log(`\n📦 Recording redemption batch:`);
  console.log(`   Quantity: ${quantity} trees`);
  console.log(`   Proof URL: ${proofUrl}`);
  console.log(`   Proof Hash: ${proofHash.toString("hex").slice(0, 16)}...`);

  const txOptions = {
    contractAddress: DEPLOYER,
    contractName: "impact-registry",
    functionName: "record-redemption",
    functionArgs: [
      uintCV(quantity),
      bufferCV(proofHash),
      stringAsciiCV(proofUrl),
    ],
    senderKey: privateKey!,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    fee: 10000n,
  };

  const transaction = await makeContractCall(txOptions);
  const result = await broadcastTransaction({ transaction, network });

  if ("error" in result) {
    console.error("❌ Broadcast error:", result.error);
    process.exit(1);
  }

  console.log(`\n📤 TX: ${result.txid}`);
  console.log(`🔗 https://explorer.hiro.so/txid/${result.txid}?chain=testnet`);

  const success = await waitForTransaction(result.txid);

  if (success) {
    console.log("\n📊 Updated pool stats:");
    console.log(await getPoolStats());

    console.log("\n" + "=".repeat(60));
    console.log(`✅ Redemption recorded! ${quantity} tree(s) converted to real impact.`);
    console.log("=".repeat(60));
  }
}

main().catch(console.error);
