# Architecture

## Components

### 1. University Issuer

The university uses an authorized blockchain account to issue a credential fingerprint.

### 2. Credential API

The Express API:

- accepts credential JSON
- canonicalizes it
- computes SHA-256
- derives a credential ID
- sends only hashes/IDs to the contract

### 3. Blockchain Registry

The Solidity contract records:

- credential ID
- credential fingerprint
- issuer address
- issue timestamp
- revocation state

### 4. Verification Client

An employer enters a credential ID and receives a blockchain-backed status.

## Privacy Model

The prototype intentionally keeps personal information off-chain. In a production system, the credential document should be stored securely off-chain and the blockchain should anchor only a cryptographic commitment.

## Production Extensions

- W3C Verifiable Credentials
- Decentralized identifiers (DIDs)
- University wallet management
- Role-based access control
- Multi-signature issuer administration
- IPFS or secure institutional storage
- QR-code verification
- Revocation registries
- Audit logs
- Privacy-preserving proofs
