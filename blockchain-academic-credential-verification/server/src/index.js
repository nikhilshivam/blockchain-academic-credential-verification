require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");
const {
  hashCredential,
  makeCredentialId
} = require("./credentialStore");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const ABI = [
  "function issueCredential(bytes32 credentialId, bytes32 documentHash) external",
  "function revokeCredential(bytes32 credentialId) external",
  "function verifyCredential(bytes32 credentialId) external view returns (bool, bytes32, address, uint256, bool)"
];

function getContract(readOnly = false) {
  const provider = new ethers.JsonRpcProvider(RPC_URL);

  if (readOnly) {
    return new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
  }

  if (!process.env.ISSUER_PRIVATE_KEY) {
    throw new Error("ISSUER_PRIVATE_KEY is not configured");
  }

  const wallet = new ethers.Wallet(process.env.ISSUER_PRIVATE_KEY, provider);
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "academic-credential-server" });
});

app.post("/api/credentials/hash", (req, res) => {
  const credential = req.body;

  if (!credential || typeof credential !== "object") {
    return res.status(400).json({ error: "Credential JSON is required" });
  }

  const documentHash = hashCredential(credential);
  const credentialId = makeCredentialId(documentHash);

  res.json({
    credentialId,
    documentHash,
    message: "Fingerprint generated. No credential data was stored on-chain."
  });
});

app.post("/api/credentials/issue", async (req, res) => {
  try {
    const credential = req.body;

    if (!credential || typeof credential !== "object") {
      return res.status(400).json({ error: "Credential JSON is required" });
    }

    if (!CONTRACT_ADDRESS) {
      return res.status(500).json({ error: "CONTRACT_ADDRESS is not configured" });
    }

    const documentHash = hashCredential(credential);
    const credentialId = makeCredentialId(documentHash);

    const contract = getContract();
    const tx = await contract.issueCredential(
      ethers.id(credentialId),
      ethers.id(documentHash)
    );

    const receipt = await tx.wait();

    res.status(201).json({
      credentialId,
      documentHash,
      transactionHash: receipt.hash,
      credential
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.shortMessage || error.message || "Unable to issue credential"
    });
  }
});

app.get("/api/credentials/verify/:credentialId", async (req, res) => {
  try {
    if (!CONTRACT_ADDRESS) {
      return res.status(500).json({ error: "CONTRACT_ADDRESS is not configured" });
    }

    const contract = getContract(true);
    const credentialId = ethers.id(req.params.credentialId);

    const [exists, documentHash, issuer, issuedAt, revoked] =
      await contract.verifyCredential(credentialId);

    res.json({
      credentialId: req.params.credentialId,
      exists,
      documentHash,
      issuer,
      issuedAt: issuedAt.toString(),
      revoked,
      valid: exists && !revoked
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.shortMessage || error.message || "Verification failed"
    });
  }
});

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});
