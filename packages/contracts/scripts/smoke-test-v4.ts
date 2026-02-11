/**
 * =============================================================================
 * DenGrow Testnet Smoke Test — v4 Contract Stack
 * =============================================================================
 * Verifies the deployed v4 stack on Stacks testnet:
 *   1. Read baseline token ID
 *   2. Paid mint via plant-nft-v4 (mint-with-tier)
 *   3. Verify token ID incremented
 *   4. Verify plant state initialized in plant-storage
 *   5. Water once via plant-game-v3
 *   6. Verify growth state updated
 *
 * Usage:
 *   STX_TESTNET_KEY=<hex-private-key> pnpm --filter @dengrow/contracts smoke:testnet
 *
 * Or with .env.testnet file:
 *   echo 'STX_TESTNET_KEY=<hex-private-key>' > packages/contracts/.env.testnet
 *   pnpm --filter @dengrow/contracts smoke:testnet
 *
 * IMPORTANT: Never log private keys or secrets to the console.
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
  Pc,
} from "@stacks/transactions";
import { STACKS_TESTNET } from "@stacks/network";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "..", ".env.testnet");
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const idx = line.indexOf("=");
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();
      if (key && value) {
        process.env[key] = value;
      }
    }
  });
}

const privateKey = process.env.STX_TESTNET_KEY;
if (!privateKey) {
  console.error("Error: STX_TESTNET_KEY not set");
  console.error("");
  console.error("Set it via environment variable:");
  console.error(
    "  STX_TESTNET_KEY=<key> pnpm --filter @dengrow/contracts smoke:testnet"
  );
  console.error("");
  console.error("Or create .env.testnet file:");
  console.error("  echo 'STX_TESTNET_KEY=<key>' > packages/contracts/.env.testnet");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Configuration — v4 contract stack
// ---------------------------------------------------------------------------

const DEPLOYER = "ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ";
const network = STACKS_TESTNET;

const contracts = {
  nft: { address: DEPLOYER, name: "plant-nft-v4" },
  game: { address: DEPLOYER, name: "plant-game-v3" },
  storage: { address: DEPLOYER, name: "plant-storage" },
};

const MINT_PRICE_USTX = 1_000_000n; // Tier 1 = 1 STX
const MINT_TIER = 1;
const TX_FEE = 50_000n; // 0.05 STX

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getNonce(address: string): Promise<number> {
  const response = await fetch(
    `https://api.testnet.hiro.so/extended/v1/address/${address}/nonces`
  );
  const data = await response.json();
  return data.possible_next_nonce;
}

async function waitForConfirmation(
  txId: string,
  label: string
): Promise<boolean> {
  console.log(`  Waiting for ${label} confirmation...`);

  const maxAttempts = 60;
  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(
      `https://api.testnet.hiro.so/extended/v1/tx/${txId}`
    );
    const data = await response.json();

    if (data.tx_status === "success") {
      console.log(`  ${label} confirmed!`);
      return true;
    } else if (
      data.tx_status === "abort_by_response" ||
      data.tx_status === "abort_by_post_condition"
    ) {
      console.log(`  ${label} FAILED: ${data.tx_status}`);
      if (data.tx_result) {
        console.log(`  Result: ${cvToString(data.tx_result)}`);
      }
      return false;
    }

    process.stdout.write(`  Pending... (${i + 1}/${maxAttempts})\r`);
    await new Promise((r) => setTimeout(r, 10_000));
  }

  console.log(`  Timeout waiting for ${label}`);
  return false;
}

async function readOnly(
  contractName: string,
  functionName: string,
  args: any[]
): Promise<string> {
  const result = await fetchCallReadOnlyFunction({
    contractAddress: DEPLOYER,
    contractName,
    functionName,
    functionArgs: args,
    network,
    senderAddress: DEPLOYER,
  });
  return cvToString(result);
}

function parseUint(cvStr: string): number | null {
  const match = cvStr.match(/u(\d+)/);
  return match ? parseInt(match[1]) : null;
}

function explorerLink(txId: string): string {
  return `https://explorer.hiro.so/txid/${txId}?chain=testnet`;
}

// ---------------------------------------------------------------------------
// Smoke Test Steps
// ---------------------------------------------------------------------------

interface StepResult {
  step: string;
  passed: boolean;
  detail: string;
}

const results: StepResult[] = [];

function record(step: string, passed: boolean, detail: string) {
  results.push({ step, passed, detail });
  console.log(`  ${passed ? "PASS" : "FAIL"}: ${detail}`);
}

async function main() {
  console.log("==============================================================");
  console.log("  DenGrow Testnet Smoke Test — v4 Stack");
  console.log("==============================================================");
  console.log(`  Deployer:  ${DEPLOYER}`);
  console.log(`  NFT:       ${contracts.nft.name}`);
  console.log(`  Game:      ${contracts.game.name}`);
  console.log(`  Storage:   ${contracts.storage.name}`);
  console.log("");

  try {
    // ----- Step 1: Read baseline token ID ------------------------------------
    console.log("[1/6] Reading baseline token ID...");
    const baselineStr = await readOnly(contracts.nft.name, "get-last-token-id", []);
    const baseline = parseUint(baselineStr);
    if (baseline === null) throw new Error(`Could not parse baseline: ${baselineStr}`);
    record("baseline", true, `Last token ID = ${baseline}`);
    console.log("");

    // ----- Step 2: Paid mint -------------------------------------------------
    console.log("[2/6] Minting via plant-nft-v4.mint-with-tier (tier 1, 1 STX)...");
    const nonce = await getNonce(DEPLOYER);

    const mintTx = await makeContractCall({
      contractAddress: contracts.nft.address,
      contractName: contracts.nft.name,
      functionName: "mint-with-tier",
      functionArgs: [principalCV(DEPLOYER), uintCV(MINT_TIER)],
      senderKey: privateKey,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Deny,
      postConditions: [
        Pc.principal(DEPLOYER)
          .willSendEq(MINT_PRICE_USTX)
          .ustx(),
      ],
      fee: TX_FEE,
      nonce,
    });

    const mintBroadcast = await broadcastTransaction({
      transaction: mintTx,
      network,
    });
    if ("error" in mintBroadcast) {
      throw new Error(`Mint broadcast failed: ${mintBroadcast.error}`);
    }
    const mintTxId = mintBroadcast.txid;
    console.log(`  Broadcasted: ${mintTxId}`);
    console.log(`  Explorer: ${explorerLink(mintTxId)}`);

    const mintConfirmed = await waitForConfirmation(mintTxId, "mint");
    record("mint-broadcast", true, `TX: ${mintTxId}`);
    if (!mintConfirmed) {
      record("mint-confirm", false, "Mint did not confirm");
      printSummary();
      return;
    }
    record("mint-confirm", true, "Mint confirmed on-chain");
    console.log("");

    // ----- Step 3: Verify token ID incremented -------------------------------
    console.log("[3/6] Verifying token ID incremented...");
    const newIdStr = await readOnly(contracts.nft.name, "get-last-token-id", []);
    const newId = parseUint(newIdStr);
    const expectedId = baseline + 1;
    const idPassed = newId === expectedId;
    record(
      "token-id",
      idPassed,
      `Expected ${expectedId}, got ${newId}`
    );
    const tokenId = newId ?? expectedId;
    console.log("");

    // ----- Step 4: Verify plant state ----------------------------------------
    console.log(`[4/6] Verifying plant #${tokenId} state in storage...`);
    const plantStr = await readOnly(
      contracts.storage.name,
      "get-plant",
      [uintCV(tokenId)]
    );
    const hasStage0 = plantStr.includes("stage") && plantStr.includes("u0");
    record(
      "plant-init",
      hasStage0,
      `Plant state: ${plantStr.slice(0, 120)}`
    );
    console.log("");

    // ----- Step 5: Water once ------------------------------------------------
    console.log(`[5/6] Watering plant #${tokenId} via plant-game-v3...`);
    const waterNonce = await getNonce(DEPLOYER);

    const waterTx = await makeContractCall({
      contractAddress: contracts.game.address,
      contractName: contracts.game.name,
      functionName: "water",
      functionArgs: [uintCV(tokenId)],
      senderKey: privateKey,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      fee: TX_FEE,
      nonce: waterNonce,
    });

    const waterBroadcast = await broadcastTransaction({
      transaction: waterTx,
      network,
    });
    if ("error" in waterBroadcast) {
      throw new Error(`Water broadcast failed: ${waterBroadcast.error}`);
    }
    const waterTxId = waterBroadcast.txid;
    console.log(`  Broadcasted: ${waterTxId}`);
    console.log(`  Explorer: ${explorerLink(waterTxId)}`);

    const waterConfirmed = await waitForConfirmation(waterTxId, "water");
    record("water-broadcast", true, `TX: ${waterTxId}`);
    if (!waterConfirmed) {
      record("water-confirm", false, "Water did not confirm");
      printSummary();
      return;
    }
    record("water-confirm", true, "Water confirmed on-chain");
    console.log("");

    // ----- Step 6: Verify growth ---------------------------------------------
    console.log(`[6/6] Verifying plant #${tokenId} growth after water...`);
    const growthStr = await readOnly(
      contracts.storage.name,
      "get-plant",
      [uintCV(tokenId)]
    );
    const hasGrowth = growthStr.includes("growth-points") && !growthStr.includes("growth-points u0");
    record(
      "growth-verified",
      hasGrowth,
      `Plant state: ${growthStr.slice(0, 120)}`
    );

  } catch (error) {
    record("error", false, `Unexpected error: ${error}`);
  }

  printSummary();
}

function printSummary() {
  console.log("");
  console.log("==============================================================");
  console.log("  Summary");
  console.log("==============================================================");

  let passed = 0;
  let failed = 0;

  for (const r of results) {
    const icon = r.passed ? "PASS" : "FAIL";
    console.log(`  [${icon}] ${r.step}: ${r.detail}`);
    if (r.passed) passed++;
    else failed++;
  }

  console.log("");
  console.log(`  Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log("==============================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

main();
