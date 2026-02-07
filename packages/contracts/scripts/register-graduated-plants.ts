/**
 * =============================================================================
 * Register Existing Graduated Plants in Impact Registry
 * =============================================================================
 * Manually registers plants that graduated before impact-registry was deployed.
 *
 * Usage:
 *   pnpm register:graduated
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
  cvToString,
  cvToValue,
  hexToCV,
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

// Configuration
const DEPLOYER = "ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ";
const network = STACKS_TESTNET;

const privateKey = process.env.STX_TESTNET_KEY;

if (!privateKey) {
  console.error("❌ STX_TESTNET_KEY not found");
  process.exit(1);
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForTransaction(txId: string, maxAttempts = 60) {
  console.log(`⏳ Waiting for transaction: ${txId}`);

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
        console.error(`❌ Transaction aborted`);
        return false;
      } else if (data.tx_status === "pending") {
        process.stdout.write(".");
      }
    } catch (e) {
      // API might not have the tx yet
    }

    await sleep(5000);
  }

  console.error("\n❌ Transaction timeout");
  return false;
}

async function getPlantOwner(tokenId: number): Promise<string | null> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: DEPLOYER,
      contractName: "plant-storage",
      functionName: "get-plant-owner",
      functionArgs: [uintCV(tokenId)],
      senderAddress: DEPLOYER,
      network,
    });

    const parsed: any = cvToValue(result);
    if (parsed && parsed.value) {
      return parsed.value;
    }
    return null;
  } catch (error) {
    console.error(`Error getting owner for token ${tokenId}:`, error);
    return null;
  }
}

async function getPlantStage(tokenId: number): Promise<number | null> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: DEPLOYER,
      contractName: "plant-storage",
      functionName: "get-stage",
      functionArgs: [uintCV(tokenId)],
      senderAddress: DEPLOYER,
      network,
    });

    const parsed: any = cvToValue(result);
    if (parsed && parsed.value !== undefined) {
      return Number(parsed.value);
    }
    return null;
  } catch (error) {
    console.error(`Error getting stage for token ${tokenId}:`, error);
    return null;
  }
}

async function isAlreadyGraduated(tokenId: number): Promise<boolean> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: DEPLOYER,
      contractName: "impact-registry",
      functionName: "is-graduated",
      functionArgs: [uintCV(tokenId)],
      senderAddress: DEPLOYER,
      network,
    });

    const parsed: any = cvToValue(result);
    return Boolean(parsed);
  } catch (error) {
    return false;
  }
}

async function registerGraduation(tokenId: number, owner: string) {
  console.log(`\n🌳 Registering token #${tokenId} (owner: ${owner.slice(0, 10)}...)...`);

  const txOptions = {
    contractAddress: DEPLOYER,
    contractName: "impact-registry",
    functionName: "register-graduation",
    functionArgs: [uintCV(tokenId), principalCV(owner)],
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
    return false;
  }

  console.log(`📤 TX: ${result.txid}`);
  return waitForTransaction(result.txid);
}

async function main() {
  console.log("=".repeat(60));
  console.log("Register Graduated Plants in Impact Registry");
  console.log("=".repeat(60));

  // Check tokens 1-8 (including newly graduated plants)
  const tokensToCheck = [1, 2, 3, 4, 5, 6, 7, 8];
  const treesToRegister: { tokenId: number; owner: string }[] = [];

  console.log("\n📋 Checking plant statuses...");

  for (const tokenId of tokensToCheck) {
    const stage = await getPlantStage(tokenId);
    const owner = await getPlantOwner(tokenId);
    const alreadyRegistered = await isAlreadyGraduated(tokenId);

    console.log(`  Token #${tokenId}: stage=${stage}, registered=${alreadyRegistered}`);

    if (stage === 4 && owner && !alreadyRegistered) {
      treesToRegister.push({ tokenId, owner });
    }
  }

  if (treesToRegister.length === 0) {
    console.log("\n✅ All graduated plants are already registered!");
    return;
  }

  console.log(`\n🌲 Found ${treesToRegister.length} trees to register`);

  for (const { tokenId, owner } of treesToRegister) {
    const success = await registerGraduation(tokenId, owner);
    if (!success) {
      console.error(`Failed to register token #${tokenId}`);
    }
  }

  // Verify final pool stats
  console.log("\n📊 Final pool stats:");
  const result = await fetchCallReadOnlyFunction({
    contractAddress: DEPLOYER,
    contractName: "impact-registry",
    functionName: "get-pool-stats",
    functionArgs: [],
    senderAddress: DEPLOYER,
    network,
  });
  console.log(cvToString(result));

  console.log("\n" + "=".repeat(60));
  console.log("✅ Registration complete!");
  console.log("=".repeat(60));
}

main().catch(console.error);
