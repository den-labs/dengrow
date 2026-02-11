/**
 * =============================================================================
 * Deploy DenGrow Treasury Contract to Testnet
 * =============================================================================
 * Deploys dengrow-treasury, configures partner wallet and price, optionally
 * deposits initial funds.
 *
 * Usage:
 *   pnpm deploy:treasury
 *
 * Environment:
 *   STX_TESTNET_KEY - deployer private key (in .env.testnet or env var)
 *   TREASURY_PARTNER - (optional) partner wallet address to set
 *   TREASURY_DEPOSIT - (optional) STX amount to deposit (e.g. "5" for 5 STX)
 * =============================================================================
 */

import {
  makeContractDeploy,
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  principalCV,
  uintCV,
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
const CONTRACT_NAME = "dengrow-treasury";
const network = STACKS_TESTNET;

const privateKey = process.env.STX_TESTNET_KEY;

if (!privateKey) {
  console.error("STX_TESTNET_KEY not found");
  console.error("Set it in .env.testnet or as environment variable");
  process.exit(1);
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForTransaction(txId: string, maxAttempts = 60) {
  console.log(`Waiting for transaction: ${txId}`);

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(
        `https://api.testnet.hiro.so/extended/v1/tx/${txId}`
      );
      const data = await response.json();

      if (data.tx_status === "success") {
        console.log(`Transaction confirmed!`);
        return true;
      } else if (data.tx_status === "abort_by_response") {
        console.error(`Transaction aborted: ${JSON.stringify(data)}`);
        return false;
      } else if (data.tx_status === "pending") {
        process.stdout.write(".");
      }
    } catch (e) {
      // API might not have the tx yet
    }

    await sleep(5000);
  }

  console.error("\nTransaction timeout");
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
  console.log("\nDeploying dengrow-treasury contract...");

  const contractPath = join(
    __dirname,
    "..",
    "contracts",
    "testnet",
    "dengrow-treasury.clar"
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
    console.error("Broadcast error:", result.error);
    throw new Error(result.error);
  }

  console.log(`Deployment TX: ${result.txid}`);
  console.log(
    `https://explorer.hiro.so/txid/${result.txid}?chain=testnet`
  );

  return waitForTransaction(result.txid);
}

async function configurePartner(partnerAddress: string) {
  console.log(`\nSetting partner wallet: ${partnerAddress}`);

  const txOptions = {
    contractAddress: DEPLOYER,
    contractName: CONTRACT_NAME,
    functionName: "set-partner",
    functionArgs: [principalCV(partnerAddress)],
    senderKey: privateKey!,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    fee: 10000n,
  };

  const transaction = await makeContractCall(txOptions);
  const result = await broadcastTransaction({ transaction, network });

  if ("error" in result) {
    console.error("Broadcast error:", result.error);
    throw new Error(result.error);
  }

  console.log(`Set-partner TX: ${result.txid}`);
  return waitForTransaction(result.txid);
}

async function configurePricePerTree(price: number) {
  console.log(`\nSetting price per tree: ${price} microSTX (${price / 1_000_000} STX)`);

  const txOptions = {
    contractAddress: DEPLOYER,
    contractName: CONTRACT_NAME,
    functionName: "set-price-per-tree",
    functionArgs: [uintCV(price)],
    senderKey: privateKey!,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    fee: 10000n,
  };

  const transaction = await makeContractCall(txOptions);
  const result = await broadcastTransaction({ transaction, network });

  if ("error" in result) {
    console.error("Broadcast error:", result.error);
    throw new Error(result.error);
  }

  console.log(`Set-price TX: ${result.txid}`);
  return waitForTransaction(result.txid);
}

async function depositFunds(amountStx: number) {
  const amountMicro = Math.floor(amountStx * 1_000_000);
  console.log(`\nDepositing ${amountStx} STX (${amountMicro} microSTX) to treasury...`);

  const txOptions = {
    contractAddress: DEPLOYER,
    contractName: CONTRACT_NAME,
    functionName: "deposit",
    functionArgs: [uintCV(amountMicro)],
    senderKey: privateKey!,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    fee: 10000n,
  };

  const transaction = await makeContractCall(txOptions);
  const result = await broadcastTransaction({ transaction, network });

  if ("error" in result) {
    console.error("Broadcast error:", result.error);
    throw new Error(result.error);
  }

  console.log(`Deposit TX: ${result.txid}`);
  return waitForTransaction(result.txid);
}

async function verifyTreasuryStats() {
  console.log("\nVerifying treasury stats...");

  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: DEPLOYER,
      contractName: CONTRACT_NAME,
      functionName: "get-treasury-stats",
      functionArgs: [],
      senderAddress: DEPLOYER,
      network,
    });

    console.log("Treasury Stats:", cvToString(result));
    return true;
  } catch (error) {
    console.error("Error reading treasury stats:", error);
    return false;
  }
}

async function main() {
  console.log("=".repeat(60));
  console.log("DenGrow Treasury Deployment");
  console.log("=".repeat(60));
  console.log(`Deployer: ${DEPLOYER}`);
  console.log(`Contract: ${CONTRACT_NAME}`);
  console.log(`Network: Testnet`);

  // 1. Deploy
  const isDeployed = await checkContractDeployed();
  if (isDeployed) {
    console.log("\ndengrow-treasury already deployed!");
  } else {
    const deploySuccess = await deployContract();
    if (!deploySuccess) {
      console.error("Deployment failed");
      process.exit(1);
    }
  }

  // 2. Set partner (if provided)
  const partnerAddress = process.env.TREASURY_PARTNER;
  if (partnerAddress) {
    const partnerSuccess = await configurePartner(partnerAddress);
    if (!partnerSuccess) {
      console.error("Failed to set partner");
    }
  } else {
    console.log("\nNo TREASURY_PARTNER set, skipping partner config.");
    console.log("Set via: TREASURY_PARTNER=ST... pnpm deploy:treasury");
  }

  // 3. Set price (default 0.5 STX)
  await configurePricePerTree(500000);

  // 4. Deposit (if provided)
  const depositStx = parseFloat(process.env.TREASURY_DEPOSIT || "0");
  if (depositStx > 0) {
    const depositSuccess = await depositFunds(depositStx);
    if (!depositSuccess) {
      console.error("Deposit failed");
    }
  } else {
    console.log("\nNo TREASURY_DEPOSIT set, skipping initial deposit.");
    console.log("Set via: TREASURY_DEPOSIT=5 pnpm deploy:treasury");
  }

  // 5. Verify
  await verifyTreasuryStats();

  console.log("\n" + "=".repeat(60));
  console.log("DenGrow Treasury deployment complete!");
  console.log("=".repeat(60));
}

main().catch(console.error);
