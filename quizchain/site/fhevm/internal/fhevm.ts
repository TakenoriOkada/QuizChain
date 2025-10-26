import { Eip1193Provider, JsonRpcProvider, isAddress } from "ethers";
import type { FhevmInstance, FhevmInstanceConfig } from "../types";

type FhevmWindowType = typeof window & {
  relayerSDK: any & { __initialized__?: boolean; SepoliaConfig: any };
};

const SDK_CDN_URL =
  "https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.umd.cjs";

function isFhevmWindowType(w: any): w is FhevmWindowType {
  return typeof w !== "undefined" && w.relayerSDK;
}

export const loadSDK = (): Promise<void> =>
  new Promise((resolve, reject) => {
    if (isFhevmWindowType(window) && window.relayerSDK) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = SDK_CDN_URL;
    s.type = "text/javascript";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Relayer SDK"));
    document.head.appendChild(s);
  });

export const initSDK = async (): Promise<void> => {
  if (!isFhevmWindowType(window)) throw new Error("window.relayerSDK missing");
  if (window.relayerSDK.__initialized__) return;
  const ok = await window.relayerSDK.initSDK();
  if (!ok) throw new Error("initSDK failed");
  window.relayerSDK.__initialized__ = true;
};

async function getChainId(providerOrUrl: Eip1193Provider | string): Promise<number> {
  if (typeof providerOrUrl === "string") {
    const p = new JsonRpcProvider(providerOrUrl);
    return Number((await p.getNetwork()).chainId);
  }
  const hex = (await providerOrUrl.request({ method: "eth_chainId" })) as string;
  return Number.parseInt(hex, 16);
}

async function getWeb3Client(rpcUrl: string) {
  const rpc = new JsonRpcProvider(rpcUrl);
  const v = await rpc.send("web3_clientVersion", []);
  await rpc.destroy();
  return String(v);
}

async function tryFetchFHEVMHardhatNodeRelayerMetadata(rpcUrl: string) {
  const version = await getWeb3Client(rpcUrl);
  if (!version.toLowerCase().includes("hardhat")) return undefined;
  const rpc = new JsonRpcProvider(rpcUrl);
  try {
    const meta = await rpc.send("fhevm_relayer_metadata", []);
    return meta as {
      ACLAddress: `0x${string}`;
      InputVerifierAddress: `0x${string}`;
      KMSVerifierAddress: `0x${string}`;
    };
  } finally {
    await rpc.destroy();
  }
}

type ResolveResult =
  | { isMock: true; chainId: number; rpcUrl: string }
  | { isMock: false; chainId: number; rpcUrl?: string };

async function resolve(providerOrUrl: Eip1193Provider | string, mockChains?: Record<number, string>): Promise<ResolveResult> {
  const chainId = await getChainId(providerOrUrl);
  let rpcUrl = typeof providerOrUrl === "string" ? providerOrUrl : undefined;
  const defaults = { 31337: "http://localhost:8545", ...(mockChains ?? {}) };
  if (Object.hasOwn(defaults, chainId)) {
    if (!rpcUrl) rpcUrl = defaults[chainId];
    return { isMock: true, chainId, rpcUrl: rpcUrl! };
  }
  return { isMock: false, chainId, rpcUrl };
}

export async function createFhevmInstance(parameters: {
  provider: Eip1193Provider | string;
  mockChains?: Record<number, string>;
}): Promise<FhevmInstance> {
  const { provider, mockChains } = parameters;
  const { isMock, rpcUrl } = await resolve(provider, mockChains);

  if (isMock) {
    const meta = await tryFetchFHEVMHardhatNodeRelayerMetadata(rpcUrl!);
    if (meta) {
      const mod = await import("./mock/fhevmMock");
      return mod.fhevmMockCreateInstance({ rpcUrl: rpcUrl!, chainId: 31337, metadata: meta });
    }
  }

  await loadSDK();
  await initSDK();

  const relayerSDK = (window as unknown as FhevmWindowType).relayerSDK;
  const cfg = relayerSDK.SepoliaConfig;
  const config: FhevmInstanceConfig = { ...cfg, network: provider };
  const instance = await relayerSDK.createInstance(config);
  return instance as FhevmInstance;
}




