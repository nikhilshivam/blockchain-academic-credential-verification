const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AcademicCredentialRegistry", function () {
  async function deploy() {
    const [owner, university, stranger] = await ethers.getSigners();
    const Registry = await ethers.getContractFactory("AcademicCredentialRegistry");
    const registry = await Registry.deploy();
    await registry.waitForDeployment();
    await registry.authorizeIssuer(university.address);
    return { registry, owner, university, stranger };
  }

  it("issues and verifies a credential", async function () {
    const { registry, university } = await deploy();

    const credentialId = ethers.keccak256(ethers.toUtf8Bytes("student-001"));
    const documentHash = ethers.keccak256(
      ethers.toUtf8Bytes("credential-document")
    );

    await expect(
      registry.connect(university).issueCredential(credentialId, documentHash)
    ).to.emit(registry, "CredentialIssued");

    const result = await registry.verifyCredential(credentialId);

    expect(result.exists).to.equal(true);
    expect(result.documentHash).to.equal(documentHash);
    expect(result.issuer).to.equal(university.address);
    expect(result.revoked).to.equal(false);
  });

  it("revokes a credential", async function () {
    const { registry, university } = await deploy();

    const credentialId = ethers.keccak256(ethers.toUtf8Bytes("student-002"));
    const documentHash = ethers.keccak256(
      ethers.toUtf8Bytes("credential-document-2")
    );

    await registry.connect(university).issueCredential(credentialId, documentHash);
    await registry.connect(university).revokeCredential(credentialId);

    const result = await registry.verifyCredential(credentialId);
    expect(result.revoked).to.equal(true);
  });

  it("rejects unauthorized issuance", async function () {
    const { registry, stranger } = await deploy();

    const credentialId = ethers.keccak256(ethers.toUtf8Bytes("student-003"));
    const documentHash = ethers.keccak256(
      ethers.toUtf8Bytes("credential-document-3")
    );

    await expect(
      registry.connect(stranger).issueCredential(credentialId, documentHash)
    ).to.be.revertedWith("Not authorized issuer");
  });
});
