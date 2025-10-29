(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/fhevm/internal/fhevm.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createFhevmInstance",
    ()=>createFhevmInstance,
    "initSDK",
    ()=>initSDK,
    "loadSDK",
    ()=>loadSDK
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$providers$2f$provider$2d$jsonrpc$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/ethers/lib.esm/providers/provider-jsonrpc.js [app-client] (ecmascript)");
;
const SDK_CDN_URL = "https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.umd.cjs";
function isFhevmWindowType(w) {
    return typeof w !== "undefined" && w.relayerSDK;
}
const loadSDK = ()=>new Promise((resolve, reject)=>{
        if (isFhevmWindowType(window) && window.relayerSDK) {
            resolve();
            return;
        }
        const s = document.createElement("script");
        s.src = SDK_CDN_URL;
        s.type = "text/javascript";
        s.async = true;
        s.onload = ()=>resolve();
        s.onerror = ()=>reject(new Error("Failed to load Relayer SDK"));
        document.head.appendChild(s);
    });
const initSDK = async ()=>{
    if (!isFhevmWindowType(window)) throw new Error("window.relayerSDK missing");
    if (window.relayerSDK.__initialized__) return;
    const ok = await window.relayerSDK.initSDK();
    if (!ok) throw new Error("initSDK failed");
    window.relayerSDK.__initialized__ = true;
};
async function getChainId(providerOrUrl) {
    if (typeof providerOrUrl === "string") {
        const p = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$providers$2f$provider$2d$jsonrpc$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JsonRpcProvider"](providerOrUrl);
        return Number((await p.getNetwork()).chainId);
    }
    const hex = await providerOrUrl.request({
        method: "eth_chainId"
    });
    return Number.parseInt(hex, 16);
}
async function getWeb3Client(rpcUrl) {
    const rpc = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$providers$2f$provider$2d$jsonrpc$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JsonRpcProvider"](rpcUrl);
    const v = await rpc.send("web3_clientVersion", []);
    await rpc.destroy();
    return String(v);
}
async function tryFetchFHEVMHardhatNodeRelayerMetadata(rpcUrl) {
    const version = await getWeb3Client(rpcUrl);
    if (!version.toLowerCase().includes("hardhat")) return undefined;
    const rpc = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$providers$2f$provider$2d$jsonrpc$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JsonRpcProvider"](rpcUrl);
    try {
        const meta = await rpc.send("fhevm_relayer_metadata", []);
        return meta;
    } finally{
        await rpc.destroy();
    }
}
async function resolve(providerOrUrl, mockChains) {
    const chainId = await getChainId(providerOrUrl);
    let rpcUrl = typeof providerOrUrl === "string" ? providerOrUrl : undefined;
    const defaults = {
        31337: "http://localhost:8545",
        ...mockChains !== null && mockChains !== void 0 ? mockChains : {}
    };
    if (Object.hasOwn(defaults, chainId)) {
        if (!rpcUrl) rpcUrl = defaults[chainId];
        return {
            isMock: true,
            chainId,
            rpcUrl: rpcUrl
        };
    }
    return {
        isMock: false,
        chainId,
        rpcUrl
    };
}
async function createFhevmInstance(parameters) {
    const { provider, mockChains } = parameters;
    const { isMock, rpcUrl } = await resolve(provider, mockChains);
    if (isMock) {
        const meta = await tryFetchFHEVMHardhatNodeRelayerMetadata(rpcUrl);
        if (meta) {
            const mod = await __turbopack_context__.A("[project]/fhevm/internal/mock/fhevmMock.ts [app-client] (ecmascript, async loader)");
            return mod.fhevmMockCreateInstance({
                rpcUrl: rpcUrl,
                chainId: 31337,
                metadata: meta
            });
        }
    }
    await loadSDK();
    await initSDK();
    const relayerSDK = window.relayerSDK;
    const cfg = relayerSDK.SepoliaConfig;
    const config = {
        ...cfg,
        network: provider
    };
    const instance = await relayerSDK.createInstance(config);
    return instance;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/hooks/quizBank.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "deriveBankIdFromCid",
    ()=>deriveBankIdFromCid,
    "makeCompositeId",
    ()=>makeCompositeId,
    "makeCompositeIdFromCidAndQuestion",
    ()=>makeCompositeIdFromCidAndQuestion,
    "shortHex",
    ()=>shortHex,
    "splitCompositeId",
    ()=>splitCompositeId
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$crypto$2f$keccak$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/ethers/lib.esm/crypto/keccak.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$utils$2f$utf8$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/ethers/lib.esm/utils/utf8.js [app-client] (ecmascript)");
;
const QUESTION_ID_BITS = 32n;
const QUESTION_ID_MASK = (1n << QUESTION_ID_BITS) - 1n;
const BANK_ID_BITS = 224n; // 256 - 32
const BANK_ID_MASK = (1n << BANK_ID_BITS) - 1n;
function deriveBankIdFromCid(cid) {
    const hex = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$crypto$2f$keccak$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["keccak256"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$utils$2f$utf8$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toUtf8Bytes"])(cid));
    // 只保留低 224 位，避免左移 32 位后溢出 uint256
    return BigInt(hex) & BANK_ID_MASK;
}
function makeCompositeId(bankId, questionId) {
    const bank224 = bankId & BANK_ID_MASK;
    return bank224 << QUESTION_ID_BITS | BigInt(questionId >>> 0);
}
function makeCompositeIdFromCidAndQuestion(cid, questionId) {
    const bank = deriveBankIdFromCid(cid);
    return makeCompositeId(bank, questionId);
}
function splitCompositeId(id) {
    const q = Number(id & QUESTION_ID_MASK);
    const b = id >> QUESTION_ID_BITS;
    return {
        bankId: b,
        questionId: q
    };
}
function shortHex(bi) {
    let len = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 8;
    const hex = bi.toString(16);
    const h = hex.length > len ? hex.slice(0, len) + "…" : hex;
    return "0x" + h;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/abi/QuizChainABI.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "QuizChainABI",
    ()=>QuizChainABI
]);
const QuizChainABI = {
    "abi": [
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "sender",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                },
                {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                }
            ],
            "name": "ERC721IncorrectOwner",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "operator",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "ERC721InsufficientApproval",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "approver",
                    "type": "address"
                }
            ],
            "name": "ERC721InvalidApprover",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "operator",
                    "type": "address"
                }
            ],
            "name": "ERC721InvalidOperator",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                }
            ],
            "name": "ERC721InvalidOwner",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "receiver",
                    "type": "address"
                }
            ],
            "name": "ERC721InvalidReceiver",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "sender",
                    "type": "address"
                }
            ],
            "name": "ERC721InvalidSender",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "ERC721NonexistentToken",
            "type": "error"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "user",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "quizId",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "bool",
                    "name": "correct",
                    "type": "bool"
                }
            ],
            "name": "AnswerVerified",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "approved",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "Approval",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "operator",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "bool",
                    "name": "approved",
                    "type": "bool"
                }
            ],
            "name": "ApprovalForAll",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "user",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "timestamp",
                    "type": "uint256"
                }
            ],
            "name": "NFTClaimed",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "user",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "score",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "timestamp",
                    "type": "uint256"
                }
            ],
            "name": "QuizCompleted",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "Transfer",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "approve",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                }
            ],
            "name": "balanceOf",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "claimNFT",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "getApproved",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getEncryptedScore",
            "outputs": [
                {
                    "internalType": "euint32",
                    "name": "",
                    "type": "bytes32"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "offset",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "limit",
                    "type": "uint256"
                }
            ],
            "name": "getPlayers",
            "outputs": [
                {
                    "internalType": "address[]",
                    "name": "",
                    "type": "address[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "operator",
                    "type": "address"
                }
            ],
            "name": "isApprovedForAll",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "name",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "nextTokenId",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "ownerOf",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "protocolId",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "pure",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "quizzes",
            "outputs": [
                {
                    "internalType": "bytes32",
                    "name": "answerHash",
                    "type": "bytes32"
                },
                {
                    "internalType": "uint32",
                    "name": "points",
                    "type": "uint32"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "safeTransferFrom",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                },
                {
                    "internalType": "bytes",
                    "name": "data",
                    "type": "bytes"
                }
            ],
            "name": "safeTransferFrom",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "scoreThreshold",
            "outputs": [
                {
                    "internalType": "uint32",
                    "name": "",
                    "type": "uint32"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "operator",
                    "type": "address"
                },
                {
                    "internalType": "bool",
                    "name": "approved",
                    "type": "bool"
                }
            ],
            "name": "setApprovalForAll",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "quizId",
                    "type": "uint256"
                },
                {
                    "internalType": "bytes32",
                    "name": "answerHash",
                    "type": "bytes32"
                },
                {
                    "internalType": "uint32",
                    "name": "points",
                    "type": "uint32"
                }
            ],
            "name": "setQuiz",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256[]",
                    "name": "quizIds",
                    "type": "uint256[]"
                },
                {
                    "internalType": "bytes32[]",
                    "name": "answerHashes",
                    "type": "bytes32[]"
                },
                {
                    "internalType": "uint32[]",
                    "name": "points",
                    "type": "uint32[]"
                }
            ],
            "name": "setQuizzes",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint32",
                    "name": "threshold",
                    "type": "uint32"
                }
            ],
            "name": "setScoreThreshold",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "bytes4",
                    "name": "interfaceId",
                    "type": "bytes4"
                }
            ],
            "name": "supportsInterface",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "symbol",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "tokenURI",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "transferFrom",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "quizId",
                    "type": "uint256"
                },
                {
                    "internalType": "bytes32",
                    "name": "answerHash",
                    "type": "bytes32"
                },
                {
                    "internalType": "externalEuint32",
                    "name": "encryptedPoints",
                    "type": "bytes32"
                },
                {
                    "internalType": "bytes",
                    "name": "inputProof",
                    "type": "bytes"
                }
            ],
            "name": "verifyAnswer",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/abi/QuizChainAddresses.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "QuizChainAddresses",
    ()=>QuizChainAddresses
]);
const QuizChainAddresses = {
    "sepolia": {
        "address": "0xbbF76887163A21F90fcBfcc942a56036953d28A5",
        "chainName": "sepolia"
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/hooks/useQuizChain.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useQuizChain",
    ()=>useQuizChain
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$providers$2f$provider$2d$browser$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/ethers/lib.esm/providers/provider-browser.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$contract$2f$contract$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/ethers/lib.esm/contract/contract.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__ = __turbopack_context__.i("[project]/node_modules/ethers/lib.esm/ethers.js [app-client] (ecmascript) <export * as ethers>");
var __TURBOPACK__imported__module__$5b$project$5d2f$fhevm$2f$internal$2f$fhevm$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/fhevm/internal/fhevm.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$quizBank$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/quizBank.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$abi$2f$QuizChainABI$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/abi/QuizChainABI.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$abi$2f$QuizChainAddresses$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/abi/QuizChainAddresses.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
function useQuizChain(params) {
    _s();
    const { ipfsCid, questionCount = 5 } = params;
    const [provider, setProvider] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(undefined);
    const [signer, setSigner] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(undefined);
    const [address, setAddress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(undefined);
    const [chainId, setChainId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(undefined);
    const [instance, setInstance] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(undefined);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(undefined);
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [allQuestions, setAllQuestions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [quiz, setQuiz] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [index, setIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [finished, setFinished] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [scoreClear, setScoreClear] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(undefined);
    const [loadingQuestions, setLoadingQuestions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [started, setStarted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [localScore, setLocalScore] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    // --- Web3 init ---
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useQuizChain.useEffect": ()=>{
            const w = window.ethereum;
            if (!w) {
                setError("MetaMask not found");
                return;
            }
            setProvider(w);
            const bp = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$providers$2f$provider$2d$browser$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BrowserProvider"](w);
            bp.getSigner().then({
                "useQuizChain.useEffect": (s)=>setSigner(s)
            }["useQuizChain.useEffect"]);
            w.request({
                method: "eth_chainId"
            }).then({
                "useQuizChain.useEffect": (h)=>setChainId(parseInt(h, 16))
            }["useQuizChain.useEffect"]);
            w.request({
                method: "eth_requestAccounts"
            }).then({
                "useQuizChain.useEffect": (accounts)=>setAddress(accounts === null || accounts === void 0 ? void 0 : accounts[0])
            }["useQuizChain.useEffect"]);
        }
    }["useQuizChain.useEffect"], []);
    // --- FHEVM instance ---
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useQuizChain.useEffect": ()=>{
            if (!provider || !chainId) return;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$fhevm$2f$internal$2f$fhevm$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createFhevmInstance"])({
                provider,
                mockChains: {
                    31337: "http://localhost:8545"
                }
            }).then({
                "useQuizChain.useEffect": (i)=>setInstance(i)
            }["useQuizChain.useEffect"]).catch({
                "useQuizChain.useEffect": (e)=>setError("Init FHEVM failed: " + e.message)
            }["useQuizChain.useEffect"]);
        }
    }["useQuizChain.useEffect"], [
        provider,
        chainId
    ]);
    const contractInfo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useQuizChain.useMemo[contractInfo]": ()=>{
            if (!chainId) return undefined;
            const n = chainId === 31337 ? "localhost" : chainId === 11155111 ? "sepolia" : undefined;
            if (!n) return undefined;
            const info = __TURBOPACK__imported__module__$5b$project$5d2f$abi$2f$QuizChainAddresses$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QuizChainAddresses"][n];
            if (!(info === null || info === void 0 ? void 0 : info.address)) return undefined;
            return info;
        }
    }["useQuizChain.useMemo[contractInfo]"], [
        chainId
    ]);
    const contract = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useQuizChain.useMemo[contract]": ()=>{
            if (!signer || !(contractInfo === null || contractInfo === void 0 ? void 0 : contractInfo.address)) return undefined;
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$contract$2f$contract$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Contract"](contractInfo.address, __TURBOPACK__imported__module__$5b$project$5d2f$abi$2f$QuizChainABI$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QuizChainABI"].abi, signer);
        }
    }["useQuizChain.useMemo[contract]"], [
        signer,
        contractInfo
    ]);
    // --- IPFS load ---
    const loadFromIPFS = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useQuizChain.useCallback[loadFromIPFS]": async ()=>{
            const buildUrls = {
                "useQuizChain.useCallback[loadFromIPFS].buildUrls": (value)=>{
                    if (!value) return [];
                    if (/^https?:\/\//i.test(value)) return [
                        value
                    ];
                    const cid = value.replace(/^ipfs:\/\//i, "").replace(/^\/ipfs\//i, "");
                    return [
                        "https://ipfs.io/ipfs/".concat(cid),
                        "https://gateway.pinata.cloud/ipfs/".concat(cid),
                        "https://cloudflare-ipfs.com/ipfs/".concat(cid),
                        "https://dweb.link/ipfs/".concat(cid)
                    ];
                }
            }["useQuizChain.useCallback[loadFromIPFS].buildUrls"];
            const urls = buildUrls(ipfsCid);
            let lastErr = undefined;
            setLoadingQuestions(true);
            for (const url of urls){
                try {
                    const res = await fetch(url, {
                        cache: "no-store"
                    });
                    const text = await res.text();
                    if (!res.ok) throw new Error("".concat(res.status, " ").concat(res.statusText));
                    const ct = (res.headers.get("content-type") || "").toLowerCase();
                    const looksJson = ct.includes("application/json") || text.trim().startsWith("[") || text.trim().startsWith("{");
                    if (!looksJson) {
                        // 该网关返回了 HTML（常见 404 网关页），尝试下一个
                        lastErr = new Error("Gateway returned non-JSON (likely HTML)");
                        continue;
                    }
                    const arr = JSON.parse(text);
                    setAllQuestions(arr);
                    return arr;
                } catch (e) {
                    lastErr = e;
                    continue;
                }
            }
            setError("Load IPFS failed: 无法从可用网关获取 JSON（请确认 CID 是否正确，或稍后重试）。" + ((lastErr === null || lastErr === void 0 ? void 0 : lastErr.message) ? " (".concat(lastErr.message, ")") : ""));
            return [];
        }
    }["useQuizChain.useCallback[loadFromIPFS]"], [
        ipfsCid
    ]);
    // 预取题库，便于在开始前显示数量并启用按钮
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useQuizChain.useEffect": ()=>{
            if (!ipfsCid) return;
            loadFromIPFS().catch({
                "useQuizChain.useEffect": ()=>{}
            }["useQuizChain.useEffect"]).finally({
                "useQuizChain.useEffect": ()=>setLoadingQuestions(false)
            }["useQuizChain.useEffect"]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["useQuizChain.useEffect"], [
        ipfsCid
    ]);
    const start = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useQuizChain.useCallback[start]": async ()=>{
            setFinished(false);
            setStarted(true);
            setScoreClear(undefined);
            setIndex(0);
            setLocalScore(0);
            const arr = allQuestions.length ? allQuestions : await loadFromIPFS();
            // 随机抽取 questionCount
            const shuffled = [
                ...arr
            ].sort({
                "useQuizChain.useCallback[start].shuffled": ()=>Math.random() - 0.5
            }["useQuizChain.useCallback[start].shuffled"]).slice(0, questionCount);
            setQuiz(shuffled);
        }
    }["useQuizChain.useCallback[start]"], [
        allQuestions,
        loadFromIPFS,
        questionCount
    ]);
    const current = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useQuizChain.useMemo[current]": ()=>quiz[index]
    }["useQuizChain.useMemo[current]"], [
        quiz,
        index
    ]);
    const answer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useQuizChain.useCallback[answer]": async (optionIndex)=>{
            if (!current) return;
            // 确保拿到用户地址（请求账户后立刻使用本地变量，避免因 setState 异步导致 address 仍为空）
            let userAddr = address;
            if (!userAddr) {
                try {
                    const w = window.ethereum;
                    if (w) {
                        const accs = await w.request({
                            method: "eth_requestAccounts"
                        });
                        userAddr = accs === null || accs === void 0 ? void 0 : accs[0];
                        if (userAddr) setAddress(userAddr);
                    }
                } catch (e) {}
            }
            if (!userAddr && signer) {
                try {
                    userAddr = await signer.getAddress();
                    if (userAddr) setAddress(userAddr);
                } catch (e) {}
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
                const ansHash = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__["ethers"].keccak256(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__["ethers"].toUtf8Bytes(choice));
                // 复合题目ID：题库+题号（仅用于链上区分不同题库，合约保持同一接口）
                const compositeId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$quizBank$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["makeCompositeIdFromCidAndQuestion"])(ipfsCid, current.id);
                const input = instance.createEncryptedInput(contract.target, userAddr);
                input.add32(10); // 每题 +10
                const enc = await input.encrypt();
                await (await contract.verifyAnswer(compositeId, ansHash, enc.handles[0], enc.inputProof)).wait();
                // 移除本地分数预览（分数仅通过解密展示）
                if (index + 1 >= quiz.length) {
                    setFinished(true);
                } else {
                    setIndex({
                        "useQuizChain.useCallback[answer]": (i)=>i + 1
                    }["useQuizChain.useCallback[answer]"]);
                }
            } catch (e) {
                setError("提交失败: " + ((e === null || e === void 0 ? void 0 : e.message) || e));
            }
        }
    }["useQuizChain.useCallback[answer]"], [
        contract,
        instance,
        address,
        signer,
        current,
        index,
        quiz.length
    ]);
    const decryptScore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useQuizChain.useCallback[decryptScore]": async ()=>{
            if (!contract || !instance || !address) return;
            try {
                const handle = await contract.getEncryptedScore();
                const relayer = instance;
                const { publicKey, privateKey } = relayer.generateKeypair();
                const startTs = Math.floor(Date.now() / 1000);
                const durationDays = 365;
                const eip712 = relayer.createEIP712(publicKey, [
                    contract.target
                ], startTs, durationDays);
                const signature = await signer.signTypedData(eip712.domain, {
                    UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification
                }, eip712.message);
                const res = await relayer.userDecrypt([
                    {
                        handle,
                        contractAddress: contract.target
                    }
                ], privateKey, publicKey, signature, [
                    contract.target
                ], address, startTs, durationDays);
                setScoreClear(String(res[handle]));
            } catch (e) {
                setError("Decrypt failed: " + (e === null || e === void 0 ? void 0 : e.message));
            }
        }
    }["useQuizChain.useCallback[decryptScore]"], [
        contract,
        instance,
        address,
        signer
    ]);
    const claim = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useQuizChain.useCallback[claim]": async ()=>{
            if (!contract) return;
            try {
                await (await contract.claimNFT()).wait();
                setMessage("NFT claimed");
            } catch (e) {
                setError("Claim failed: " + (e === null || e === void 0 ? void 0 : e.message));
            }
        }
    }["useQuizChain.useCallback[claim]"], [
        contract
    ]);
    return {
        // web3
        provider,
        signer,
        address,
        chainId,
        instance,
        // quiz state
        quiz,
        current,
        index,
        finished,
        started,
        allQuestions,
        // score
        scoreClear,
        // loading
        loadingQuestions,
        // errors
        error,
        message,
        // actions
        start,
        answer,
        decryptScore,
        claim
    };
}
_s(useQuizChain, "RneWyfqBhMbnoyZwPw5V87BJtFM=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/quiz/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>QuizPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useQuizChain$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useQuizChain.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function QuizPage() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    var _params_get;
    const cid = (_params_get = params === null || params === void 0 ? void 0 : params.get("cid")) !== null && _params_get !== void 0 ? _params_get : "";
    const qz = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useQuizChain$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuizChain"])({
        ipfsCid: cid,
        questionCount: 3
    });
    const [timeLeft, setTimeLeft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(120);
    const [selectedOption, setSelectedOption] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [showResult, setShowResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [answerResult, setAnswerResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // 计时器逻辑
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "QuizPage.useEffect": ()=>{
            if (!qz.started || qz.finished) return;
            if (timeLeft <= 0) {
                handleTimeout();
                return;
            }
            const timer = setTimeout({
                "QuizPage.useEffect.timer": ()=>setTimeLeft({
                        "QuizPage.useEffect.timer": (t)=>t - 1
                    }["QuizPage.useEffect.timer"])
            }["QuizPage.useEffect.timer"], 1000);
            return ({
                "QuizPage.useEffect": ()=>clearTimeout(timer)
            })["QuizPage.useEffect"];
        }
    }["QuizPage.useEffect"], [
        timeLeft,
        qz.started,
        qz.finished
    ]);
    // 重置计时器
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "QuizPage.useEffect": ()=>{
            setTimeLeft(120);
            setSelectedOption(null);
            setShowResult(false);
            setAnswerResult(null);
        }
    }["QuizPage.useEffect"], [
        qz.index
    ]);
    const handleTimeout = ()=>{
        qz.answer(0); // 超时默认选第一个选项
    };
    const handleAnswer = async (optionIndex)=>{
        var _qz_current, _qz_current1;
        if (selectedOption !== null) return; // 防止重复点击
        setSelectedOption(optionIndex);
        // 模拟判断正确/错误（这里简化处理，实际根据合约返回）
        const isCorrect = ((_qz_current = qz.current) === null || _qz_current === void 0 ? void 0 : _qz_current.answer) === ((_qz_current1 = qz.current) === null || _qz_current1 === void 0 ? void 0 : _qz_current1.options[optionIndex]);
        setAnswerResult(isCorrect ? "correct" : "wrong");
        setShowResult(true);
        // 延迟提交到合约，让用户看到结果动画
        setTimeout(async ()=>{
            await qz.answer(optionIndex);
            setShowResult(false);
        }, 1500);
    };
    const progressPercent = qz.quiz.length > 0 ? (qz.index + 1) / qz.quiz.length * 100 : 0;
    // 缺少 CID 提示
    if (!cid) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                minHeight: "100vh",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px"
            },
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                initial: {
                    opacity: 0,
                    y: 20
                },
                animate: {
                    opacity: 1,
                    y: 0
                },
                className: "card",
                style: {
                    maxWidth: 600,
                    width: "100%",
                    textAlign: "center",
                    padding: 40
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "neon-text",
                        style: {
                            fontSize: 36,
                            marginBottom: 24
                        },
                        children: "⚠️ 缺少题库"
                    }, void 0, false, {
                        fileName: "[project]/app/quiz/page.tsx",
                        lineNumber: 77,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            fontSize: 18,
                            marginBottom: 32,
                            color: "#aaa"
                        },
                        children: "请从首页上传题库并获取 CID，或手动输入 CID 后开始答题。"
                    }, void 0, false, {
                        fileName: "[project]/app/quiz/page.tsx",
                        lineNumber: 78,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "neon-button",
                        onClick: ()=>router.push("/"),
                        style: {
                            padding: "16px 32px",
                            fontSize: 18
                        },
                        children: "返回首页"
                    }, void 0, false, {
                        fileName: "[project]/app/quiz/page.tsx",
                        lineNumber: 81,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/quiz/page.tsx",
                lineNumber: 71,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/quiz/page.tsx",
            lineNumber: 63,
            columnNumber: 7
        }, this);
    }
    // 开始前界面
    if (!qz.started) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                minHeight: "100vh",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px"
            },
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                initial: {
                    opacity: 0,
                    scale: 0.9
                },
                animate: {
                    opacity: 1,
                    scale: 1
                },
                className: "card",
                style: {
                    maxWidth: 700,
                    width: "100%",
                    textAlign: "center",
                    padding: 40
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].h1, {
                        className: "neon-text",
                        style: {
                            fontSize: 44,
                            marginBottom: 20,
                            textShadow: "0 0 10px #00E0FF, 0 0 18px #6759FF"
                        },
                        animate: {
                            scale: [
                                1,
                                1.05,
                                1
                            ]
                        },
                        transition: {
                            repeat: Infinity,
                            duration: 2
                        },
                        children: "🎯 QuizChain 答题挑战"
                    }, void 0, false, {
                        fileName: "[project]/app/quiz/page.tsx",
                        lineNumber: 106,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            fontSize: 16,
                            marginBottom: 8,
                            color: "#9ecde0"
                        },
                        children: [
                            "题库 CID: ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    color: "#00E0FF"
                                },
                                children: [
                                    cid.slice(0, 12),
                                    "..."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/quiz/page.tsx",
                                lineNumber: 114,
                                columnNumber: 84
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/quiz/page.tsx",
                        lineNumber: 114,
                        columnNumber: 13
                    }, this),
                    qz.allQuestions.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            fontSize: 18,
                            marginBottom: 28,
                            color: "#aaa"
                        },
                        children: "正在从 IPFS 加载题目…"
                    }, void 0, false, {
                        fileName: "[project]/app/quiz/page.tsx",
                        lineNumber: 116,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            fontSize: 18,
                            marginBottom: 28,
                            color: "#9aa3b2"
                        },
                        children: [
                            "题库共 ",
                            qz.allQuestions.length,
                            " 题 · 每次随机出 ",
                            Math.min(3, qz.allQuestions.length),
                            " 题"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/quiz/page.tsx",
                        lineNumber: 118,
                        columnNumber: 13
                    }, this),
                    qz.error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            color: "#ff6b6b",
                            marginBottom: 16
                        },
                        children: qz.error
                    }, void 0, false, {
                        fileName: "[project]/app/quiz/page.tsx",
                        lineNumber: 120,
                        columnNumber: 24
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].button, {
                        className: "neon-button",
                        whileHover: {
                            scale: 1.1
                        },
                        whileTap: {
                            scale: 0.95
                        },
                        onClick: qz.start,
                        disabled: !cid || qz.allQuestions.length === 0,
                        style: {
                            padding: "18px 48px",
                            fontSize: 22,
                            fontWeight: 700
                        },
                        children: qz.allQuestions.length === 0 ? "加载中…" : "开始答题 🚀"
                    }, void 0, false, {
                        fileName: "[project]/app/quiz/page.tsx",
                        lineNumber: 121,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/quiz/page.tsx",
                lineNumber: 100,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/quiz/page.tsx",
            lineNumber: 92,
            columnNumber: 7
        }, this);
    }
    // 答题完成界面
    if (qz.finished) {
        var _qz_scoreClear;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                minHeight: "100vh",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px"
            },
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                initial: {
                    opacity: 0,
                    scale: 0.8
                },
                animate: {
                    opacity: 1,
                    scale: 1
                },
                className: "card",
                style: {
                    maxWidth: 700,
                    width: "100%",
                    textAlign: "center",
                    padding: 50
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                        animate: {
                            rotate: [
                                0,
                                10,
                                -10,
                                0
                            ]
                        },
                        transition: {
                            repeat: 3,
                            duration: 0.3
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "neon-text",
                            style: {
                                fontSize: 56,
                                marginBottom: 24
                            },
                            children: "🎉 恭喜完成！"
                        }, void 0, false, {
                            fileName: "[project]/app/quiz/page.tsx",
                            lineNumber: 157,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/quiz/page.tsx",
                        lineNumber: 153,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginBottom: 32
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    fontSize: 22,
                                    color: "#bbb",
                                    marginBottom: 12
                                },
                                children: "您的分数"
                            }, void 0, false, {
                                fileName: "[project]/app/quiz/page.tsx",
                                lineNumber: 160,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                className: "neon-text",
                                style: {
                                    fontSize: 80,
                                    fontWeight: 900
                                },
                                initial: {
                                    scale: 0
                                },
                                animate: {
                                    scale: 1
                                },
                                transition: {
                                    type: "spring",
                                    stiffness: 200
                                },
                                children: (_qz_scoreClear = qz.scoreClear) !== null && _qz_scoreClear !== void 0 ? _qz_scoreClear : '-'
                            }, void 0, false, {
                                fileName: "[project]/app/quiz/page.tsx",
                                lineNumber: 161,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    fontSize: 18,
                                    color: "#888",
                                    marginTop: 12
                                },
                                children: [
                                    "总分: ",
                                    qz.quiz.length * 10
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/quiz/page.tsx",
                                lineNumber: 170,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 20
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "neon-button",
                                    onClick: qz.decryptScore,
                                    style: {
                                        padding: "12px 28px",
                                        fontSize: 16
                                    },
                                    children: "解密并查看分数 🔐"
                                }, void 0, false, {
                                    fileName: "[project]/app/quiz/page.tsx",
                                    lineNumber: 172,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/quiz/page.tsx",
                                lineNumber: 171,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/quiz/page.tsx",
                        lineNumber: 159,
                        columnNumber: 11
                    }, this),
                    qz.scoreClear && qz.scoreClear >= 100 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: {
                            y: 20,
                            opacity: 0
                        },
                        animate: {
                            y: 0,
                            opacity: 1
                        },
                        transition: {
                            delay: 0.5
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    fontSize: 20,
                                    color: "#00E0FF",
                                    marginBottom: 20
                                },
                                children: "✨ 达到领取 NFT 条件！"
                            }, void 0, false, {
                                fileName: "[project]/app/quiz/page.tsx",
                                lineNumber: 188,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "neon-button",
                                onClick: qz.claim,
                                style: {
                                    padding: "18px 48px",
                                    fontSize: 22,
                                    marginBottom: 16
                                },
                                children: "领取 NFT 🏆"
                            }, void 0, false, {
                                fileName: "[project]/app/quiz/page.tsx",
                                lineNumber: 189,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/quiz/page.tsx",
                        lineNumber: 183,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            gap: 16,
                            justifyContent: "center",
                            marginTop: 24
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "neon-button",
                                onClick: ()=>router.push("/"),
                                style: {
                                    padding: "14px 28px"
                                },
                                children: "返回首页"
                            }, void 0, false, {
                                fileName: "[project]/app/quiz/page.tsx",
                                lineNumber: 200,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "neon-button",
                                onClick: ()=>router.push("/rank"),
                                style: {
                                    padding: "14px 28px"
                                },
                                children: "查看排行榜"
                            }, void 0, false, {
                                fileName: "[project]/app/quiz/page.tsx",
                                lineNumber: 203,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/quiz/page.tsx",
                        lineNumber: 199,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/quiz/page.tsx",
                lineNumber: 147,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/quiz/page.tsx",
            lineNumber: 139,
            columnNumber: 7
        }, this);
    }
    var _qz_scoreClear1;
    // 答题进行中
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            minHeight: "100vh",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            position: "relative"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 6,
                    background: "rgba(255,255,255,0.1)",
                    zIndex: 100
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        opacity: 0
                    },
                    animate: {
                        opacity: 1
                    },
                    style: {
                        height: "100%",
                        background: "linear-gradient(90deg, #6759FF, #00E0FF)",
                        borderRadius: 3,
                        width: "".concat(progressPercent, "%")
                    },
                    transition: {
                        duration: 0.3
                    }
                }, void 0, false, {
                    fileName: "[project]/app/quiz/page.tsx",
                    lineNumber: 225,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/quiz/page.tsx",
                lineNumber: 224,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                initial: {
                    opacity: 0,
                    scale: 0.95
                },
                animate: {
                    opacity: 1,
                    scale: 1
                },
                className: "card",
                style: {
                    maxWidth: 900,
                    width: "100%",
                    padding: 40
                },
                children: [
                    qz.error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginBottom: 16,
                            color: "#ff6b6b",
                            fontSize: 14
                        },
                        children: qz.error
                    }, void 0, false, {
                        fileName: "[project]/app/quiz/page.tsx",
                        lineNumber: 240,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 32
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontSize: 18,
                                            color: "#bbb"
                                        },
                                        children: "题目 "
                                    }, void 0, false, {
                                        fileName: "[project]/app/quiz/page.tsx",
                                        lineNumber: 247,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "neon-text",
                                        style: {
                                            fontSize: 28,
                                            fontWeight: 700
                                        },
                                        children: qz.index + 1
                                    }, void 0, false, {
                                        fileName: "[project]/app/quiz/page.tsx",
                                        lineNumber: 248,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontSize: 18,
                                            color: "#bbb"
                                        },
                                        children: [
                                            " / ",
                                            qz.quiz.length
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/quiz/page.tsx",
                                        lineNumber: 249,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/quiz/page.tsx",
                                lineNumber: 246,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                style: {
                                    fontSize: 32,
                                    fontWeight: 900,
                                    color: timeLeft <= 10 ? "#ff6b6b" : "#00E0FF",
                                    textShadow: timeLeft <= 10 ? "0 0 20px #ff6b6b" : "0 0 20px #00E0FF"
                                },
                                animate: timeLeft <= 10 ? {
                                    scale: [
                                        1,
                                        1.1,
                                        1
                                    ]
                                } : {},
                                transition: {
                                    repeat: timeLeft <= 10 ? Infinity : 0,
                                    duration: 0.5
                                },
                                children: [
                                    "⏱️ ",
                                    timeLeft,
                                    "s"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/quiz/page.tsx",
                                lineNumber: 251,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/quiz/page.tsx",
                        lineNumber: 245,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                        mode: "wait",
                        children: qz.current && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                            initial: {
                                x: 100,
                                opacity: 0
                            },
                            animate: {
                                x: 0,
                                opacity: 1
                            },
                            exit: {
                                x: -100,
                                opacity: 0
                            },
                            transition: {
                                duration: 0.3
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    style: {
                                        fontSize: 28,
                                        marginBottom: 40,
                                        lineHeight: 1.6,
                                        color: "#fff"
                                    },
                                    children: qz.current.question
                                }, void 0, false, {
                                    fileName: "[project]/app/quiz/page.tsx",
                                    lineNumber: 275,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: "grid",
                                        gap: 20
                                    },
                                    children: qz.current.options.map((option, i)=>{
                                        const isSelected = selectedOption === i;
                                        const showCorrect = showResult && answerResult === "correct" && isSelected;
                                        const showWrong = showResult && answerResult === "wrong" && isSelected;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].button, {
                                            className: "neon-button",
                                            whileHover: selectedOption === null ? {
                                                scale: 1.02,
                                                x: 10
                                            } : {},
                                            whileTap: selectedOption === null ? {
                                                scale: 0.98
                                            } : {},
                                            onClick: ()=>handleAnswer(i),
                                            disabled: selectedOption !== null,
                                            style: {
                                                padding: "20px 28px",
                                                fontSize: 20,
                                                textAlign: "left",
                                                position: "relative",
                                                overflow: "hidden",
                                                background: showCorrect ? "linear-gradient(135deg, #00E676, #00C853)" : showWrong ? "linear-gradient(135deg, #ff6b6b, #ee5a6f)" : isSelected ? "linear-gradient(135deg, #4A90E2, #357ABD)" : "linear-gradient(135deg, #6759FF, #8B7FFF)",
                                                border: isSelected ? "2px solid #fff" : "2px solid #00E0FF",
                                                cursor: selectedOption !== null ? "not-allowed" : "pointer",
                                                opacity: selectedOption !== null && !isSelected ? 0.4 : 1
                                            },
                                            animate: showCorrect || showWrong ? {
                                                scale: [
                                                    1,
                                                    1.05,
                                                    1
                                                ]
                                            } : {},
                                            transition: {
                                                duration: 0.3
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        marginRight: 12,
                                                        fontSize: 22,
                                                        fontWeight: 700
                                                    },
                                                    children: [
                                                        String.fromCharCode(65 + i),
                                                        "."
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/quiz/page.tsx",
                                                    lineNumber: 314,
                                                    columnNumber: 23
                                                }, this),
                                                option,
                                                showCorrect && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        marginLeft: 12
                                                    },
                                                    children: "✅"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/quiz/page.tsx",
                                                    lineNumber: 318,
                                                    columnNumber: 39
                                                }, this),
                                                showWrong && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        marginLeft: 12
                                                    },
                                                    children: "❌"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/quiz/page.tsx",
                                                    lineNumber: 319,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, i, true, {
                                            fileName: "[project]/app/quiz/page.tsx",
                                            lineNumber: 287,
                                            columnNumber: 21
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/app/quiz/page.tsx",
                                    lineNumber: 280,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, qz.index, true, {
                            fileName: "[project]/app/quiz/page.tsx",
                            lineNumber: 268,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/quiz/page.tsx",
                        lineNumber: 266,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: 40,
                            textAlign: "center",
                            fontSize: 18,
                            color: "#bbb"
                        },
                        children: [
                            "当前分数: ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "neon-text",
                                style: {
                                    fontSize: 24,
                                    fontWeight: 700
                                },
                                children: (_qz_scoreClear1 = qz.scoreClear) !== null && _qz_scoreClear1 !== void 0 ? _qz_scoreClear1 : '-'
                            }, void 0, false, {
                                fileName: "[project]/app/quiz/page.tsx",
                                lineNumber: 330,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/quiz/page.tsx",
                        lineNumber: 329,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/quiz/page.tsx",
                lineNumber: 233,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/quiz/page.tsx",
        lineNumber: 214,
        columnNumber: 5
    }, this);
}
_s(QuizPage, "0RpYXNGLeasDXkrinMtqsIVVBlM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"],
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useQuizChain$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuizChain"]
    ];
});
_c = QuizPage;
var _c;
__turbopack_context__.k.register(_c, "QuizPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_780400e6._.js.map