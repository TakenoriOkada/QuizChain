import { keccak256, toUtf8Bytes } from "ethers";

const QUESTION_ID_BITS = 32n;
const QUESTION_ID_MASK = (1n << QUESTION_ID_BITS) - 1n;
const BANK_ID_BITS = 224n; // 256 - 32
const BANK_ID_MASK = (1n << BANK_ID_BITS) - 1n;

export function deriveBankIdFromCid(cid: string): bigint {
  const hex = keccak256(toUtf8Bytes(cid));
  // 只保留低 224 位，避免左移 32 位后溢出 uint256
  return BigInt(hex) & BANK_ID_MASK;
}

export function makeCompositeId(bankId: bigint, questionId: number): bigint {
  const bank224 = bankId & BANK_ID_MASK;
  return (bank224 << QUESTION_ID_BITS) | BigInt(questionId >>> 0);
}

export function makeCompositeIdFromCidAndQuestion(cid: string, questionId: number): bigint {
  const bank = deriveBankIdFromCid(cid);
  return makeCompositeId(bank, questionId);
}

export function splitCompositeId(id: bigint): { bankId: bigint; questionId: number } {
  const q = Number(id & QUESTION_ID_MASK);
  const b = id >> QUESTION_ID_BITS;
  return { bankId: b, questionId: q };
}

export function shortHex(bi: bigint, len = 8): string {
  const hex = bi.toString(16);
  const h = hex.length > len ? hex.slice(0, len) + "…" : hex;
  return "0x" + h;
}


