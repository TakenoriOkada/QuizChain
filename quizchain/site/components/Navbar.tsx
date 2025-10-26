"use client";

import { useEffect, useMemo, useState } from "react";

export default function Navbar() {
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [chainId, setChainId] = useState<number | undefined>(undefined);
  const [connecting, setConnecting] = useState(false);
  const w = typeof window !== "undefined" ? (window as any).ethereum : undefined;

  useEffect(() => {
    if (!w) return;
    w.request({ method: "eth_accounts" }).then((accounts: string[]) => {
      setAddress(accounts?.[0]);
    });
    w.request({ method: "eth_chainId" }).then((h: string) => setChainId(parseInt(h, 16)));
    const onAcc = (accs: string[]) => setAddress(accs?.[0]);
    const onChain = (h: string) => setChainId(parseInt(h, 16));
    w.on?.("accountsChanged", onAcc);
    w.on?.("chainChanged", onChain);
    return () => {
      w.removeListener?.("accountsChanged", onAcc);
      w.removeListener?.("chainChanged", onChain);
    };
  }, [w]);

  const isSepolia = chainId === 11155111;
  const shortAddr = useMemo(() => (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""), [address]);

  const connect = async () => {
    if (!w) {
      alert("请先安装 MetaMask");
      return;
    }
    setConnecting(true);
    try {
      const accounts: string[] = await w.request({ method: "eth_requestAccounts" });
      setAddress(accounts?.[0]);
    } finally {
      setConnecting(false);
    }
  };

  const switchToSepolia = async () => {
    if (!w) return;
    try {
      await w.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0xaa36a7" }] });
    } catch (e: any) {
      // 如果未添加网络，提示用户手动添加
      alert("请在钱包中切换到 Sepolia 网络再试。");
    }
  };

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(8px)", background: "rgba(0,0,0,0.25)", borderBottom: "1px solid rgba(0,224,255,0.2)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className="neon-text" style={{ fontWeight: 900 }}>QuizChain</div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {address ? (
            <>
              <span style={{ fontFamily: "monospace", color: "#00E0FF" }}>{shortAddr}</span>
              <span style={{ color: isSepolia ? "#7ee787" : "#ff6b6b" }}>{isSepolia ? "Sepolia" : `Chain ${chainId}`}</span>
              {!isSepolia && (
                <button className="neon-button" onClick={switchToSepolia} style={{ padding: "8px 12px" }}>切到 Sepolia</button>
              )}
            </>
          ) : (
            <button className="neon-button" onClick={connect} disabled={connecting} style={{ padding: "8px 12px" }}>
              {connecting ? "连接中…" : "连接钱包"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}




