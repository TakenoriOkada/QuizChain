import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(process.cwd(), "..", "fhevm-hardhat-template");
const DEPLOYMENTS_DIR = join(ROOT, "deployments");
const OUT_DIR = join(process.cwd(), "abi");

function ensureDir(p) {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

function loadJson(p) {
  return JSON.parse(readFileSync(p, "utf-8"));
}

function generate() {
  ensureDir(OUT_DIR);

  const networks = ["localhost", "sepolia"]; // 依据 hardhat-deploy 输出

  let addresses = {};
  let abi = undefined;

  for (const n of networks) {
    const p = join(DEPLOYMENTS_DIR, n, "QuizChain.json");
    if (!existsSync(p)) continue;
    const j = loadJson(p);
    addresses[n] = {
      address: j.address,
      chainId: j.chainId,
      chainName: n,
    };
    abi = j.abi;
  }

  if (!abi) throw new Error("QuizChain not deployed yet. Run hardhat deploy.");

  writeFileSync(
    join(OUT_DIR, "QuizChainABI.ts"),
    `export const QuizChainABI = ${JSON.stringify({ abi }, null, 2)} as const;\n`
  );

  writeFileSync(
    join(OUT_DIR, "QuizChainAddresses.ts"),
    `export const QuizChainAddresses = ${JSON.stringify(addresses, null, 2)} as const;\n`
  );
}

generate();




