# Blockchain-Based Academic Credential Verification

A full-stack prototype for issuing and verifying tamper-evident academic credentials using blockchain.

## Problem

Fake degrees and certificates are difficult and time-consuming for employers to verify. This project provides a workflow where an authorized university issues a digital credential, stores its fingerprint on-chain, and gives the graduate a credential ID that can be verified in seconds.

## Features

- University/admin credential issuance
- SHA-256 credential fingerprinting
- Solidity smart contract for credential anchoring
- Public verification by credential ID
- Revocation support
- React frontend for issuing and verifying credentials
- Express API for local development
- Hardhat development environment
- Sample credential payloads

## Architecture

```text
University/Admin
      |
      v
React Web App -----> Express API -----> Blockchain / Smart Contract
      |                    |
      |                    +-----> Credential JSON / metadata
      |
      +-----> Employer Verification
                    |
                    v
             Credential ID + hash
                    |
                    v
             Smart Contract
                    |
                    v
          VALID / REVOKED / NOT FOUND
```

## Tech Stack

- Solidity
- Hardhat
- Node.js + Express
- React + Vite
- Ethers.js
- SHA-256 hashing

## Project Structure

```text
blockchain-academic-credential-verification/
├── contracts/
│   └── AcademicCredentialRegistry.sol
├── scripts/
│   └── deploy.js
├── test/
│   └── AcademicCredentialRegistry.test.js
├── server/
│   ├── package.json
│   └── src/
│       ├── index.js
│       └── credentialStore.js
├── client/
│   ├── package.json
│   ├── index.html
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
├── data/
│   └── sample-credential.json
├── .env.example
├── hardhat.config.js
├── package.json
├── .gitignore
└── LICENSE
```

## Quick Start

### 1. Install dependencies

```bash
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

### 2. Compile and test the contract

```bash
npm run compile
npm test
```

### 3. Start a local blockchain

In terminal 1:

```bash
npm run node
```

### 4. Deploy

In terminal 2:

```bash
npm run deploy
```

Copy the deployed contract address into the server environment.

### 5. Start the API

```bash
cd server
npm run dev
```

### 6. Start the frontend

In another terminal:

```bash
cd client
npm run dev
```

Open the Vite URL shown in the terminal.

## Credential Flow

1. University enters graduate and degree information.
2. The backend canonicalizes the credential JSON.
3. A SHA-256 fingerprint is generated.
4. The smart contract stores the fingerprint and credential ID.
5. The graduate receives the credential ID.
6. An employer submits the credential ID.
7. The system checks the blockchain record.
8. The verifier sees whether the credential exists and whether it has been revoked.

## Important Security Note

This repository is an educational prototype. A production deployment should add university identity management, wallet/key custody, role-based access control, encrypted/off-chain storage, privacy controls, audit logging, secure metadata hosting, rate limiting, smart-contract audits, and a formal credential schema such as W3C Verifiable Credentials.

Do not put sensitive student information directly on a public blockchain.

## License

MIT
