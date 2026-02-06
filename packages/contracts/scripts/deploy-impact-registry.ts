/**
 * =============================================================================
 * Deploy Impact Registry Contract to Testnet
 * =============================================================================
 * Deploys the impact-registry contract and authorizes plant-game-v1 as registrar.
 *
 * Usage:
 *   pnpm deploy:impact-registry
 * =============================================================================
 */

import {
  makeContractDeploy,
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  principalCV,
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
      `https://api.testnet.hiro.so/v2/contracts/interface/${DEPLOYER}/impact-registry`
    );
    return response.ok;
  } catch {
    return false;
  }
}

async function deployContract() {
  console.log("\n📦 Deploying impact-registry contract...");

  const contractPath = join(__dirname, "..", "contracts", "impact-registry.clar");
  const codeBody = readFileSync(contractPath, "utf-8");

  const txOptions = {
    codeBody,
    contractName: "impact-registry",
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
  console.log(`🔗 https://explorer.hiro.so/txid/${result.txid}?chain=testnet`);

  return waitForTransaction(result.txid);
}

async function authorizeRegistrar() {
  console.log("\n🔑 Authorizing plant-game-v1 as registrar...");

  const txOptions = {
    contractAddress: DEPLOYER,
    contractName: "impact-registry",
    functionName: "authorize-registrar",
    functionArgs: [principalCV(`${DEPLOYER}.plant-game-v1`)],
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
    throw new Error(result.error);
  }

  console.log(`📤 Authorization TX: ${result.txid}`);
  console.log(`🔗 https://explorer.hiro.so/txid/${result.txid}?chain=testnet`);

  return waitForTransaction(result.txid);
}

async function verifyPoolStats() {
  console.log("\n📊 Verifying pool stats...");

  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: DEPLOYER,
      contractName: "impact-registry",
      functionName: "get-pool-stats",
      functionArgs: [],
      senderAddress: DEPLOYER,
      network,
    });

    console.log("Pool Stats:", cvToString(result));
    return true;
  } catch (error) {
    console.error("❌ Error reading pool stats:", error);
    return false;
  }
}

async function main() {
  console.log("=".repeat(60));
  console.log("DenGrow Impact Registry Deployment");
  console.log("=".repeat(60));
  console.log(`Deployer: ${DEPLOYER}`);
  console.log(`Network: Testnet`);

  // Check if already deployed
  const isDeployed = await checkContractDeployed();

  if (isDeployed) {
    console.log("\n✅ impact-registry already deployed!");
  } else {
    const deploySuccess = await deployContract();
    if (!deploySuccess) {
      console.error("❌ Deployment failed");
      process.exit(1);
    }
  }

  // Authorize plant-game-v1 as registrar
  const authSuccess = await authorizeRegistrar();
  if (!authSuccess) {
    console.error("❌ Authorization failed");
    process.exit(1);
  }

  // Verify
  await verifyPoolStats();

  console.log("\n" + "=".repeat(60));
  console.log("✅ Impact Registry deployment complete!");
  console.log("=".repeat(60));
}

main().catch(console.error);
