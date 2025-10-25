import { task } from "hardhat/config";
import { keccak256, toUtf8Bytes } from "ethers";

task("seed", "Seed a few quizzes")
  .addParam("address", "QuizChain contract address")
  .setAction(async (args, hre) => {
    const [deployer] = await hre.ethers.getSigners();
    const quiz = await hre.ethers.getContractAt("QuizChain", args.address, deployer);

    const data = [
      { id: 1, ans: "Vitalik Buterin", points: 10 },
      { id: 2, ans: "Ethereum", points: 10 },
      { id: 3, ans: "Zama", points: 10 },
    ];

    for (const q of data) {
      const h = keccak256(toUtf8Bytes(q.ans));
      const tx = await quiz.setQuiz(q.id, h, q.points);
      await tx.wait();
      console.log(`seeded quizId=${q.id} hash=${h}`);
    }
  });




