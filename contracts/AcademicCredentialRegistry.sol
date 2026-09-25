// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract AcademicCredentialRegistry {
    struct Credential {
        bytes32 documentHash;
        address issuer;
        uint256 issuedAt;
        bool revoked;
        bool exists;
    }

    mapping(bytes32 => Credential) private credentials;
    mapping(address => bool) public authorizedIssuers;
    address public owner;

    event CredentialIssued(bytes32 indexed credentialId, bytes32 indexed documentHash, address indexed issuer, uint256 issuedAt);
    event CredentialRevoked(bytes32 indexed credentialId, address indexed issuer, uint256 revokedAt);

    constructor() {
        owner = msg.sender;
        authorizedIssuers[msg.sender] = true;
    }

    modifier onlyOwner() { require(msg.sender == owner, "Not contract owner"); _; }
    modifier onlyIssuer() { require(authorizedIssuers[msg.sender], "Not authorized issuer"); _; }

    function authorizeIssuer(address issuer) external onlyOwner { authorizedIssuers[issuer] = true; }
    function removeIssuer(address issuer) external onlyOwner { authorizedIssuers[issuer] = false; }

    function issueCredential(bytes32 credentialId, bytes32 documentHash) external onlyIssuer {
        require(!credentials[credentialId].exists, "Credential already exists");
        credentials[credentialId] = Credential(documentHash, msg.sender, block.timestamp, false, true);
        emit CredentialIssued(credentialId, documentHash, msg.sender, block.timestamp);
    }

    function revokeCredential(bytes32 credentialId) external onlyIssuer {
        Credential storage credential = credentials[credentialId];
        require(credential.exists, "Credential not found");
        require(credential.issuer == msg.sender, "Only original issuer");
        credential.revoked = true;
        emit CredentialRevoked(credentialId, msg.sender, block.timestamp);
    }

    function verifyCredential(bytes32 credentialId) external view returns (
        bool exists, bytes32 documentHash, address issuer, uint256 issuedAt, bool revoked
    ) {
        Credential memory c = credentials[credentialId];
        return (c.exists, c.documentHash, c.issuer, c.issuedAt, c.revoked);
    }
}