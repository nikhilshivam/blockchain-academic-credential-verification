# API

Base URL: `http://localhost:4000/api`

## Health

`GET /health`

## Generate fingerprint

`POST /credentials/hash`

Body:

```json
{
  "studentName": "Alex Morgan",
  "university": "Example University",
  "degree": "B.Tech Computer Science",
  "graduationYear": 2026
}
```

## Issue credential

`POST /credentials/issue`

The endpoint hashes the supplied credential and submits its fingerprint to the smart contract.

## Verify credential

`GET /credentials/verify/:credentialId`

Returns whether the credential exists, who issued it, when it was issued, and whether it has been revoked.
