"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BrowserProvider, Contract, JsonRpcSigner, ethers } from "ethers";
import { QuizChainABI } from "../../abi/QuizChainABI";
import { QuizChainAddresses } from "../../abi/QuizChainAddresses";
import { createFhevmInstance } from "../../fhevm/internal/fhevm";
import { splitCompositeId, shortHex } from "../../hooks/quizBank";

type MyRecord = {
  quizId: bigint;
  correct: boolean;
  txHash: string;
  blockNumber: number;
  timestamp?: number;
};

export default function RecordsPage() {
  const [signer, setSigner] = useState<JsonRpcSigner | undefined>(undefined);
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [chainId, setChainId] = useState<number | undefined>(undefined);
  const [instance, setInstance] = useState<any>(undefined);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<MyRecord[]>([]);
  const [scoreHandle, setScoreHandle] = useState<string | undefined>(undefined);
  const [scoreClear, setScoreClear] = useState<string | undefined>(undefined);
  const [message, setMessage] = useState<string>("");
  const [revealed, setRevealed] = useState<boolean>(false);

  useEffect(() => {
    const w = (window as any).ethereum;
    if (!w) return;
    const bp = new BrowserProvider(w);
    bp.getSigner().then(async (s) => {
      setSigner(s);
      setAddress(await s.getAddress());
    });
    w.request({ method: "eth_chainId" }).then((h: string) => setChainId(parseInt(h, 16)));
  }, []);

  useEffect(() => {
    if (!chainId) return;
    const w = (window as any).ethereum;
    if (!w) return;
    createFhevmInstance({ provider: w, mockChains: { 31337: "http://localhost:8545" } })
      .then((i) => setInstance(i))
      .catch((e) => setMessage("Init FHEVM failed: " + e?.message));
  }, [chainId]);

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

  const refreshRecords = useCallback(async () => {
    if (!contract || !address) return;
    setLoading(true);
    try {
      const filter = (contract as any).filters.AnswerVerified(address);
      const latest = await contract.runner!.provider!.getBlockNumber();
      const fromBlock = Math.max(0, latest - 200000); // 最近约20万块
      const logs = await contract.queryFilter(filter, fromBlock, latest);
      const items: MyRecord[] = logs.map((l: any) => ({
        quizId: l.args[1] as bigint,
        correct: Boolean(l.args[2]),
        txHash: l.transactionHash,
        blockNumber: l.blockNumber,
      }));
      // 附带区块时间
      const provider = contract.runner!.provider!;
      for (const it of items) {
        const b = await provider.getBlock(it.blockNumber);
        it.timestamp = Number(b?.timestamp ?? 0);
      }
      items.sort((a, b) => b.blockNumber - a.blockNumber);
      setRows(items);
    } catch (e: any) {
      setMessage("读取事件失败: " + e?.message);
    } finally {
      setLoading(false);
    }
  }, [contract, address]);

  const loadScoreHandle = useCallback(async () => {
    if (!contract) return;
    try {
      const h: string = await (contract as any).getEncryptedScore();
      setScoreHandle(h);
    } catch (e: any) {
      setMessage("读取加密分数失败: " + e?.message);
    }
  }, [contract]);

  const decryptScore = useCallback(async () => {
    if (!instance || !signer || !contractInfo?.address || !scoreHandle) return;
    try {
      setMessage("正在发起解密签名...");
      const userAddress = await signer.getAddress();
      const relayer: any = instance;
      const { publicKey, privateKey } = relayer.generateKeypair();
      const startTs = Math.floor(Date.now() / 1000);
      const durationDays = 365;
      const eip712 = relayer.createEIP712(
        publicKey,
        [contractInfo.address],
        startTs,
        durationDays
      );
      const signature = await signer.signTypedData(
        eip712.domain,
        { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
        eip712.message
      );
      setMessage("调用 Relayer 解密中...");
      const res = await relayer.userDecrypt(
        [{ handle: scoreHandle, contractAddress: contractInfo.address }],
        privateKey,
        publicKey,
        signature,
        [contractInfo.address],
        userAddress,
        startTs,
        durationDays
      );
      const v = res[scoreHandle];
      setScoreClear(String(v));
      setMessage("解密成功");
      setRevealed(true);
    } catch (e: any) {
      setMessage("解密失败: " + e?.message);
    }
  }, [instance, signer, contractInfo, scoreHandle]);

  useEffect(() => {
    if (contract) {
      refreshRecords();
      loadScoreHandle();
    }
  }, [contract, refreshRecords, loadScoreHandle]);

  const fmtTime = (ts?: number) =>
    ts ? new Date(ts * 1000).toLocaleString() : "-";

  return (
    <div style={{ minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gap: 20 }}>
        <h1 className="neon-text" style={{ fontSize: 44, textAlign: "center" }}>📘 我的答题记录</h1>

        {/* 顶部信息 */}
        <div className="card" style={{ display: "grid", gap: 10 }}>
          <div>
            <span style={{ opacity: 0.7 }}>钱包地址: </span>
            <span style={{ fontFamily: "monospace", color: "#00E0FF" }}>{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "未连接"}</span>
          </div>
          <div>
            <span style={{ opacity: 0.7 }}>网络: </span>
            <span style={{ color: "#00E0FF" }}>{chainId === 11155111 ? "Sepolia" : chainId === 31337 ? "Localhost" : chainId}</span>
          </div>
          <div>
            <span style={{ opacity: 0.7 }}>合约地址: </span>
            <span style={{ fontFamily: "monospace", color: "#00E0FF" }}>{contractInfo?.address || "未部署"}</span>
          </div>
        </div>

        {/* 分数解密 */}
        <div className="card" style={{ display: "grid", gap: 12 }}>
          <h2 style={{ fontSize: 20, color: "#00E0FF" }}>🔐 我的分数</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="neon-text" style={{ fontSize: 40, fontWeight: 900 }}>{scoreClear ?? "-"}</div>
            <div style={{ color: "#888" }}>（密文句柄: {scoreHandle ? `${scoreHandle.slice(0, 10)}...` : "-"}）</div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button className="neon-button" onClick={loadScoreHandle} disabled={!contract}>刷新句柄</button>
            <button className="neon-button" onClick={decryptScore} disabled={!instance || !scoreHandle}>解密并查看分数</button>
          </div>
          {!revealed && (
            <div style={{ color: "#9aa3b2" }}>提示：未解密前，下面每题的正确/错误状态将被隐藏。</div>
          )}
        </div>

        {/* 事件列表（按题库分组） */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: 20, borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontSize: 20, color: "#00E0FF" }}>🧾 答题事件（按题库）</h2>
            <button className="neon-button" onClick={refreshRecords} disabled={!contract || loading}>{loading ? "刷新中..." : "刷新"}</button>
          </div>
          {rows.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#999" }}>暂无记录</div>
          ) : (
            <div style={{ display: "grid" }}>
              {(() => {
                // 汇总每个题库的分数与条目
                const bankMap = new Map<string, { bankId: bigint; score: number; items: MyRecord[] }>();
                for (const r of rows) {
                  const { bankId } = splitCompositeId(r.quizId);
                  const key = bankId.toString();
                  if (!bankMap.has(key)) bankMap.set(key, { bankId, score: 0, items: [] });
                  const entry = bankMap.get(key)!;
                  entry.items.push(r);
                  if (r.correct) entry.score += 10; // 与前端题目加分保持一致
                }
                const groups = Array.from(bankMap.values()).sort((a, b) => b.score - a.score);
                return groups.map((g, gi) => (
                  <div key={g.bankId.toString()} style={{ borderTop: gi === 0 ? "none" : "1px solid rgba(255,255,255,0.08)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px" }}>
                      <div>
                        <span style={{ opacity: 0.8 }}>题库</span> <span style={{ fontFamily: "monospace", color: "#00E0FF" }}>{shortHex(g.bankId)}</span>
                      </div>
                      <div className="neon-text" style={{ fontSize: 24, fontWeight: 900 }}>{revealed ? g.score : "🔒"}</div>
                    </div>
                    {g.items.map((r, i) => (
                      <div key={`${r.txHash}-${i}`} style={{ display: "grid", gridTemplateColumns: "160px 1fr 220px 220px", padding: "12px 20px", borderTop: "1px dashed rgba(255,255,255,0.06)" }}>
                        <div style={{ fontFamily: "monospace", color: "#bbb" }}>#{String(r.blockNumber)}</div>
                        {(() => {
                          const { questionId } = splitCompositeId(r.quizId);
                          return (
                            <div>
                              题目ID: <span className="neon-text" style={{ fontWeight: 700 }}>{questionId}</span>
                            </div>
                          );
                        })()}
                        {revealed ? (
                          <div style={{ color: r.correct ? "#00E676" : "#ff6b6b", fontWeight: 700 }}>{r.correct ? "✅ 正确" : "❌ 错误"}</div>
                        ) : (
                          <div style={{ color: "#aaa", fontWeight: 700 }}>🔒 加密</div>
                        )}
                        <div style={{ color: "#aaa" }}>{fmtTime(r.timestamp)}</div>
                      </div>
                    ))}
                  </div>
                ));
              })()}
            </div>
          )}
        </div>

        {message && (
          <div className="card" style={{ background: "rgba(0, 224, 255, 0.08)" }}>{message}</div>
        )}
      </div>
    </div>
  );
}


