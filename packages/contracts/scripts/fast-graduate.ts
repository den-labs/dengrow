/**
 * =============================================================================
 * Fast-Graduate Plants on Testnet
 * =============================================================================
 * Mints plants and instantly graduates them to Tree stage by watering 28 times.
 * Only works on testnet (0 block cooldown).
 *
 * Usage:
 *   pnpm tsx scripts/fast-graduate.ts [quantity]
 *   Example: pnpm tsx scripts/fast-graduate.ts 10
 * =============================================================================
 */

import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  principalCV,
  uintCV,
  fetchCallReadOnlyFunction,
  cvToValue,
} from "@stacks/transactions";
import { STACKS_TESTNET } from "@stacks/network";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

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

const DEPLOYER = "ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ";
const network = STACKS_TESTNET;
const privateKey = process.env.STX_TESTNET_KEY;

if (!privateKey) {
  console.error("❌ STX_TESTNET_KEY not found in .env.testnet");
  process.exit(1);
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForTx(txId: string, maxAttempts = 60): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(
        `https://api.testnet.hiro.so/extended/v1/tx/${txId}`
      );
      const data = await response.json();

      if (data.tx_status === "success") {
        return true;
      } else if (data.tx_status === "abort_by_response") {
        console.error(`   ❌ Transaction aborted`);
        return false;
      }
    } catch (e) {
      // API might not have the tx yet
    }

    process.stdout.write(".");
    await sleep(5000);
  }

  console.error("\n   ❌ Transaction timeout");
  return false;
}

async function getNonce(address: string): Promise<number> {
  const response = await fetch(
    `https://api.testnet.hiro.so/extended/v1/address/${address}/nonces`
  );
  const data = await response.json();
  return data.possible_next_nonce;
}

async function getLastTokenId(): Promise<number> {
  const result = await fetchCallReadOnlyFunction({
    contractAddress: DEPLOYER,
    contractName: "plant-nft-v2",
    functionName: "get-last-token-id",
    functionArgs: [],
    senderAddress: DEPLOYER,
    network,
  });

  const parsed: any = cvToValue(result);
  return Number(parsed.value);
}

async function getPlantStage(tokenId: number): Promise<number> {
  const result = await fetchCallReadOnlyFunction({
    contractAddress: DEPLOYER,
    contractName: "plant-storage",
    functionName: "get-stage",
    functionArgs: [uintCV(tokenId)],
    senderAddress: DEPLOYER,
    network,
  });

  const parsed: any = cvToValue(result);
  return Number(parsed.value);
}

async function mintPlant(): Promise<number> {
  console.log("   🌱 Minting plant...");

  const nonce = await getNonce(DEPLOYER);

  const txOptions = {
    contractAddress: DEPLOYER,
    contractName: "plant-nft-v2",
    functionName: "mint",
    functionArgs: [principalCV(DEPLOYER)],
    senderKey: privateKey!,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    fee: 50000n,
    nonce,
  };

  const transaction = await makeContractCall(txOptions);
  const result = await broadcastTransaction({ transaction, network });

  if ("error" in result) {
    throw new Error(`Mint failed: ${result.error}`);
  }

  process.stdout.write("   ⏳ Waiting for mint ");
  const success = await waitForTx(result.txid);

  if (!success) {
    throw new Error("Mint transaction failed");
  }

  const tokenId = await getLastTokenId();
  console.log(`\n   ✅ Minted token #${tokenId}`);

  return tokenId;
}

async function waterPlant(tokenId: number, waterNum: number) {
  const nonce = await getNonce(DEPLOYER);

  const txOptions = {
    contractAddress: DEPLOYER,
    contractName: "plant-game-v1",
    functionName: "water",
    functionArgs: [uintCV(tokenId)],
    senderKey: privateKey!,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    fee: 50000n,
    nonce,
  };

  const transaction = await makeContractCall(txOptions);
  const result = await broadcastTransaction({ transaction, network });

  if ("error" in result) {
    throw new Error(`Water #${waterNum} failed: ${result.error}`);
  }

  process.stdout.write(`   💧 Water ${waterNum}/28 `);
  const success = await waitForTx(result.txid);

  if (!success) {
    throw new Error(`Water #${waterNum} transaction failed`);
  }

  console.log(" ✅");
}

async function graduatePlant(tokenId: number) {
  console.log(`\n🌳 Graduating token #${tokenId} to Tree stage...`);

  // Water 28 times (7 per stage × 4 stages: Seed->Sprout->Plant->Bloom->Tree)
  for (let i = 1; i <= 28; i++) {
    await waterPlant(tokenId, i);

    // Check stage every 7 waters
    if (i % 7 === 0) {
      const stage = await getPlantStage(tokenId);
      const stageNames = ["Seed", "Sprout", "Plant", "Bloom", "Tree"];
      console.log(`   📊 Stage: ${stageNames[stage]} (${stage})`);

      if (stage === 4) {
        console.log(`   🎉 Reached Tree stage after ${i} waters!`);
        return;
      }
    }
  }

  const finalStage = await getPlantStage(tokenId);
  if (finalStage !== 4) {
    console.error(`   ⚠️ Warning: Final stage is ${finalStage}, expected 4`);
  }
}

async function main() {
  const quantity = parseInt(process.argv[2] || "1");

  console.log("═".repeat(60));
  console.log("Fast-Graduate Plants on Testnet");
  console.log("═".repeat(60));
  console.log(`Quantity: ${quantity} plant(s)`);
  console.log();

  const graduatedTokens: number[] = [];

  for (let i = 1; i <= quantity; i++) {
    console.log(`\n[${i}/${quantity}] Processing plant...`);

    try {
      const tokenId = await mintPlant();
      await graduatePlant(tokenId);
      graduatedTokens.push(tokenId);

      console.log(`   ✅ Token #${tokenId} graduated!`);
    } catch (error: any) {
      console.error(`   ❌ Error: ${error.message}`);
      console.log("   Continuing with next plant...");
    }
  }

  console.log("\n" + "═".repeat(60));
  console.log(`✅ Graduated ${graduatedTokens.length}/${quantity} plants`);
  console.log(`Token IDs: ${graduatedTokens.join(", ")}`);
  console.log("═".repeat(60));

  // Check final pool stats
  console.log("\n📊 Final pool stats:");
  const result = await fetchCallReadOnlyFunction({
    contractAddress: DEPLOYER,
    contractName: "impact-registry",
    functionName: "get-pool-stats",
    functionArgs: [],
    senderAddress: DEPLOYER,
    network,
  });

  const stats = cvToValue(result);
  console.log(`   Total Graduated: ${stats["total-graduated"].value}`);
  console.log(`   Total Redeemed:  ${stats["total-redeemed"].value}`);
  console.log(`   Current Pool:    ${stats["current-pool-size"].value}`);
  console.log();
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
