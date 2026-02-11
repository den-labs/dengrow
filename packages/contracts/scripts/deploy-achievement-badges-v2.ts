/**
 * =============================================================================
 * Deploy achievement-badges-v2 to Testnet
 * =============================================================================
 * Fixes Early Adopter threshold: u100 → u200 to account for plant-nft-v4
 * TOKEN_ID_OFFSET (first 100 mints are token IDs 101-200).
 *
 * No authorization step needed — the contract reads plant-storage directly.
 *
 * Usage:
 *   pnpm deploy:achievement-badges-v2
 * =============================================================================
 */

import {
  makeContractDeploy,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  fetchCallReadOnlyFunction,
  cvToString,
  ClarityVersion,
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
const CONTRACT_NAME = "achievement-badges-v2";
const network = STACKS_TESTNET;

const privateKey = process.env.STX_TESTNET_KEY;

if (!privateKey) {
  console.error("❌ STX_TESTNET_KEY not found");
  console.error("Set it in .env.testnet or as environment variable");
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
        console.error(`❌ Transaction aborted: ${JSON.stringify(data)}`);
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

async function checkContractDeployed(): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.testnet.hiro.so/v2/contracts/interface/${DEPLOYER}/${CONTRACT_NAME}`
    );
    return response.ok;
  } catch {
    return false;
  }
}

async function deployContract() {
  console.log(`\n📦 Deploying ${CONTRACT_NAME}...`);

  const contractPath = join(
    __dirname,
    "..",
    "contracts",
    "testnet",
    "achievement-badges-v2.clar"
  );
  const codeBody = readFileSync(contractPath, "utf-8");

  const txOptions = {
    codeBody,
    contractName: CONTRACT_NAME,
    senderKey: privateKey!,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    fee: 50000n, // 0.05 STX
    clarityVersion: ClarityVersion.Clarity2,
  };

  const transaction = await makeContractDeploy(txOptions);
  const result = await broadcastTransaction({ transaction, network });

  if ("error" in result) {
    console.error("❌ Broadcast error:", result.error);
    throw new Error(result.error);
  }

  console.log(`📤 Deployment TX: ${result.txid}`);
  console.log(
    `🔗 https://explorer.hiro.so/txid/${result.txid}?chain=testnet`
  );

  return { success: await waitForTransaction(result.txid), txid: result.txid };
}

async function verifyBadgeTypes() {
  console.log("\n📊 Verifying badge types...");

  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: DEPLOYER,
      contractName: CONTRACT_NAME,
      functionName: "get-total-badge-types",
      functionArgs: [],
      senderAddress: DEPLOYER,
      network,
    });

    console.log("Total badge types:", cvToString(result));
    return true;
  } catch (error) {
    console.error("❌ Error reading badge types:", error);
    return false;
  }
}

async function main() {
  console.log("=".repeat(60));
  console.log("DenGrow Achievement Badges v2 Deployment");
  console.log("=".repeat(60));
  console.log(`Deployer: ${DEPLOYER}`);
  console.log(`Contract: ${CONTRACT_NAME}`);
  console.log(`Network:  Testnet`);
  console.log(`Change:   Early Adopter threshold u100 → u200`);

  // Check if already deployed
  const isDeployed = await checkContractDeployed();

  if (isDeployed) {
    console.log(`\n✅ ${CONTRACT_NAME} already deployed!`);
  } else {
    const { success, txid } = await deployContract();
    if (!success) {
      console.error("❌ Deployment failed");
      process.exit(1);
    }
    console.log(`\n📝 Record this txid in DEPLOYED_CONTRACTS.json: ${txid}`);
  }

  // Verify read-only functions work
  await verifyBadgeTypes();

  console.log("\n" + "=".repeat(60));
  console.log(`✅ ${CONTRACT_NAME} deployment complete!`);
  console.log("No authorization needed — reads plant-storage directly.");
  console.log("=".repeat(60));
}

main().catch(console.error);
