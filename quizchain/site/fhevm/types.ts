import type { Eip1193Provider } from "ethers";

export type FhevmInstance = {
  createEncryptedInput: (
    contractAddress: string,
    userAddress: string
  ) => {
    add32: (v: number | bigint) => void;
    add64: (v: number | bigint) => void;
    addBool: (v: boolean) => void;
    encrypt: () => Promise<{ handles: string[]; inputProof: string }>;
  };
  userDecrypt: (
    entries: { handle: string; contractAddress: string }[],
    privateKey: string,
    publicKey: string,
    signature: string,
    contractAddresses: string[],
    userAddress: string,
    startTimestamp: number,
    durationDays: number
  ) => Promise<Record<string, bigint>>;
};

export type FhevmInstanceConfig = {
  network: Eip1193Provider | string;
  publicKey?: { id: string; data: string };
  publicParams?: Record<string, unknown>;
};




