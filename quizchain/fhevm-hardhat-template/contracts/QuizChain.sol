// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {FHE, euint32, euint64, ebool, externalEuint32, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/**
 * QuizChain: FHEVM 版本
 * - 题目正确答案仅以哈希存在链上（bytes32），防止直接明文泄露
 * - 分数在链上以 euint32 存储与运算，读取以密文句柄返回
 * - 领取 NFT 时，将题目数量、分数等数据写入事件（前端生成/绑定 Metadata 到 IPFS）
 */
contract QuizChain is SepoliaConfig, ERC721 {
    using Strings for uint256;

    struct QuizMeta {
        bytes32 answerHash; // 正确答案哈希（前端: keccak256(abi.encodePacked(choice)))
        uint32 points; // 该题分值（默认 10）
    }

    // 题库（按 quizId 存储）
    mapping(uint256 => QuizMeta) public quizzes;

    // 用户分数（加密存储）
    mapping(address => euint32) private _scores;

    // 参与过的玩家集合（用于简单排行榜展示；注意：链上遍历成本及可扩展性限制）
    address[] private _players;
    mapping(address => bool) private _isPlayer;

    // 累计 NFT id
    uint256 public nextTokenId = 1;

    // 达标阈值
    uint32 public scoreThreshold = 100; // 默认阈值，可在部署后通过治理修改

    event QuizCompleted(address indexed user, uint256 score, uint256 timestamp);
    event AnswerVerified(address indexed user, uint256 indexed quizId, bool correct);
    event NFTClaimed(address indexed user, uint256 tokenId, uint256 timestamp);

    constructor() ERC721("QuizChainNFT", "QUIZ") {}

    // 管理员/题库创建者：上链题库答案哈希
    function setQuiz(uint256 quizId, bytes32 answerHash, uint32 points) external {
        require(answerHash != bytes32(0), "invalid hash");
        quizzes[quizId] = QuizMeta({ answerHash: answerHash, points: points });
    }

    // 批量写入：一次交易写入多题，减少多次签名弹窗
    function setQuizzes(
        uint256[] calldata quizIds,
        bytes32[] calldata answerHashes,
        uint32[] calldata points
    ) external {
        uint256 n = quizIds.length;
        require(n == answerHashes.length && n == points.length, "length mismatch");
        for (uint256 i = 0; i < n; i++) {
            require(answerHashes[i] != bytes32(0), "invalid hash");
            quizzes[quizIds[i]] = QuizMeta({ answerHash: answerHashes[i], points: points[i] });
        }
    }

    // 前端将选项字符串或编号做 keccak256 ，并传入该哈希（作为 externalEuint64 或 externalEuint32 的场景不合适）
    // 因此这里直接接受 bytes32；但仍演示 FHE 输入：本函数顺带允许把做对题的分值以密文传入做叠加，避免明文分值侧漏
    function verifyAnswer(
        uint256 quizId,
        bytes32 answerHash,
        externalEuint32 encryptedPoints,
        bytes calldata inputProof
    ) external {
        QuizMeta memory q = quizzes[quizId];
        require(q.answerHash != bytes32(0), "quiz not found");

        bool correct = (answerHash == q.answerHash);
        emit AnswerVerified(msg.sender, quizId, correct);

        if (!correct) {
            return;
        }

        // FHE: 从外部密文导入分值并叠加（若前端愿意隐藏分值）
        euint32 points = FHE.fromExternal(encryptedPoints, inputProof);

        // 使用 FHE.select 在密文域内选择加分值（0 → 使用题库默认分值）
        euint32 addend = FHE.select(
            FHE.eq(points, FHE.asEuint32(0)),
            FHE.asEuint32(q.points),
            points
        );
        _scores[msg.sender] = FHE.add(_scores[msg.sender], addend);

        // ACL：允许合约与用户访问
        FHE.allowThis(_scores[msg.sender]);
        FHE.allow(_scores[msg.sender], msg.sender);

        // 记录玩家
        if (!_isPlayer[msg.sender]) {
            _isPlayer[msg.sender] = true;
            _players.push(msg.sender);
        }
    }

    // 获取当前加密分数（返回句柄）
    function getEncryptedScore() external view returns (euint32) {
        return _scores[msg.sender];
    }

    // 提醒：公开解密请在前端使用 Relayer SDK 完成（此处不暴露解密接口）

    // 返回玩家地址分页（用于前端分页加载榜单）
    function getPlayers(uint256 offset, uint256 limit) external view returns (address[] memory) {
        uint256 n = _players.length;
        if (offset >= n) return new address[](0);
        uint256 end = offset + limit;
        if (end > n) end = n;
        uint256 len = end - offset;
        address[] memory out = new address[](len);
        for (uint256 i = 0; i < len; i++) {
            out[i] = _players[offset + i];
        }
        return out;
    }

    // 领取 NFT（示例：演示铸造流程；阈值校验建议放在链下通过零知识证明/Relayer网关完成）
    function claimNFT() external {
        uint256 tokenId = nextTokenId++;
        _safeMint(msg.sender, tokenId);
        emit NFTClaimed(msg.sender, tokenId, block.timestamp);
        emit QuizCompleted(msg.sender, 0, block.timestamp);
    }

    // 可选：设置分数阈值
    function setScoreThreshold(uint32 threshold) external {
        scoreThreshold = threshold;
    }
}


