"use client";

import { useEffect, useMemo, useState } from "react";
import { BrowserProvider, Contract, JsonRpcSigner } from "ethers";
import { QuizChainABI } from "../../abi/QuizChainABI";
import { QuizChainAddresses } from "../../abi/QuizChainAddresses";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function RankPage() {
  const router = useRouter();
  const [signer, setSigner] = useState<JsonRpcSigner | undefined>(undefined);
  const [chainId, setChainId] = useState<number | undefined>(undefined);
  const [rows, setRows] = useState<{ addr: string; score: bigint }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const w = (window as any).ethereum;
    if (!w) return;
    const bp = new BrowserProvider(w);
    bp.getSigner().then((s) => setSigner(s));
    w.request({ method: "eth_chainId" }).then((h: string) => setChainId(parseInt(h, 16)));
  }, []);

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

  const refresh = async () => {
    if (!contract) return;
    setLoading(true);
    try {
      // 读取玩家列表（最多50）
      const addrs: string[] = await contract.getPlayers(0, 50);
      const latest = await contract.runner!.provider!.getBlockNumber();
      const fromBlock = Math.max(0, latest - 200000);

      // 读取全部 AnswerVerified 事件并归并统计正确次数（默认每题10分）
      const logs = await contract.queryFilter(contract.filters.AnswerVerified(), fromBlock, latest);
      const scoreMap = new Map<string, bigint>();
      for (const a of addrs) scoreMap.set(a.toLowerCase(), 0n);
      for (const l of logs) {
        const args: any = (l as any).args;
        if (!args) continue;
        const user: string = args[0] as string;
        const correct: boolean = args[2] as boolean;
        const key = user.toLowerCase();
        if (!scoreMap.has(key)) continue;
        if (correct) scoreMap.set(key, (scoreMap.get(key) ?? 0n) + 10n);
      }

      const out: { addr: string; score: bigint }[] = addrs.map((a) => ({
        addr: a,
        score: scoreMap.get(a.toLowerCase()) ?? 0n,
      }));

      out.sort((a, b) => (a.score < b.score ? 1 : -1));
      setRows(out);
    } catch (error) {
      console.error("Failed to refresh leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contract) {
      refresh();
    }
  }, [contract]);

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `${rank}.`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "linear-gradient(135deg, #FFD700, #FFA500)";
    if (rank === 2) return "linear-gradient(135deg, #C0C0C0, #808080)";
    if (rank === 3) return "linear-gradient(135deg, #CD7F32, #8B4513)";
    return "rgba(255, 255, 255, 0.05)";
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center p-4"
      style={{ paddingTop: 60, paddingBottom: 60 }}
    >
      {/* 标题 */}
      <motion.h1 
        className="neon-text" 
        style={{ fontSize: 56, marginBottom: 16, textAlign: "center" }}
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        🏆 排行榜
      </motion.h1>
      <p style={{ fontSize: 18, color: "#bbb", marginBottom: 40, textAlign: "center" }}>
        Top 50 最强大脑 · 实时更新
      </p>

      {/* 刷新按钮 */}
      <motion.button 
        className="neon-button" 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={refresh} 
        disabled={!contract || loading}
        style={{ padding: "14px 32px", fontSize: 18, marginBottom: 32 }}
      >
        {loading ? "刷新中..." : "🔄 刷新排行榜"}
      </motion.button>

      {/* 排行榜卡片 */}
      <div className="card" style={{ maxWidth: 900, width: "100%", padding: 32 }}>
        {rows.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "#888" }}>
            <p style={{ fontSize: 24, marginBottom: 12 }}>🤷‍♂️ 暂无排行数据</p>
            <p style={{ fontSize: 16 }}>成为第一个完成答题的玩家吧！</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {rows.map((r, i) => {
              const rank = i + 1;
              const isTopThree = rank <= 3;
              
              return (
                <motion.div
                  key={r.addr}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  style={{
                    background: getRankColor(rank),
                    backdropFilter: "blur(10px)",
                    border: isTopThree ? "2px solid #00E0FF" : "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: 12,
                    padding: "20px 24px",
                    display: "grid",
                    gridTemplateColumns: "80px 1fr auto",
                    alignItems: "center",
                    gap: 20,
                    boxShadow: isTopThree ? "0 0 30px rgba(0, 224, 255, 0.3)" : "none",
                    transition: "all 0.3s ease",
                  }}
                  whileHover={{ scale: 1.02, x: 10 }}
                >
                  {/* 排名 */}
                  <div style={{ fontSize: isTopThree ? 36 : 28, fontWeight: 900, textAlign: "center" }}>
                    {getMedalEmoji(rank)}
                  </div>

                  {/* 地址 */}
                  <div style={{ fontFamily: "monospace", fontSize: 18, color: isTopThree ? "#fff" : "#ccc" }}>
                    {r.addr.slice(0, 10)}...{r.addr.slice(-8)}
                  </div>

                  {/* 分数 */}
                  <div 
                    className="neon-text" 
                    style={{ 
                      fontSize: isTopThree ? 32 : 24, 
                      fontWeight: 900,
                      textAlign: "right",
                      minWidth: 100
                    }}
                  >
                    {r.score.toString()}
                    <span style={{ fontSize: 14, marginLeft: 6, color: "#888" }}>分</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* 返回按钮 */}
      <motion.button
        className="neon-button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push("/")}
        style={{ padding: "14px 32px", fontSize: 18, marginTop: 32 }}
      >
        ← 返回首页
      </motion.button>
    </motion.div>
  );
}


