// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title AcademicCredentialRegistry
 * @notice Stores a tamper-evident fingerprint of academic credentials.
 *
 * Sensitive student data should NOT be stored on-chain.
 * Only a credential identifier, document hash and minimal issuer metadata
 * are recorded in this educational prototype.
 */
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

    event IssuerAuthorized(address indexed issuer);
    event IssuerRemoved(address indexed issuer);
    event CredentialIssued(
        bytes32 indexed credentialId,
        bytes32 indexed documentHash,
        address indexed issuer,
        uint256 issuedAt
    );
    event CredentialRevoked(
        bytes32 indexed credentialId,
        address indexed issuer,
        uint256 revokedAt
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }

    modifier onlyIssuer() {
        require(authorizedIssuers[msg.sender], "Not authorized issuer");
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedIssuers[msg.sender] = true;
    }

    function authorizeIssuer(address issuer) external onlyOwner {
        require(issuer != address(0), "Invalid issuer");
        authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer);
    }

    function removeIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = false;
        emit IssuerRemoved(issuer);
    }

    function issueCredential(
        bytes32 credentialId,
        bytes32 documentHash
    ) external onlyIssuer {
        require(credentialId != bytes32(0), "Invalid credential ID");
        require(documentHash != bytes32(0), "Invalid document hash");
        require(!credentials[credentialId].exists, "Credential already exists");

        credentials[credentialId] = Credential({
            documentHash: documentHash,
            issuer: msg.sender,
            issuedAt: block.timestamp,
            revoked: false,
            exists: true
        });

        emit CredentialIssued(
            credentialId,
            documentHash,
            msg.sender,
            block.timestamp
        );
    }

    function revokeCredential(bytes32 credentialId) external onlyIssuer {
        Credential storage credential = credentials[credentialId];

        require(credential.exists, "Credential not found");
        require(credential.issuer == msg.sender, "Only original issuer");
        require(!credential.revoked, "Already revoked");

        credential.revoked = true;
        emit CredentialRevoked(credentialId, msg.sender, block.timestamp);
    }

    function verifyCredential(bytes32 credentialId)
        external
        view
        returns (
            bool exists,
            bytes32 documentHash,
            address issuer,
            uint256 issuedAt,
            bool revoked
        )
    {
        Credential memory credential = credentials[credentialId];

        return (
            credential.exists,
            credential.documentHash,
            credential.issuer,
            credential.issuedAt,
            credential.revoked
        );
    }
}
