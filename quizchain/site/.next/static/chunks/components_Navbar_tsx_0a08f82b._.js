(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/Navbar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Navbar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function Navbar() {
    _s();
    const [address, setAddress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(undefined);
    const [chainId, setChainId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(undefined);
    const [connecting, setConnecting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const w = ("TURBOPACK compile-time truthy", 1) ? window.ethereum : "TURBOPACK unreachable";
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Navbar.useEffect": ()=>{
            var _w_on, _w_on1;
            if (!w) return;
            w.request({
                method: "eth_accounts"
            }).then({
                "Navbar.useEffect": (accounts)=>{
                    setAddress(accounts === null || accounts === void 0 ? void 0 : accounts[0]);
                }
            }["Navbar.useEffect"]);
            w.request({
                method: "eth_chainId"
            }).then({
                "Navbar.useEffect": (h)=>setChainId(parseInt(h, 16))
            }["Navbar.useEffect"]);
            const onAcc = {
                "Navbar.useEffect.onAcc": (accs)=>setAddress(accs === null || accs === void 0 ? void 0 : accs[0])
            }["Navbar.useEffect.onAcc"];
            const onChain = {
                "Navbar.useEffect.onChain": (h)=>setChainId(parseInt(h, 16))
            }["Navbar.useEffect.onChain"];
            (_w_on = w.on) === null || _w_on === void 0 ? void 0 : _w_on.call(w, "accountsChanged", onAcc);
            (_w_on1 = w.on) === null || _w_on1 === void 0 ? void 0 : _w_on1.call(w, "chainChanged", onChain);
            return ({
                "Navbar.useEffect": ()=>{
                    var _w_removeListener, _w_removeListener1;
                    (_w_removeListener = w.removeListener) === null || _w_removeListener === void 0 ? void 0 : _w_removeListener.call(w, "accountsChanged", onAcc);
                    (_w_removeListener1 = w.removeListener) === null || _w_removeListener1 === void 0 ? void 0 : _w_removeListener1.call(w, "chainChanged", onChain);
                }
            })["Navbar.useEffect"];
        }
    }["Navbar.useEffect"], [
        w
    ]);
    const isSepolia = chainId === 11155111;
    const shortAddr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Navbar.useMemo[shortAddr]": ()=>address ? "".concat(address.slice(0, 6), "...").concat(address.slice(-4)) : ""
    }["Navbar.useMemo[shortAddr]"], [
        address
    ]);
    const connect = async ()=>{
        if (!w) {
            alert("请先安装 MetaMask");
            return;
        }
        setConnecting(true);
        try {
            const accounts = await w.request({
                method: "eth_requestAccounts"
            });
            setAddress(accounts === null || accounts === void 0 ? void 0 : accounts[0]);
        } finally{
            setConnecting(false);
        }
    };
    const switchToSepolia = async ()=>{
        if (!w) return;
        try {
            await w.request({
                method: "wallet_switchEthereumChain",
                params: [
                    {
                        chainId: "0xaa36a7"
                    }
                ]
            });
        } catch (e) {
            // 如果未添加网络，提示用户手动添加
            alert("请在钱包中切换到 Sepolia 网络再试。");
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            position: "sticky",
            top: 0,
            zIndex: 50,
            backdropFilter: "blur(8px)",
            background: "rgba(0,0,0,0.25)",
            borderBottom: "1px solid rgba(0,224,255,0.2)"
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                maxWidth: 1200,
                margin: "0 auto",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "neon-text",
                    style: {
                        fontWeight: 900
                    },
                    children: "QuizChain"
                }, void 0, false, {
                    fileName: "[project]/components/Navbar.tsx",
                    lineNumber: 57,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: "flex",
                        gap: 12,
                        alignItems: "center"
                    },
                    children: address ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontFamily: "monospace",
                                    color: "#00E0FF"
                                },
                                children: shortAddr
                            }, void 0, false, {
                                fileName: "[project]/components/Navbar.tsx",
                                lineNumber: 61,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    color: isSepolia ? "#7ee787" : "#ff6b6b"
                                },
                                children: isSepolia ? "Sepolia" : "Chain ".concat(chainId)
                            }, void 0, false, {
                                fileName: "[project]/components/Navbar.tsx",
                                lineNumber: 62,
                                columnNumber: 15
                            }, this),
                            !isSepolia && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "neon-button",
                                onClick: switchToSepolia,
                                style: {
                                    padding: "8px 12px"
                                },
                                children: "切到 Sepolia"
                            }, void 0, false, {
                                fileName: "[project]/components/Navbar.tsx",
                                lineNumber: 64,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "neon-button",
                        onClick: connect,
                        disabled: connecting,
                        style: {
                            padding: "8px 12px"
                        },
                        children: connecting ? "连接中…" : "连接钱包"
                    }, void 0, false, {
                        fileName: "[project]/components/Navbar.tsx",
                        lineNumber: 68,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/Navbar.tsx",
                    lineNumber: 58,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/Navbar.tsx",
            lineNumber: 56,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/Navbar.tsx",
        lineNumber: 55,
        columnNumber: 5
    }, this);
}
_s(Navbar, "Bwy4qKRa2QwcU9/Tx35uImwBwBQ=");
_c = Navbar;
var _c;
__turbopack_context__.k.register(_c, "Navbar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=components_Navbar_tsx_0a08f82b._.js.map