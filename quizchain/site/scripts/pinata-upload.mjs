const PINATA_JWT = process.env.PINATA_JWT;
if (!PINATA_JWT) {
  console.error("Missing PINATA_JWT env var");
  process.exit(1);
}

const body = [
  {
    id: 1,
    question: "以太坊的创始人是谁？",
    options: ["Vitalik Buterin", "Elon Musk", "Satoshi Nakamoto", "CZ"],
    answerHash: "0x" + Buffer.from("dummy", "utf-8").toString("hex"),
  },
];

const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${PINATA_JWT}`,
  },
  body: JSON.stringify({ pinataContent: body, pinataMetadata: { name: "quizchain-demo" } }),
});

if (!res.ok) {
  console.error("Pinata upload failed", await res.text());
  process.exit(1);
}

const json = await res.json();
console.log("Pinned CID:", json.IpfsHash);


