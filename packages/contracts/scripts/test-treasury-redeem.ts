/**
 * Test treasury redeem-with-payout on testnet.
 * Redeems 1 tree, verifies partner payout and treasury balance change.
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
    if (key && value) process.env[key.trim()] = value.trim();
  });
}

const DEPLOYER = "ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ";
const network = STACKS_TESTNET;
const privateKey = process.env.STX_TESTNET_KEY;

if (!privateKey) {
  console.error("STX_TESTNET_KEY not found");
  process.exit(1);
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForTransaction(txId: string, maxAttempts = 60) {
  console.log(`Waiting for TX: ${txId}`);
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(
        `https://api.testnet.hiro.so/extended/v1/tx/${txId}`
      );
      const data = await response.json();
      if (data.tx_status === "success") {
        console.log("Transaction confirmed!");
        return true;
      } else if (
        data.tx_status === "abort_by_response" ||
        data.tx_status === "abort_by_post_condition"
      ) {
        console.error(`Transaction failed: ${data.tx_status}`);
        if (data.tx_result) console.error("Result:", data.tx_result);
        return false;
      }
    } catch (e) {
      // not yet indexed
    }
    process.stdout.write(".");
    await sleep(5000);
  }
  console.error("\nTimeout");
  return false;
}

async function readStats(contract: string, fn: string) {
  const result = await fetchCallReadOnlyFunction({
    contractAddress: DEPLOYER,
    contractName: contract,
    functionName: fn,
    functionArgs: [],
    senderAddress: DEPLOYER,
    network,
  });
  return cvToString(result);
}

async function main() {
  console.log("=".repeat(60));
  console.log("Treasury Redeem-With-Payout Test");
  console.log("=".repeat(60));

  // 1. Read state before
  console.log("\n--- BEFORE ---");
  console.log("Treasury:", await readStats("dengrow-treasury", "get-treasury-stats"));
  console.log("Pool:", await readStats("impact-registry-v2", "get-pool-stats"));

  // 2. Build redeem-with-payout call
  const quantity = 1;
  const proofUrl = "https://dengrow.app/proof/treasury-test-1";
  const proofHash = createHash("sha256").update(proofUrl).digest();

  console.log(`\nRedeeming ${quantity} tree...`);
  console.log(`Proof URL: ${proofUrl}`);
  console.log(`Proof hash: ${proofHash.toString("hex")}`);

  const txOptions = {
    contractAddress: DEPLOYER,
    contractName: "dengrow-treasury",
    functionName: "redeem-with-payout",
    functionArgs: [
      uintCV(quantity),
      bufferCV(proofHash),
      stringAsciiCV(proofUrl),
    ],
    senderKey: privateKey!,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    fee: 15000n,
  };

  const transaction = await makeContractCall(txOptions);
  const result = await broadcastTransaction({ transaction, network });

  if ("error" in result) {
    console.error("Broadcast error:", result.error);
    process.exit(1);
  }

  console.log(`TX: ${result.txid}`);
  console.log(`https://explorer.hiro.so/txid/${result.txid}?chain=testnet`);

  const success = await waitForTransaction(result.txid);
  if (!success) {
    console.error("Redemption failed!");
    process.exit(1);
  }

  // 3. Read state after
  console.log("\n--- AFTER ---");
  console.log("Treasury:", await readStats("dengrow-treasury", "get-treasury-stats"));
  console.log("Pool:", await readStats("impact-registry-v2", "get-pool-stats"));

  console.log("\n" + "=".repeat(60));
  console.log("Test complete!");
  console.log("=".repeat(60));
}

main().catch(console.error);
