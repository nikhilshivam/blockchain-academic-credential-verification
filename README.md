# Blockchain-Based Academic Credential Verification

A full-stack prototype for issuing and verifying academic credentials using blockchain.

## Automatic Token ID + QR Code

When a certificate is issued, the system automatically:
1. Creates a SHA-256 fingerprint of the credential data.
2. Derives a unique Token/Credential ID from that hash.
3. Generates a QR code containing the verification URL.
4. Stores the Token ID and hash on the Solidity contract.
5. Returns the Token ID, hash, QR code, URL and transaction hash.

Flow:

`Certificate → SHA-256 Hash → Token ID → QR Code → Verification URL → Blockchain`

The QR code is a convenient way to open verification; the blockchain remains the source of verification data.

## Run
```bash
npm install
npm run compile
npm test
```

Terminal 1:
```bash
npm run node
```

Terminal 2:
```bash
npm run deploy
```

Server:
```cd server && npm install && npm run dev```

Client:
```cd client && npm install && npm run dev```

Open `http://localhost:5173`.
