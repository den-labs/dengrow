/**
 * =============================================================================
 * DenGrow Testnet Integration Test
 * =============================================================================
 * Tests the upgradeable architecture on Stacks testnet:
 *   1. Mint NFT via plant-nft-v2
 *   2. Water plant via plant-game-v1
 *   3. Query state via plant-storage
 *
 * Usage:
 *   STX_TESTNET_KEY=<your-private-key> npx ts-node scripts/test-testnet.ts
 *
 * Or with environment file:
 *   Create .env.testnet with STX_TESTNET_KEY=<key>
 *   npx ts-node scripts/test-testnet.ts
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
} from "@stacks/transactions";
import { STACKS_TESTNET } from "@stacks/network";

// Load .env.testnet if exists
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

const contracts = {
  nft: { address: DEPLOYER, name: "plant-nft-v2" },
  game: { address: DEPLOYER, name: "plant-game-v1" },
  storage: { address: DEPLOYER, name: "plant-storage" },
};

// Get private key
const privateKey = process.env.STX_TESTNET_KEY;

if (!privateKey) {
  console.error("❌ Error: STX_TESTNET_KEY not set");
  console.error("");
  console.error("Set it via environment variable:");
  console.error("  STX_TESTNET_KEY=<your-key> npx ts-node scripts/test-testnet.ts");
  console.error("");
  console.error("Or create .env.testnet file:");
  console.error("  echo 'STX_TESTNET_KEY=<your-key>' > .env.testnet");
  process.exit(1);
}

async function getNonce(address: string): Promise<number> {
  const response = await fetch(
    `https://api.testnet.hiro.so/extended/v1/address/${address}/nonces`
  );
  const data = await response.json();
  return data.possible_next_nonce;
}

async function mintNFT(): Promise<string> {
  console.log("\n🌱 [1/3] Minting NFT via plant-nft-v2...");
  console.log(`   Contract: ${DEPLOYER}.plant-nft-v2`);
  console.log(`   Recipient: ${DEPLOYER}`);

  const nonce = await getNonce(DEPLOYER);
  console.log(`   Nonce: ${nonce}`);

  const txOptions = {
    contractAddress: contracts.nft.address,
    contractName: contracts.nft.name,
    functionName: "mint",
    functionArgs: [principalCV(DEPLOYER)],
    senderKey: privateKey,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    fee: 50000n, // 0.05 STX
    nonce,
  };

  const transaction = await makeContractCall(txOptions);
  const broadcastResponse = await broadcastTransaction({ transaction, network });

  if ("error" in broadcastResponse) {
    throw new Error(`Broadcast failed: ${broadcastResponse.error}`);
  }

  const txId = broadcastResponse.txid;
  console.log(`   ✅ Broadcasted: ${txId}`);
  console.log(`   🔗 https://explorer.hiro.so/txid/${txId}?chain=testnet`);

  return txId;
}

async function waterPlant(tokenId: number): Promise<string> {
  console.log(`\n💧 [2/3] Watering plant #${tokenId} via plant-game-v1...`);
  console.log(`   Contract: ${DEPLOYER}.plant-game-v1`);

  const nonce = await getNonce(DEPLOYER);
  console.log(`   Nonce: ${nonce}`);

  const txOptions = {
    contractAddress: contracts.game.address,
    contractName: contracts.game.name,
    functionName: "water",
    functionArgs: [uintCV(tokenId)],
    senderKey: privateKey,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    fee: 50000n,
    nonce,
  };

  const transaction = await makeContractCall(txOptions);
  const broadcastResponse = await broadcastTransaction({ transaction, network });

  if ("error" in broadcastResponse) {
    throw new Error(`Broadcast failed: ${broadcastResponse.error}`);
  }

  const txId = broadcastResponse.txid;
  console.log(`   ✅ Broadcasted: ${txId}`);
  console.log(`   🔗 https://explorer.hiro.so/txid/${txId}?chain=testnet`);

  return txId;
}

async function getPlantState(tokenId: number): Promise<void> {
  console.log(`\n📊 [3/3] Querying plant #${tokenId} state from plant-storage...`);

  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: contracts.storage.address,
      contractName: contracts.storage.name,
      functionName: "get-plant",
      functionArgs: [uintCV(tokenId)],
      network,
      senderAddress: DEPLOYER,
    });

    console.log(`   Result: ${cvToString(result)}`);
  } catch (error) {
    console.log(`   ⚠️  Plant not found or error: ${error}`);
  }
}

async function waitForConfirmation(txId: string, label: string): Promise<boolean> {
  console.log(`\n⏳ Waiting for ${label} confirmation...`);

  const maxAttempts = 60; // 10 minutes max
  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(
      `https://api.testnet.hiro.so/extended/v1/tx/${txId}`
    );
    const data = await response.json();

    if (data.tx_status === "success") {
      console.log(`   ✅ ${label} confirmed!`);
      return true;
    } else if (data.tx_status === "abort_by_response" || data.tx_status === "abort_by_post_condition") {
      console.log(`   ❌ ${label} failed: ${data.tx_status}`);
      if (data.tx_result) {
        console.log(`   Result: ${cvToString(data.tx_result)}`);
      }
      return false;
    }

    process.stdout.write(`   Pending... (${i + 1}/${maxAttempts})\r`);
    await new Promise((r) => setTimeout(r, 10000)); // 10 seconds
  }

  console.log(`   ⚠️  Timeout waiting for ${label}`);
  return false;
}

async function main() {
  console.log("==============================================================================");
  console.log("  DenGrow Testnet Integration Test");
  console.log("==============================================================================");
  console.log(`  Deployer: ${DEPLOYER}`);
  console.log(`  Network: Stacks Testnet`);

  try {
    // 1. Mint NFT
    const mintTxId = await mintNFT();

    // Wait for mint confirmation
    const mintConfirmed = await waitForConfirmation(mintTxId, "mint");

    if (!mintConfirmed) {
      console.log("\n⚠️  Mint not confirmed. You can continue manually:");
      console.log("   - Check the explorer for transaction status");
      console.log("   - Run water manually after mint confirms");
      return;
    }

    // Get the token ID (query last-token-id)
    const lastTokenResult = await fetchCallReadOnlyFunction({
      contractAddress: contracts.nft.address,
      contractName: contracts.nft.name,
      functionName: "get-last-token-id",
      functionArgs: [],
      network,
      senderAddress: DEPLOYER,
    });

    const tokenIdMatch = cvToString(lastTokenResult).match(/u(\d+)/);
    const tokenId = tokenIdMatch ? parseInt(tokenIdMatch[1]) : 1;
    console.log(`\n   🎫 Minted token ID: ${tokenId}`);

    // 2. Query plant state
    await getPlantState(tokenId);

    // 3. Water the plant
    const waterTxId = await waterPlant(tokenId);

    // Wait for water confirmation
    const waterConfirmed = await waitForConfirmation(waterTxId, "water");

    if (waterConfirmed) {
      // Query state again
      await getPlantState(tokenId);
    }

    console.log("\n==============================================================================");
    console.log("  ✅ Test complete!");
    console.log("==============================================================================");

  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exit(1);
  }
}

main();
