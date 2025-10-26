"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BrowserProvider, Contract, JsonRpcSigner, ethers } from "ethers";
import { createFhevmInstance } from "../fhevm/internal/fhevm";
import { makeCompositeIdFromCidAndQuestion } from "./quizBank";
import { QuizChainABI } from "../abi/QuizChainABI";
import { QuizChainAddresses } from "../abi/QuizChainAddresses";

export type QuizItem = {
  id: number;
  question: string;
  options: string[];
  // IPFS 数据通常包含明文答案，前端仅用于本地判定与展示
  answer?: string;
};

export type UseQuizChainParams = {
  ipfsCid: string; // e.g. "Qm..."
  questionCount?: number; // default 5
};

export function useQuizChain(params: UseQuizChainParams) {
  const { ipfsCid, questionCount = 5 } = params;

  const [provider, setProvider] = useState<ethers.Eip1193Provider | string | undefined>(undefined);
  const [signer, setSigner] = useState<JsonRpcSigner | undefined>(undefined);
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [chainId, setChainId] = useState<number | undefined>(undefined);
  const [instance, setInstance] = useState<any>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [message, setMessage] = useState<string>("");

  const [allQuestions, setAllQuestions] = useState<QuizItem[]>([]);
  const [quiz, setQuiz] = useState<QuizItem[]>([]);
  const [index, setIndex] = useState<number>(0);
  const [finished, setFinished] = useState<boolean>(false);
  const [scoreClear, setScoreClear] = useState<string | undefined>(undefined);
  const [loadingQuestions, setLoadingQuestions] = useState<boolean>(false);
  const [started, setStarted] = useState<boolean>(false);
  const [localScore, setLocalScore] = useState<number>(0);

  // --- Web3 init ---
  useEffect(() => {
    const w = (window as any).ethereum;
    if (!w) {
      setError("MetaMask not found");
      return;
    }
    setProvider(w);
    const bp = new BrowserProvider(w);
    bp.getSigner().then((s) => setSigner(s));
    w.request({ method: "eth_chainId" }).then((h: string) => setChainId(parseInt(h, 16)));
    w.request({ method: "eth_requestAccounts" }).then((accounts: string[]) => setAddress(accounts?.[0]));
  }, []);

  // --- FHEVM instance ---
  useEffect(() => {
    if (!provider || !chainId) return;
    createFhevmInstance({ provider, mockChains: { 31337: "http://localhost:8545" } })
      .then((i) => setInstance(i))
      .catch((e) => setError("Init FHEVM failed: " + e.message));
  }, [provider, chainId]);

  const contractInfo = useMemo(() => {
    if (!chainId) return undefined as any;
    const n = chainId === 31337 ? "localhost" : chainId === 11155111 ? "sepolia" : undefined;
    if (!n) return undefined as any;
    const info = (QuizChainAddresses as any)[n];
    if (!info?.address) return undefined as any;
    return info;
  }, [chainId]);

  const contract = useMemo(() => {
    if (!signer || !contractInfo?.address) return undefined;
    return new Contract(contractInfo.address, QuizChainABI.abi, signer);
  }, [signer, contractInfo]);

  // --- IPFS load ---
  const loadFromIPFS = useCallback(async () => {
    const buildUrls = (value: string): string[] => {
      if (!value) return [];
      if (/^https?:\/\//i.test(value)) return [value];
      const cid = value.replace(/^ipfs:\/\//i, "").replace(/^\/ipfs\//i, "");
      return [
        `https://ipfs.io/ipfs/${cid}`,
        `https://gateway.pinata.cloud/ipfs/${cid}`,
        `https://cloudflare-ipfs.com/ipfs/${cid}`,
        `https://dweb.link/ipfs/${cid}`,
      ];
    };

    const urls = buildUrls(ipfsCid);
    let lastErr: any = undefined;
    setLoadingQuestions(true);
    for (const url of urls) {
      try {
        const res = await fetch(url, { cache: "no-store" });
        const text = await res.text();
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const ct = (res.headers.get("content-type") || "").toLowerCase();
        const looksJson = ct.includes("application/json") || text.trim().startsWith("[") || text.trim().startsWith("{");
        if (!looksJson) {
          // 该网关返回了 HTML（常见 404 网关页），尝试下一个
          lastErr = new Error("Gateway returned non-JSON (likely HTML)");
          continue;
        }
        const arr = JSON.parse(text) as QuizItem[];
        setAllQuestions(arr);
        return arr;
      } catch (e: any) {
        lastErr = e;
        continue;
      }
    }
    setError(
      `Load IPFS failed: 无法从可用网关获取 JSON（请确认 CID 是否正确，或稍后重试）。` +
        (lastErr?.message ? ` (${lastErr.message})` : "")
    );
    return [];
  }, [ipfsCid]);

  // 预取题库，便于在开始前显示数量并启用按钮
  useEffect(() => {
    if (!ipfsCid) return;
    loadFromIPFS()
      .catch(() => {})
      .finally(() => setLoadingQuestions(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ipfsCid]);

  const start = useCallback(async () => {
    setFinished(false);
    setStarted(true);
    setScoreClear(undefined);
    setIndex(0);
    setLocalScore(0);
    const arr = allQuestions.length ? allQuestions : await loadFromIPFS();
    // 随机抽取 questionCount
    const shuffled = [...arr].sort(() => Math.random() - 0.5).slice(0, questionCount);
    setQuiz(shuffled);
  }, [allQuestions, loadFromIPFS, questionCount]);

  const current = useMemo(() => quiz[index], [quiz, index]);

  const answer = useCallback(async (optionIndex: number) => {
    if (!current) return;
    // 确保拿到用户地址（请求账户后立刻使用本地变量，避免因 setState 异步导致 address 仍为空）
    let userAddr = address as string | undefined;
    if (!userAddr) {
      try {
        const w = (window as any).ethereum;
        if (w) {
          const accs: string[] = await w.request({ method: "eth_requestAccounts" });
          userAddr = accs?.[0];
          if (userAddr) setAddress(userAddr);
        }
      } catch {}
    }
    if (!userAddr && signer) {
      try {
        userAddr = await signer.getAddress();
        if (userAddr) setAddress(userAddr);
      } catch {}
    }
    if (!userAddr) {
      setError("未获取到钱包地址，请先连接钱包。");
      return;
    }
    if (!contract) {
      setError("未检测到合约实例，请确认网络为 Sepolia 且前端地址已更新。");
      return;
    }
    if (!instance) {
      setError("FHEVM 实例未就绪，稍候片刻或刷新页面后重试。");
      return;
    }
    try {
      const choice = current.options[optionIndex];
      const ansHash = ethers.keccak256(ethers.toUtf8Bytes(choice));
      // 复合题目ID：题库+题号（仅用于链上区分不同题库，合约保持同一接口）
      const compositeId = makeCompositeIdFromCidAndQuestion(ipfsCid, current.id);
      const input = instance.createEncryptedInput(contract.target as string, userAddr);
      input.add32(10); // 每题 +10
      const enc = await input.encrypt();
      await (await contract.verifyAnswer(compositeId, ansHash, enc.handles[0], enc.inputProof)).wait();

      // 移除本地分数预览（分数仅通过解密展示）

      if (index + 1 >= quiz.length) {
        setFinished(true);
      } else {
        setIndex((i) => i + 1);
      }
    } catch (e: any) {
      setError("提交失败: " + (e?.message || e));
    }
  }, [contract, instance, address, signer, current, index, quiz.length]);

  const decryptScore = useCallback(async () => {
    if (!contract || !instance || !address) return;
    try {
      const handle: string = await (contract as any).getEncryptedScore();
      const relayer: any = instance;
      const { publicKey, privateKey } = relayer.generateKeypair();
      const startTs = Math.floor(Date.now() / 1000);
      const durationDays = 365;
      const eip712 = relayer.createEIP712(
        publicKey,
        [contract.target as string],
        startTs,
        durationDays
      );
      const signature = await (signer as JsonRpcSigner).signTypedData(
        eip712.domain,
        { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
        eip712.message
      );
      const res = await relayer.userDecrypt(
        [{ handle, contractAddress: contract.target as string }],
        privateKey,
        publicKey,
        signature,
        [contract.target as string],
        address,
        startTs,
        durationDays
      );
      setScoreClear(String(res[handle]));
    } catch (e: any) {
      setError("Decrypt failed: " + e?.message);
    }
  }, [contract, instance, address, signer]);

  const claim = useCallback(async () => {
    if (!contract) return;
    try {
      await (await contract.claimNFT()).wait();
      setMessage("NFT claimed");
    } catch (e: any) {
      setError("Claim failed: " + e?.message);
    }
  }, [contract]);

  return {
    // web3
    provider, signer, address, chainId, instance,
    // quiz state
    quiz, current, index, finished, started, allQuestions,
    // score
    scoreClear,
    // loading
    loadingQuestions,
    // errors
    error, message,
    // actions
    start, answer, decryptScore, claim,
  } as const;
}


