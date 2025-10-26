"use client";

import { useEffect, useMemo, useState } from "react";
import { BrowserProvider, Contract, JsonRpcSigner, ethers, keccak256, toUtf8Bytes } from "ethers";
import { createFhevmInstance } from "../fhevm/internal/fhevm";
import { QuizChainABI } from "../abi/QuizChainABI";
import { QuizChainAddresses } from "../abi/QuizChainAddresses";
import Link from "next/link";
import { makeCompositeIdFromCidAndQuestion } from "../hooks/quizBank";
import { deriveBankIdFromCid, shortHex } from "../hooks/quizBank";

export default function HomePage() {
  const [provider, setProvider] = useState<ethers.Eip1193Provider | string | undefined>(undefined);
  const [signer, setSigner] = useState<JsonRpcSigner | undefined>(undefined);
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [chainId, setChainId] = useState<number | undefined>(undefined);
  const [instance, setInstance] = useState<any>(undefined);
  const [fhevmStatus, setFhevmStatus] = useState<string>("未初始化");
  const [message, setMessage] = useState<string>("");
  
  // 题库上传相关
  const [quizFile, setQuizFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedCID, setUploadedCID] = useState<string>("");
  const [uploadStep, setUploadStep] = useState<"idle" | "pinning" | "writing" | "done" | "error">("idle");
  const [cidManual, setCidManual] = useState<string>("");

  useEffect(() => {
    const w = (window as any).ethereum;
    if (!w) return;
    setProvider(w);
    const bp = new BrowserProvider(w);
    bp.getSigner().then((s) => setSigner(s));
    w.request({ method: "eth_chainId" }).then((h: string) => setChainId(parseInt(h, 16)));
    w.request({ method: "eth_requestAccounts" }).then(async (accounts: string[]) => {
      setAddress(accounts?.[0]);
    });
  }, []);

  useEffect(() => {
    if (!provider || !chainId) return;
    setFhevmStatus("加载中...");
    createFhevmInstance({ provider, mockChains: { 31337: "http://localhost:8545" } })
      .then((i) => {
        setInstance(i);
        setFhevmStatus("✓ 已就绪");
      })
      .catch((e) => {
        setFhevmStatus("✗ 失败: " + e.message);
      });
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setQuizFile(e.target.files[0]);
    }
  };

  const uploadToPinata = async () => {
    if (!quizFile) return;
    setUploading(true);
    setUploadStep("pinning");
    setMessage("正在上传到 Pinata...");
    try {
      const text = await quizFile.text();
      const json = JSON.parse(text);
      
      const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIxNTdkZjg5OS0wZjNhLTQxYTUtOTEyMi02YTAxNGM1ZDVjNmQiLCJlbWFpbCI6InN1bmpmNjI2QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI0M2U5N2ZmMDI1YmUzY2Q3NzJiMiIsInNjb3BlZEtleVNlY3JldCI6IjlhMTViY2I2ZmZkZjE4YWVlZDUwM2I5Zjk1ZTMzZDIyOTBjYTI2YmM2MzU3NWI2ODM1ODkyMGRjNzZiMjZmYTciLCJleHAiOjE3OTE1OTQwNzB9.bLafx4ZoPiKe8Yew08DlqFHhNW7Aaz74dLCoOxc_264`,
        },
        body: JSON.stringify({ pinataContent: json, pinataMetadata: { name: "quizchain-quiz" } }),
      });
      const data = await res.json();
      setUploadedCID(data.IpfsHash);
      setMessage(`✓ 上传成功！CID: ${data.IpfsHash}`);
      
      // 批量写入合约（一次交易）
      if (contract) {
        setUploadStep("writing");
        setMessage("正在写入链上题库（批量）...");
        // 使用 复合ID(题库CID+题目id)，与答题时的复合ID保持一致
        const ids = json.map((q: any) => makeCompositeIdFromCidAndQuestion(data.IpfsHash, q.id));
        const hashes = json.map((q: any) => keccak256(toUtf8Bytes(q.answer || q.options[0])));
        const points = json.map(() => 10);
        await (await contract.setQuizzes(ids, hashes, points)).wait();
        setMessage("✓ 题库已上链！");
        setUploadStep("done");
      } else {
        setUploadStep("done");
        setMessage((m) => m + " （未检测到合约实例，已跳过写链）");
      }
    } catch (e: any) {
      setUploadStep("error");
      setMessage("✗ 上传失败: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  const connectWallet = async () => {
    const w = (window as any).ethereum;
    if (!w) {
      alert("请先安装 MetaMask");
      return;
    }
    await w.request({ method: "eth_requestAccounts" });
  };

  return (
    <div style={{ minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Logo + 标题 */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 className="neon-text" style={{ fontSize: 56, fontWeight: 900, marginBottom: 16 }}>
            QuizChain
          </h1>
          <p style={{ fontSize: 18, color: "#00E0FF" }}>链上答题赢 NFT · FHEVM 加密隐私保护</p>
        </div>

        {/* 钱包连接 */}
        {!address && (
          <div className="card" style={{ textAlign: "center", marginBottom: 32 }}>
            <button onClick={connectWallet} className="neon-button" style={{ fontSize: 20, padding: "16px 48px" }}>
              连接 MetaMask
            </button>
          </div>
        )}

        {address && (
          <>
            {/* 用户信息卡片 */}
            <div className="card" style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 24, marginBottom: 16, color: "#00E0FF" }}>用户信息</h2>
              <div style={{ display: "grid", gap: 12 }}>
                <div>
                  <span style={{ opacity: 0.7 }}>钱包地址: </span>
                  <span style={{ fontFamily: "monospace", color: "#00E0FF" }}>{address.slice(0, 6)}...{address.slice(-4)}</span>
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
            </div>

            {/* FHEVM 状态面板 */}
            <div className="card" style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 24, marginBottom: 16, color: "#00E0FF" }}>FHEVM 状态</h2>
              <div style={{ display: "grid", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div className={fhevmStatus.includes("就绪") ? "pulse" : ""} style={{
                    width: 12, height: 12, borderRadius: "50%",
                    background: fhevmStatus.includes("就绪") ? "#00E0FF" : fhevmStatus.includes("失败") ? "#FF4444" : "#FFA500",
                    boxShadow: fhevmStatus.includes("就绪") ? "0 0 10px #00E0FF" : ""
                  }} />
                  <span>{fhevmStatus}</span>
                </div>
                <div>
                  <span style={{ opacity: 0.7 }}>实例类型: </span>
                  <span>{chainId === 31337 ? "Mock (本地)" : "Relayer SDK (Sepolia)"}</span>
                </div>
                <div>
                  <span style={{ opacity: 0.7 }}>SDK 版本: </span>
                  <span>0.2.0</span>
                </div>
              </div>
            </div>

            {/* 题库上传 */}
            <div className="card" style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 24, marginBottom: 16, color: "#00E0FF" }}>📤 上传题库</h2>
              <div style={{ display: "grid", gap: 16 }}>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  style={{
                    padding: 12, borderRadius: 8, border: "1px solid rgba(0, 224, 255, 0.3)",
                    background: "rgba(255,255,255,0.05)", color: "#fff"
                  }}
                />
                <button
                  onClick={uploadToPinata}
                  disabled={!quizFile || uploading}
                  className="neon-button"
                  style={{ width: "100%" }}
                >
                  {uploadStep === "idle" && "上传到 IPFS 并写入链上"}
                  {uploadStep === "pinning" && "正在上传到 IPFS..."}
                  {uploadStep === "writing" && "正在写入链上..."}
                  {uploadStep === "done" && "✓ 已完成（可重复上传覆盖）"}
                  {uploadStep === "error" && "✗ 失败，重试"}
                </button>
                {uploadedCID && (
                  <div style={{ padding: 12, background: "rgba(0, 224, 255, 0.1)", borderRadius: 8 }}>
                    <div style={{ marginBottom: 8 }}>CID: <span style={{ fontFamily: "monospace", color: "#00E0FF" }}>{uploadedCID}</span></div>
                    <div style={{ fontSize: 14, opacity: 0.8 }}>题库ID: <span style={{ fontFamily: "monospace" }}>{shortHex(deriveBankIdFromCid(uploadedCID))}</span></div>
                    <div style={{ fontSize: 14, opacity: 0.8 }}>请将此 CID 填入答题页使用</div>
                  </div>
                )}
              </div>
            </div>

            {/* 操作按钮 */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
              <Link href={uploadedCID ? `/quiz?cid=${uploadedCID}` : "/quiz"} style={{ textDecoration: "none" }}>
                <button className="neon-button" style={{ width: "100%", padding: 20 }} disabled={!uploadedCID}>
                  🎯 开始答题
                </button>
              </Link>
              <Link href="/records" style={{ textDecoration: "none" }}>
                <button className="neon-button" style={{ width: "100%", padding: 20 }}>
                  📘 我的答题记录
                </button>
              </Link>
              <Link href="/rank" style={{ textDecoration: "none" }}>
                <button className="neon-button" style={{ width: "100%", padding: 20 }}>
                  🏆 排行榜
                </button>
              </Link>
            </div>

            {/* 手动输入 CID 开始答题 */}
            <div className="card" style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 18, marginBottom: 12, color: "#00E0FF" }}>或手动粘贴 CID</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: 12 }}>
                <input
                  placeholder="粘贴刚上传或已有的题库 CID"
                  value={cidManual}
                  onChange={(e) => setCidManual(e.target.value.trim())}
                  style={{ padding: 12, borderRadius: 8, border: "1px solid rgba(0, 224, 255, 0.3)", background: "rgba(255,255,255,0.05)", color: "#fff" }}
                />
                <Link href={cidManual ? `/quiz?cid=${cidManual}` : "#"} style={{ textDecoration: "none" }}>
                  <button className="neon-button" disabled={!cidManual} style={{ width: "100%" }}>使用此 CID 开始</button>
                </Link>
              </div>
            </div>

            {/* 状态消息 */}
            {message && (
              <div className="card" style={{ background: "rgba(0, 224, 255, 0.1)" }}>
                <p>{message}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
