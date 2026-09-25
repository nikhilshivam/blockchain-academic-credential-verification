require("dotenv").config();
const express = require("express");
const cors = require("cors");
const QRCode = require("qrcode");
const { ethers } = require("ethers");
const { hashCredential, makeCredentialId } = require("./credentialStore");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const ABI = [
  "function issueCredential(bytes32 credentialId, bytes32 documentHash) external",
  "function verifyCredential(bytes32 credentialId) external view returns (bool exists, bytes32 documentHash, address issuer, uint256 issuedAt, bool revoked)"
];

let contract;
if (CONTRACT_ADDRESS && PRIVATE_KEY) {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
}

const toBytes32 = hex => ethers.zeroPadValue("0x" + hex, 32);
const verificationUrl = tokenId =>
  `${process.env.CLIENT_URL || "http://localhost:5173"}/verify/${tokenId}`;

app.get("/api/health", (_, res) => res.json({ ok: true, blockchainConfigured: !!contract }));

app.post("/api/credentials/issue", async (req, res) => {
  try {
    const credential = req.body;
    if (!credential || typeof credential !== "object")
      return res.status(400).json({ error: "Credential data is required" });

    const documentHash = hashCredential(credential);
    const tokenId = makeCredentialId(documentHash);
    const verifyUrl = verificationUrl(tokenId);

    // Automatically generate QR code containing the verification URL.
    const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, {
      width: 320, margin: 2, errorCorrectionLevel: "M"
    });

    let transactionHash = null;
    if (contract) {
      const tx = await contract.issueCredential(toBytes32(tokenId), toBytes32(documentHash));
      const receipt = await tx.wait();
      transactionHash = receipt.hash;
    }

    res.status(201).json({
      success: true, tokenId, documentHash, qrCodeDataUrl,
      verificationUrl: verifyUrl, transactionHash
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.reason || error.shortMessage || error.message });
  }
});

app.get("/api/credentials/verify/:tokenId", async (req, res) => {
  try {
    if (!contract) return res.status(503).json({ error: "Blockchain contract is not configured" });
    const tokenId = req.params.tokenId;
    const result = await contract.verifyCredential(toBytes32(tokenId));
    res.json({
      tokenId, exists: result[0], documentHash: result[1], issuer: result[2],
      issuedAt: Number(result[3]), revoked: result[4], valid: result[0] && !result[4]
    });
  } catch (error) {
    res.status(500).json({ error: error.reason || error.shortMessage || error.message });
  }
});

app.listen(PORT, () => console.log(`Credential server running on http://localhost:${PORT}`));