/**
 * Derive private key from seed phrase
 *
 * Usage:
 *   pnpm derive-key
 *
 * This runs locally - your seed never leaves your machine.
 */

import * as readline from "readline";
import { generateWallet } from "@stacks/wallet-sdk";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log("==============================================================================");
  console.log("  Derive Private Key from Seed Phrase");
  console.log("==============================================================================");
  console.log("  ⚠️  This runs locally - your seed never leaves your machine");
  console.log("");

  const seed = await question("Enter your 24-word seed phrase:\n> ");

  if (!seed || seed.split(" ").length < 12) {
    console.error("❌ Invalid seed phrase");
    process.exit(1);
  }

  console.log("\nDeriving keys...\n");

  try {
    const wallet = await generateWallet({
      secretKey: seed.trim(),
      password: "",
    });

    const account = wallet.accounts[0];

    console.log("==============================================================================");
    console.log("  Your Testnet Private Key:");
    console.log("==============================================================================");
    console.log(`\n  ${account.stxPrivateKey}\n`);
    console.log("==============================================================================");
    console.log("  Copy this key to .env.testnet:");
    console.log(`  STX_TESTNET_KEY=${account.stxPrivateKey}`);
    console.log("==============================================================================");
    console.log("\n  ⚠️  Keep this key secret! Never share it.\n");

  } catch (error) {
    console.error("❌ Error deriving key:", error);
    process.exit(1);
  }

  rl.close();
}

main();
