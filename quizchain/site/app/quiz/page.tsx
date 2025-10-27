"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useQuizChain } from "../../hooks/useQuizChain";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function QuizPage() {
  const router = useRouter();
  const params = useSearchParams();
  const cid = params?.get("cid") ?? "";
  const qz = useQuizChain({ ipfsCid: cid, questionCount: 3 });
  
  const [timeLeft, setTimeLeft] = useState(120);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answerResult, setAnswerResult] = useState<"correct" | "wrong" | null>(null);

  // 计时器逻辑
  useEffect(() => {
    if (!qz.started || qz.finished) return;
    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, qz.started, qz.finished]);

  // 重置计时器
  useEffect(() => {
    setTimeLeft(120);
    setSelectedOption(null);
    setShowResult(false);
    setAnswerResult(null);
  }, [qz.index]);

  const handleTimeout = () => {
    qz.answer(0); // 超时默认选第一个选项
  };

  const handleAnswer = async (optionIndex: number) => {
    if (selectedOption !== null) return; // 防止重复点击
    setSelectedOption(optionIndex);
    
    // 模拟判断正确/错误（这里简化处理，实际根据合约返回）
    const isCorrect = qz.current?.answer === qz.current?.options[optionIndex];
    setAnswerResult(isCorrect ? "correct" : "wrong");
    setShowResult(true);

    // 延迟提交到合约，让用户看到结果动画
    setTimeout(async () => {
      await qz.answer(optionIndex);
      setShowResult(false);
    }, 1500);
  };

  const progressPercent = qz.quiz.length > 0 ? ((qz.index + 1) / qz.quiz.length) * 100 : 0;

  // 缺少 CID 提示
  if (!cid) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        width: "100%", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        padding: "20px"
      }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card" 
          style={{ maxWidth: 600, width: "100%", textAlign: "center", padding: 40 }}
        >
          <h1 className="neon-text" style={{ fontSize: 36, marginBottom: 24 }}>⚠️ 缺少题库</h1>
          <p style={{ fontSize: 18, marginBottom: 32, color: "#aaa" }}>
            请从首页上传题库并获取 CID，或手动输入 CID 后开始答题。
          </p>
          <button className="neon-button" onClick={() => router.push("/")} style={{ padding: "16px 32px", fontSize: 18 }}>
            返回首页
          </button>
        </motion.div>
      </div>
    );
  }

  // 开始前界面
  if (!qz.started) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        width: "100%", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        padding: "20px"
      }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card" 
          style={{ maxWidth: 700, width: "100%", textAlign: "center", padding: 40 }}
        >
          <motion.h1 
            className="neon-text" 
            style={{ fontSize: 44, marginBottom: 20, textShadow: "0 0 10px #00E0FF, 0 0 18px #6759FF" }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            🎯 QuizChain 答题挑战
          </motion.h1>
            <p style={{ fontSize: 16, marginBottom: 8, color: "#9ecde0" }}>题库 CID: <span style={{ color: "#00E0FF" }}>{cid.slice(0, 12)}...</span></p>
          {(qz.allQuestions.length === 0) ? (
            <p style={{ fontSize: 18, marginBottom: 28, color: "#aaa" }}>正在从 IPFS 加载题目…</p>
          ) : (
            <p style={{ fontSize: 18, marginBottom: 28, color: "#9aa3b2" }}>题库共 {qz.allQuestions.length} 题 · 每次随机出 {Math.min(3, qz.allQuestions.length)} 题</p>
          )}
          {qz.error && <p style={{ color: "#ff6b6b", marginBottom: 16 }}>{qz.error}</p>}
          <motion.button 
            className="neon-button" 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={qz.start}
            disabled={!cid || qz.allQuestions.length === 0}
            style={{ padding: "18px 48px", fontSize: 22, fontWeight: 700 }}
          >
            {qz.allQuestions.length === 0 ? "加载中…" : "开始答题 🚀"}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // 答题完成界面
  if (qz.finished) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        width: "100%", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        padding: "20px"
      }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card" 
          style={{ maxWidth: 700, width: "100%", textAlign: "center", padding: 50 }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: 3, duration: 0.3 }}
          >
            <h1 className="neon-text" style={{ fontSize: 56, marginBottom: 24 }}>🎉 恭喜完成！</h1>
          </motion.div>
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 22, color: "#bbb", marginBottom: 12 }}>您的分数</p>
            <motion.div 
              className="neon-text"
              style={{ fontSize: 80, fontWeight: 900 }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              {qz.scoreClear ?? '-'}
            </motion.div>
            <p style={{ fontSize: 18, color: "#888", marginTop: 12 }}>总分: {qz.quiz.length * 10}</p>
            <div style={{ marginTop: 20 }}>
              <button 
                className="neon-button" 
                onClick={qz.decryptScore}
                style={{ padding: "12px 28px", fontSize: 16 }}
              >
                解密并查看分数 🔐
              </button>
            </div>
          </div>

          {qz.scoreClear && qz.scoreClear >= 100 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p style={{ fontSize: 20, color: "#00E0FF", marginBottom: 20 }}>✨ 达到领取 NFT 条件！</p>
              <button 
                className="neon-button" 
                onClick={qz.claim}
                style={{ padding: "18px 48px", fontSize: 22, marginBottom: 16 }}
              >
                领取 NFT 🏆
              </button>
            </motion.div>
          )}

          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 24 }}>
            <button className="neon-button" onClick={() => router.push("/")} style={{ padding: "14px 28px" }}>
              返回首页
            </button>
            <button className="neon-button" onClick={() => router.push("/rank")} style={{ padding: "14px 28px" }}>
              查看排行榜
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // 答题进行中
  return (
    <div style={{ 
      minHeight: "100vh", 
      width: "100%", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      padding: "20px",
      position: "relative"
    }}>
      {/* 顶部进度条 */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 6, background: "rgba(255,255,255,0.1)", zIndex: 100 }}>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ height: "100%", background: "linear-gradient(90deg, #6759FF, #00E0FF)", borderRadius: 3, width: `${progressPercent}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card" 
        style={{ maxWidth: 900, width: "100%", padding: 40 }}
      >
        {qz.error && (
          <div style={{ marginBottom: 16, color: "#ff6b6b", fontSize: 14 }}>
            {qz.error}
          </div>
        )}
        {/* 题目头部 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <span style={{ fontSize: 18, color: "#bbb" }}>题目 </span>
            <span className="neon-text" style={{ fontSize: 28, fontWeight: 700 }}>{qz.index + 1}</span>
            <span style={{ fontSize: 18, color: "#bbb" }}> / {qz.quiz.length}</span>
          </div>
          <motion.div 
            style={{ 
              fontSize: 32, 
              fontWeight: 900, 
              color: timeLeft <= 10 ? "#ff6b6b" : "#00E0FF",
              textShadow: timeLeft <= 10 ? "0 0 20px #ff6b6b" : "0 0 20px #00E0FF"
            }}
            animate={timeLeft <= 10 ? { scale: [1, 1.1, 1] } : {}}
            transition={{ repeat: timeLeft <= 10 ? Infinity : 0, duration: 0.5 }}
          >
            ⏱️ {timeLeft}s
          </motion.div>
        </div>

        {/* 题目内容 */}
        <AnimatePresence mode="wait">
          {qz.current && (
            <motion.div
              key={qz.index}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 style={{ fontSize: 28, marginBottom: 40, lineHeight: 1.6, color: "#fff" }}>
                {qz.current.question}
              </h2>

              {/* 选项列表 */}
              <div style={{ display: "grid", gap: 20 }}>
                {qz.current.options.map((option, i) => {
                  const isSelected = selectedOption === i;
                  const showCorrect = showResult && answerResult === "correct" && isSelected;
                  const showWrong = showResult && answerResult === "wrong" && isSelected;

                  return (
                    <motion.button
                      key={i}
                      className="neon-button"
                      whileHover={selectedOption === null ? { scale: 1.02, x: 10 } : {}}
                      whileTap={selectedOption === null ? { scale: 0.98 } : {}}
                      onClick={() => handleAnswer(i)}
                      disabled={selectedOption !== null}
                      style={{
                        padding: "20px 28px",
                        fontSize: 20,
                        textAlign: "left",
                        position: "relative",
                        overflow: "hidden",
                        background: showCorrect 
                          ? "linear-gradient(135deg, #00E676, #00C853)" 
                          : showWrong 
                          ? "linear-gradient(135deg, #ff6b6b, #ee5a6f)" 
                          : isSelected
                          ? "linear-gradient(135deg, #4A90E2, #357ABD)"
                          : "linear-gradient(135deg, #6759FF, #8B7FFF)",
                        border: isSelected ? "2px solid #fff" : "2px solid #00E0FF",
                        cursor: selectedOption !== null ? "not-allowed" : "pointer",
                        opacity: selectedOption !== null && !isSelected ? 0.4 : 1,
                      }}
                      animate={showCorrect || showWrong ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      <span style={{ marginRight: 12, fontSize: 22, fontWeight: 700 }}>
                        {String.fromCharCode(65 + i)}.
                      </span>
                      {option}
                      {showCorrect && <span style={{ marginLeft: 12 }}>✅</span>}
                      {showWrong && <span style={{ marginLeft: 12 }}>❌</span>}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 底部分数 */}
        <div style={{ marginTop: 40, textAlign: "center", fontSize: 18, color: "#bbb" }}>
          当前分数: <span className="neon-text" style={{ fontSize: 24, fontWeight: 700 }}>{qz.scoreClear ?? '-'}</span>
        </div>
      </motion.div>
    </div>
  );
}


